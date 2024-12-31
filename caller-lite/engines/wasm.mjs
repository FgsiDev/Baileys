import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';

const CALLER_DIR = fileURLToPath(new URL('../../caller', import.meta.url));
const INDEX_URL = new URL('../../caller/index.mjs', import.meta.url);

/**
 * The WhatsApp Web WASM stack: 9.4 MB binary plus a worker-thread pool, so it
 * is only brought up when a call actually needs it and torn down afterwards.
 */
export class WasmEngine extends EventEmitter {
	conn;
	voip = null;

	constructor(conn) {
		super();
		this.conn = conn;
	}

	get up() { return !!this.voip; }

	async start() {
		if (this.voip) return this;
		const { VoipClient } = await import(INDEX_URL);
		const voip = new VoipClient({ authDir: '', resourcesPath: CALLER_DIR });
		await voip.connect(this.conn);
		this.voip = voip;
		return this;
	}

	async startCall1({ peerJid, audioFile, durationMs }) {
		const number = String(peerJid).split('@')[0].split(':')[0];
		const handle = await this.voip.call(number, {
			audioSource: audioFile || 'silence',
			...(durationMs > 0 ? { durationMs } : {}),
		});
		return { callId: handle.callId, handle };
	}

	async startGroup({ groupJid, participants, audioFile, durationMs, chatName, lightweight }) {
		const handle = await this.voip.callGroup(groupJid, {
			participants,
			lightweight: !!lightweight,
			audioSource: audioFile || 'silence',
			...(durationMs > 0 ? { durationMs } : {}),
			...(chatName ? { chatName } : {}),
		});
		return { callId: handle.callId, handle };
	}

	endCall() {
		try { return !!this.voip?.endActiveCall(); }
		catch { return false; }
	}

	// Mute lives on the call handle; `Call` wires it there for this engine.
	mute() { }

	feedAudio(filePath) { return this.voip?.feedAudio(filePath) ?? 0; }

	skipAudio() { return this.voip?.skipAudio() ?? 0; }

	getCalls() { return []; }

	getCall() { return null; }

	/** The WASM stack has no re-invite API. */
	reinvite() { return Promise.resolve(false); }

	invite(target = {}) {
		try {
			this.voip?.inviteToCall(target);
			return true;
		}
		catch {
			return false;
		}
	}

	dispose() {
		const voip = this.voip;
		this.voip = null;
		this.removeAllListeners();
		if (!voip) return;
		try { voip.endActiveCall(); }
		catch { }
		// Leaves the caller's socket alone; releases the worker pool and the WASM memory.
		try { voip.disconnect(); }
		catch { }
	}
}
