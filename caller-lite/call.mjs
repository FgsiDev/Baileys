import { EventEmitter } from 'node:events';

/** Numeric call states — same values the WhatsApp WASM stack reports. */
export const CallState = {
	Idle: 0,
	Calling: 1,
	PreacceptReceived: 2,
	ReceivedCall: 3,
	AcceptSent: 4,
	AcceptReceived: 5,
	Active: 6,
	ActiveElsewhere: 7,
	Ending: 13,
};

const FIORA_STATE = {
	initiating: CallState.Calling,
	ringing: CallState.PreacceptReceived,
	incoming_ringing: CallState.ReceivedCall,
	connecting: CallState.AcceptSent,
	active: CallState.Active,
	on_hold: CallState.Active,
	ended: CallState.Idle,
};

export const toNumericState = state => FIORA_STATE[state] ?? CallState.Idle;

/** Account jid of one participant, whatever shape the caller handed us. */
export const participantJid = p => (typeof p === 'string' ? p : p?.jid || p?.lid || p?.pn || '');

/** Participants as the zapo group offer wants them: `{ jid }`, devices resolved by the engine. */
export const toFioraParticipants = list => (Array.isArray(list) ? list : [])
	.map(p => (typeof p === 'string' ? { jid: p } : p))
	.map(p => ({ jid: participantJid(p), ...(p.devices?.length ? { devices: p.devices } : {}) }))
	.filter(p => p.jid);

/**
 * One live call, on either engine.
 *
 * Emits `ringing`, `connected`, `ended(reason)` and `error` — the same surface
 * the old `ActiveCall` had, so a handler written against it keeps working.
 */
export class Call extends EventEmitter {
	callId;
	engine;   // 'fiora' | 'wasm'
	ops;      // { endCall(callId), mute(callId, muted) }
	group;    // { groupJid, participants } when this is a group call
	source;

	#state = CallState.Calling;
	#ended = false;
	#timer = null;
	#ringTimer = null;
	#endResolve;
	#endedPromise;

	constructor({ callId, engine, ops, durationMs = 0, ringTimeoutMs = 0, group = null, source = 'silence' }) {
		super();
		this.callId = callId;
		this.engine = engine;
		this.ops = ops;
		this.group = group;
		this.source = source;
		this.#endedPromise = new Promise(resolve => { this.#endResolve = resolve; });
		if (durationMs > 0) this.#timer = setTimeout(() => this.end(), durationMs);
		if (ringTimeoutMs > 0) {
			this.#ringTimer = setTimeout(() => {
				if (this.#state !== CallState.Active) this.end();
			}, ringTimeoutMs);
		}
		this.#timer?.unref?.();
		this.#ringTimer?.unref?.();
	}

	get state() { return this.#state; }
	get ended() { return this.#ended; }

	waitForEnd() { return this.#endedPromise; }

	/** Events of a raw engine handle (the WASM `ActiveCall`) into this call. */
	bindHandle(handle) {
		if (!handle?.on) return;
		handle.on('ringing', () => this._setState(CallState.PreacceptReceived));
		handle.on('connected', () => this._setState(CallState.Active));
		handle.on('ended', reason => this._end(reason || 'ended'));
		handle.on('error', err => this._error(err));
	}

	/** Internal: a numeric state arrived from an engine. */
	_setState(state) {
		if (this.#ended) return;
		const prev = this.#state;
		this.#state = state;
		if (state === CallState.Active) {
			if (this.#ringTimer) {
				clearTimeout(this.#ringTimer);
				this.#ringTimer = null;
			}
			if (prev !== CallState.Active) this.emit('connected');
		}
		else if (state === CallState.PreacceptReceived && prev !== state) {
			this.emit('ringing');
		}
		else if (state === CallState.Idle) {
			this._end('ended');
		}
	}

	/** Internal: the engine reports the call over. */
	_end(reason = 'ended') {
		if (this.#ended) return;
		this.#ended = true;
		this.#state = CallState.Idle;
		if (this.#timer) { clearTimeout(this.#timer); this.#timer = null; }
		if (this.#ringTimer) { clearTimeout(this.#ringTimer); this.#ringTimer = null; }
		this.emit('ended', reason);
		this.#endResolve(reason);
	}

	/** Internal: a non-fatal engine error. */
	_error(err) {
		if (this.#ended || !this.listenerCount('error')) return;
		this.emit('error', err);
	}

	end() {
		if (this.#ended) return;
		try {
			Promise.resolve(this.ops?.endCall?.(this.callId)).catch(() => {});
		}
		catch { }
		this._end('hangup');
	}

	mute(muted) {
		try {
			Promise.resolve(this.ops?.mute?.(this.callId, muted)).catch(() => {});
		}
		catch { }
	}
}
