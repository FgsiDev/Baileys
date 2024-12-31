import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import { toFioraParticipants } from '../call.mjs';

const DRIVER_URL = new URL('../../caller/fioracall/driver.mjs', import.meta.url);
const GROUP_OFFER_URL = new URL('../../caller/fioracall/node_modules/@zapo-js/voip/dist/signaling/group-call.js', import.meta.url);

const envFlag = (name, fallback) => {
	const raw = process.env[name];
	if (raw === undefined || raw === '') return fallback;
	return raw === '1' || raw === 'true' || raw === 'on';
};

const hasWrtc = () => {
	try {
		createRequire(import.meta.url).resolve('@roamhq/wrtc');
		return true;
	}
	catch {
		return false;
	}
};

/**
 * The zapo stack: pure JS signaling, MLow codec in a 711 KB wasm, media over a
 * plain UDP socket. Emits `state`, `ended`, `audio-finished`, `incoming`, `error`.
 */
export class FioraEngine extends EventEmitter {
	conn;
	handle = null;
	driver = null;
	coordinator = null;
	#listeners = [];

	constructor(conn) {
		super();
		this.conn = conn;
	}

	get up() { return !!this.handle; }

	async start() {
		if (this.handle) return this;
		const { getFioraCaller } = await import(DRIVER_URL);
		const options = {
			useRawUdpTransport: envFlag('CALLER_RAW_UDP', !hasWrtc()),
			logLevel: process.env.CALLER_LOG_LEVEL || 'error',
		};
		this.handle = await getFioraCaller(this.conn, options);
		this.driver = this.handle.driver;
		this.coordinator = this.handle.caller;

		const onState = info => this.emit('state', info.callId, info.stateData?.state, info);
		const onEnded = info => this.emit('ended', info.callId, info.stateData?.endReason || 'ended', info);
		const onAudioFinished = info => this.emit('audio-finished', info.callId, info);
		const onError = err => this.emit('error', err);
		this.#listeners = [
			['call_state', onState],
			['call_ended', onEnded],
			['call_outbound_audio_finished', onAudioFinished],
		];
		for (const [event, fn] of this.#listeners) this.coordinator.on(event, fn);
		this.handle.client?.on?.('voip_call_error', onError);
		this.#listeners.push(['client:voip_call_error', onError]);
		return this;
	}

	async startCall1({ peerJid, audioFile }) {
		const callId = await this.coordinator.startCall({
			peerJid,
			...(audioFile && audioFile !== 'silence' ? { audioFile } : {}),
		});
		return { callId };
	}

	async startGroup({ groupJid, participants, audioFile }) {
		const list = toFioraParticipants(participants);
		const callId = await this.coordinator.startCall({
			groupJid,
			participants: list,
			...(audioFile && audioFile !== 'silence' ? { audioFile } : {}),
		});
		return { callId };
	}

	endCall(callId, reason) {
		if (!this.up) return Promise.resolve(false);
		const why = typeof reason === 'string' ? reason : 'user_ended';
		return Promise.resolve(this.coordinator.endCall(callId, why)).then(() => true).catch(() => false);
	}

	mute(callId, muted) {
		try { this.coordinator?.setMute(callId, !!muted); }
		catch { }
	}

	loadAudio(callId, audioPath) {
		return this.coordinator.loadAudio(callId, audioPath);
	}

	getCalls() { return this.up ? this.coordinator.getCalls() : []; }

	getCall(callId) { return this.up ? this.coordinator.getCall(callId) : null; }

	/** Re-issue the group offer — refreshes relays and rings anyone newly listed. */
	async reinvite(callId, groupJid, participants) {
		if (!this.up || !groupJid) return false;
		const mod = await import(GROUP_OFFER_URL);
		const build = mod.buildGroupOfferStanza || mod.default?.buildGroupOfferStanza;
		if (!build) return false;
		const { node } = await build(
			this.driver.deps,
			callId,
			groupJid,
			toFioraParticipants(participants),
			false,
			this.driver.logger
		);
		await this.driver.deps.lowLevelCoordinator.sendNode(node);
		return true;
	}

	dispose() {
		const handle = this.handle;
		this.handle = null;
		this.driver = null;
		this.coordinator = null;
		this.#listeners = [];
		this.removeAllListeners();
		if (!handle) return;
		const ws = this.conn?.ws;
		const off = (event, fn) => {
			if (!ws || !fn) return;
			try { (ws.off || ws.removeListener)?.call(ws, event, fn); }
			catch { }
		};
		off('CB:call', handle.onCall);
		off('CB:ack', handle.onAck);
		off('CB:receipt', handle.onReceipt);
		try { handle.client?.removeAllListeners?.('voip_call_error'); }
		catch { }
		try { handle.driver?.coordinator?.dispose(); }
		catch { }
		if (global.__zapoCaller?.conn === this.conn) {
			try { delete global.__zapoCaller; }
			catch { global.__zapoCaller = undefined; }
		}
	}
}
