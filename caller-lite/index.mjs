/**
 * caller-lite — one lazy caller for both VoIP engines.
 *
 *   import { getCaller, activeCaller } from '../caller-lite/index.mjs'
 *
 *   const caller = await getCaller(conn)      // cheap: no engine yet
 *   const call = await caller.call(number, { audioSource, durationMs })
 *   call.on('connected', …) / call.on('ended', reason => …)
 *
 * The light zapo stack is the default engine; the WhatsApp WASM stack only
 * comes up when it is asked for or when the light one fails. Both are released
 * again `CALLER_IDLE_MS` after the last call ends.
 */
import { LiteCaller } from './caller.mjs';

let instance = null;

/** The caller for this socket, created on first use. */
export function getCaller(conn) {
	if (!conn) throw new Error('getCaller(conn) needs a socket');
	if (instance?.conn !== conn) {
		const previous = instance;
		instance = new LiteCaller(conn);
		if (previous) void previous.release();
	}
	return instance;
}

/** The caller of the last `getCaller`, or null before the first one. */
export function activeCaller() {
	return instance ?? null;
}

/**
 * Drop-in for `fioracall/driver.mjs#getFioraCaller`: the same `{ conn, driver, caller }`
 * shape, with one difference — `caller.getCalls()` reports what is already running
 * instead of booting the engine, and `driver` is only there while it is up.
 */
export function getFioraCaller(conn) {
	const lite = getCaller(conn);
	const caller = {
		getCalls: () => lite.getCalls(),
		getCall: callId => lite.getCall(callId),
		startCall: opts => lite.startCall(opts),
		endCall: (callId, reason) => lite.endCall(callId, reason),
		loadAudio: (callId, audioPath) => lite.loadAudio(callId, audioPath),
		setMute: (callId, muted) => lite.setMute(callId, muted),
	};
	return Promise.resolve({
		conn,
		get driver() { return lite.fioraDriver; },
		caller,
	});
}

export { LiteCaller } from './caller.mjs';
export { Call, CallState } from './call.mjs';
