# caller-lite

One lazy caller for both WhatsApp VoIP stacks in this repo, built for a small VPS.

The old `caller/` brought the whole WASM stack up as soon as the socket connected:
a 9.4 MB binary, a 20-thread worker pool, a native WebRTC relay and an `ffmpeg`
process that idled even on `silence`. This module does none of that.

## What it does

- **Nothing loads until a call is placed.** `getCaller(conn)` returns instantly.
- **The light engine is the default.** `fioracall/` (zapo) is pure JS with a
  711 KB MLow codec; with no `@roamhq/wrtc` installed it dials relays over a
  plain UDP socket, so no native addon is needed at all.
- **The WASM stack is the fallback**, only started when the light engine fails
  or `CALLER_ENGINE=wasm` asks for it.
- **Everything is released again** `CALLER_IDLE_MS` after the last call ends —
  worker pool, codec, relay sockets and the WS listeners all go away.

## Usage

```js
import { getCaller, activeCaller } from '../caller-lite/index.mjs';

const caller = await getCaller(conn);          // cheap, no engine yet

const call = await caller.call('6281234567890', {
	audioSource: '/tmp/audio.ogg',             // or 'silence'
	durationMs: 5 * 60 * 1000,
});
call.on('connected', () => {});
call.on('ended', reason => {});
call.on('error', err => {});

caller.hasActiveCall();     // bool
caller.feedAudio('/tmp/a.ogg');  // queue length
caller.skipAudio();         // queue length
caller.inviteToCall({ pn, lid });
caller.reinviteGroup();     // re-issues the group offer
caller.endActiveCall();
```

Group calls go through the same object:

```js
const call = await caller.callGroup(groupJid, { participants, audioSource, durationMs });
```

### Compatibility shims

```js
import { activeCaller, getFioraCaller } from '../caller-lite/index.mjs';
```

- `activeCaller()` — the same singleton, with `hasActiveCall / feedAudio /
  skipAudio / endActiveCall`.
- `getFioraCaller(conn)` — the same `{ conn, driver, caller }` shape as
  `fioracall/driver.mjs`. `caller.getCalls()` reports calls that are already
  running instead of booting the engine; `caller.startCall()` boots it.
  `driver` is only present while the engine is up.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `CALLER_ENGINE` | `auto` | `auto` = light first, WASM on failure · `fiora` · `wasm` |
| `CALLER_IDLE_MS` | `60000` | Release every engine this long after the last call ends. `0` = never |
| `CALLER_RING_TIMEOUT_MS` | `120000` | End a call that never goes active |
| `CALLER_RAW_UDP` | auto | `1` = always dial relays over plain UDP (no `@roamhq/wrtc`); auto = on when wrtc is missing |
| `CALLER_PTHREAD_POOL` | `20` | Worker threads for the WASM engine only |
| `CALLER_LOG_LEVEL` | `error` | zapo log level |

## Cost

| | idle | during a call |
|---|---|---|
| before | WASM + 20 workers + relay + ffmpeg | same |
| after | bot only | one engine, released `CALLER_IDLE_MS` after the call |

## Migrating a handler

Two import lines change:

```diff
- import { getCaller, activeCaller } from '../lib/caller/attach.js';
+ import { getCaller, activeCaller, getFioraCaller } from '../lib/caller-lite/index.mjs';

- const { getFioraCaller } = await import('../lib/caller/fioracall/driver.mjs');
```

Everything else — `call`, `callGroup`, `feedAudio`, `skipAudio`, `inviteToCall`,
`reinviteGroup`, `endActiveCall`, and the `getFioraCaller().caller` surface —
keeps its shape. Copy `caller-lite/` next to `caller/` (it imports
`../caller/…` at call time).
