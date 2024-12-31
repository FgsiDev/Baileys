import { EventEmitter } from 'node:events';
import { Call, CallState, participantJid, toNumericState } from './call.mjs';
import { FioraEngine } from './engines/fiora.mjs';
import { WasmEngine } from './engines/wasm.mjs';

const env = (name, fallback) => {
	const value = process.env[name];
	return value === undefined || value === '' ? fallback : value;
};

/** auto = light stack first, WASM only if it fails or is asked for. */
const MODE = env('CALLER_ENGINE', 'auto').toLowerCase();
const IDLE_MS = Number(env('CALLER_IDLE_MS', '60000'));
const RING_TIMEOUT_MS = Number(env('CALLER_RING_TIMEOUT_MS', '120000'));

const toBare = jid => {
	const value = String(jid ?? '');
	const at = value.indexOf('@');
	return at < 0 ? value : `${value.slice(0, at).split(':')[0]}${value.slice(at)}`;
};

/**
 * One caller per WhatsApp socket.
 *
 * Nothing heavy is imported until a call is placed: the engine comes up on the
 * first call and goes back down `CALLER_IDLE_MS` after the last one ends, so a
 * bot that rarely calls keeps the WASM pool, the codec and the relay sockets
 * out of memory.
 */
export class LiteCaller extends EventEmitter {
	conn;
	#fiora = null;
	#wasm = null;
	#calls = new Set();
	#queue = [];
	#playing = false;
	#releaseTimer = null;

	constructor(conn) {
		super();
		this.conn = conn;
	}

	/** The zapo driver, only while its engine is up. */
	get fioraDriver() { return this.#fiora?.driver ?? null; }

	activeCalls() { return [...this.#calls].filter(call => !call.ended); }

	hasActiveCall() { return this.activeCalls().length > 0; }

	// ─── placing calls ────────────────────────────────────────────────────────

	async call(number, opts = {}) {
		const digits = String(number ?? '').replace(/\D/g, '');
		if (!digits) throw new Error('call() needs a phone number');
		return this.#place({
			peerJid: `${digits}@s.whatsapp.net`,
			audioFile: opts.audioSource,
			durationMs: opts.durationMs || 0,
		});
	}

	async callGroup(groupJid, opts = {}) {
		const target = String(groupJid ?? '');
		if (!target) throw new Error('callGroup() needs a group jid');
		const participants = opts.participants || [];
		if (!participants.length) throw new Error('group call needs at least one participant');
		return this.#place({
			group: { groupJid: target, participants },
			audioFile: opts.audioSource,
			durationMs: opts.durationMs || 0,
			extra: { chatName: opts.chatName, lightweight: opts.lightweight },
		});
	}

	async #place({ peerJid = null, group = null, audioFile, durationMs = 0, extra = {} }) {
		const attempt = async name => {
			const engine = name === 'fiora' ? await this.#ensureFiora() : await this.#ensureWasm();
			const started = group
				? await engine.startGroup({ groupJid: group.groupJid, participants: group.participants, audioFile, durationMs, ...extra })
				: await engine.startCall1({ peerJid, audioFile, durationMs });
			return this.#launch(name, engine, started, { durationMs, group });
		};
		if (MODE === 'wasm') return attempt('wasm');
		if (MODE === 'fiora') return attempt('fiora');
		try {
			return await attempt('fiora');
		}
		catch (err) {
			this.#emitError(err);
			return attempt('wasm');
		}
	}

	#launch(name, engine, started, { durationMs, group }) {
		const call = new Call({
			callId: started.callId,
			engine: name,
			ops: engine,
			durationMs,
			ringTimeoutMs: RING_TIMEOUT_MS,
			group,
		});
		if (started.handle) {
			call.bindHandle(started.handle);
			call.ops = {
				endCall: () => started.handle.end(),
				mute: (_callId, muted) => started.handle.mute(muted),
			};
		}
		this.#calls.add(call);
		call.on('ended', () => {
			this.#calls.delete(call);
			if (this.#queue.length) this.#queue = [];
			this.#playing = false;
			this.#scheduleRelease();
		});
		return call;
	}

	// ─── engines ──────────────────────────────────────────────────────────────

	async #ensureFiora() {
		if (!this.#fiora) {
			this.#fiora = new FioraEngine(this.conn);
			this.#fiora.on('state', (callId, state) => {
				this.#find(callId)?._setState(toNumeric(state));
			});
			this.#fiora.on('ended', (callId, reason) => this.#find(callId)?._end(reason));
			this.#fiora.on('audio-finished', callId => {
				if (this.#active()?.callId === callId) {
					this.#playing = false;
					void this.#playNext();
				}
			});
			this.#fiora.on('error', err => this.#emitError(err));
		}
		await this.#fiora.start();
		return this.#fiora;
	}

	async #ensureWasm() {
		if (!this.#wasm) this.#wasm = new WasmEngine(this.conn);
		await this.#wasm.start();
		return this.#wasm;
	}

	// ─── audio ────────────────────────────────────────────────────────────────

	/** Queue a file on the live call. Returns how many are still waiting. */
	feedAudio(filePath) {
		if (!filePath) return this.#queue.length;
		const call = this.#active();
		if (!call) return 0;
		if (call.engine === 'wasm') return this.#wasm.feedAudio(filePath);
		this.#queue.push(filePath);
		if (!this.#playing) void this.#playNext();
		return this.#queue.length;
	}

	/** Drop the file playing now and start the next queued one. */
	skipAudio() {
		const call = this.#active();
		if (!call) return 0;
		if (call.engine === 'wasm') return this.#wasm.skipAudio();
		this.#playing = false;
		void this.#playNext();
		return this.#queue.length;
	}

	async #playNext() {
		const call = this.#active();
		if (!call || call.engine !== 'fiora' || !this.#fiora?.up) return;
		const next = this.#queue.shift();
		if (!next) {
			this.#playing = false;
			return;
		}
		try {
			await this.#fiora.loadAudio(call.callId, next);
			this.#playing = true;
		}
		catch (err) {
			this.#playing = false;
			this.#emitError(err);
		}
	}

	// ─── controlling the live call ────────────────────────────────────────────

	endActiveCall() {
		const calls = this.activeCalls();
		for (const call of calls) call.end();
		return calls.length > 0;
	}

	/** Add someone to the running group call (re-issues the group offer). */
	inviteToCall(target = {}) {
		const call = this.#active();
		if (!call) return false;
		const pn = target.pn ? toBare(target.pn) : '';
		const lid = target.lid ? toBare(target.lid) : '';
		if (call.engine === 'wasm') return this.#wasm.invite({ pn, lid });
		if (!call.group) return false;
		const jid = lid || pn;
		if (!jid) return false;
		const list = call.group.participants;
		if (!list.some(p => participantJid(p) === jid)) list.push({ jid });
		void this.#reinvite(call);
		return true;
	}

	/** Re-issue the offer of the live group call. False when there is nothing to re-send. */
	reinviteGroup() {
		const call = this.#active();
		if (!call?.group || call.engine !== 'fiora') return false;
		void this.#reinvite(call);
		return true;
	}

	async #reinvite(call) {
		try {
			await this.#fiora.reinvite(call.callId, call.group.groupJid, call.group.participants);
		}
		catch (err) {
			this.#emitError(err);
		}
	}

	// ─── coordinator-shaped facade (drop-in for getFioraCaller) ───────────────

	getCalls() { return this.#fiora?.up ? this.#fiora.getCalls() : []; }

	getCall(callId) { return this.#fiora?.up ? this.#fiora.getCall(callId) : null; }

	/** Starts the light engine on demand; resolves with the call id. */
	async startCall(opts = {}) {
		const engine = await this.#ensureFiora();
		const group = opts.groupJid
			? { groupJid: String(opts.groupJid), participants: opts.participants || [] }
			: null;
		const started = group
			? await engine.startGroup({ groupJid: group.groupJid, participants: group.participants, audioFile: opts.audioFile })
			: await engine.startCall1({ peerJid: opts.peerJid, audioFile: opts.audioFile });
		this.#launch('fiora', engine, started, { durationMs: opts.durationMs || 0, group });
		return started.callId;
	}

	async endCall(callId, reason) {
		const call = this.#find(callId);
		if (call) {
			call.end();
			return true;
		}
		if (!this.#fiora?.up) return false;
		return this.#fiora.endCall(callId, reason);
	}

	async loadAudio(callId, audioPath) {
		if (!this.#fiora?.up || !audioPath) return false;
		if (this.#active()?.callId === callId) this.#playing = true;
		await this.#fiora.loadAudio(callId, audioPath);
		return true;
	}

	setMute(callId, muted) {
		this.#fiora?.mute(callId, muted);
	}

	// ─── lifecycle ────────────────────────────────────────────────────────────

	#active() { return this.activeCalls()[0] ?? null; }

	#find(callId) {
		for (const call of this.#calls) if (call.callId === callId) return call;
		return null;
	}

	#scheduleRelease() {
		if (IDLE_MS <= 0 || this.#calls.size || this.#releaseTimer) return;
		this.#releaseTimer = setTimeout(() => {
			this.#releaseTimer = null;
			if (!this.#calls.size) void this.release();
		}, IDLE_MS);
		this.#releaseTimer.unref?.();
	}

	/** Bring every engine down now; the next call starts them again. */
	async release() {
		if (this.#releaseTimer) {
			clearTimeout(this.#releaseTimer);
			this.#releaseTimer = null;
		}
		this.#queue = [];
		this.#playing = false;
		const fiora = this.#fiora;
		const wasm = this.#wasm;
		this.#fiora = null;
		this.#wasm = null;
		if (fiora) {
			try { fiora.dispose(); }
			catch (err) { this.#emitError(err); }
		}
		if (wasm) {
			try { wasm.dispose(); }
			catch (err) { this.#emitError(err); }
		}
		this.emit('released');
	}

	#emitError(err) {
		if (this.listenerCount('error')) this.emit('error', err);
	}
}

const toNumeric = state => (typeof state === 'number' ? state : toNumericState(state));

export { Call, CallState };
