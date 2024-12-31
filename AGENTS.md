# AGENTS.md: WhiskeySockets/Baileys

Rules for AI agents working on this repo. Goal: fast, accurate analysis and fixes with minimal token use.

## 0. Token discipline (highest priority)

- **Never read whole big files.** Use `Grep` first, then `Read` with `offset`/`limit` (±40 lines around the hit).
- **Never open** `WAProto/index.js`, `WAProto/index.d.ts`, `lib/`, `node_modules/`, lockfiles, `*.proto` unless the task is explicitly about them. They are huge and generated.
- Search order: symbol/regex `Grep` -> `Glob` for filename -> targeted `Read`. Do not `ls -R` or read directories blindly.
- Grep with `output_mode: files_with_matches` first, then `content` with `-n` and small `-C`.
- Do not re-read a file you just edited. Do not re-explain code back to the user.
- For wide sweeps (many files), delegate to an `Explore` subagent and keep only its conclusion.
- Answer format: **cause -> fix -> diff**. No long preambles, no recap of steps.

## 1. Project facts

- Library: unofficial WhatsApp Web (multi-device) API over WebSocket, TypeScript, ESM.
- Entry: `src/index.ts` -> `src/Socket/index.ts` (`makeWASocket`).
- Package manager: follow the lockfile that exists (yarn/npm). Do not switch it.
- Do not add dependencies unless unavoidable. Match existing code style exactly. No new abstractions.
- Never edit generated output (`lib/`, `WAProto/` generated files). Change the source or the `.proto` and regenerate.

## 2. Code map (verify with Glob before trusting; layout may shift between versions)

| Area | Path | Look here for |
|---|---|---|
| Socket core | `src/Socket/socket.ts` | WS connect, noise handshake, keepalive, pairing, QR, `query`, `sendNode`, logout |
| Chats / app state | `src/Socket/chats.ts` | presence, privacy, app-state sync, profile, `processingMutex`, event wiring |
| Send path | `src/Socket/messages-send.ts` | `relayMessage`, `sendMessage`, encryption per device, `assertSessions`, `getUSyncDevices`, retry on send |
| Receive path | `src/Socket/messages-recv.ts` | `handleMessage`, receipts, retry requests, `decryptMessage`, ack/nack, call, notification handling |
| WS transport | `src/Socket/Client/websocket.ts`, `Client/types.ts` | raw WebSocket wrapper, open/close/error events |
| Groups / communities | `src/Socket/groups.ts`, `communities.ts` | group metadata, participants, invite, join approval |
| Newsletter / business | `src/Socket/newsletter.ts`, `business.ts`, `mex.ts` | channels, business profile, GraphQL (MEX) queries |
| Auth state | `src/Utils/auth-utils.ts`, `use-multi-file-auth-state.ts` | `makeCacheableSignalKeyStore`, `addTransactionCapability`, creds/keys persistence |
| Connection validation | `src/Utils/validate-connection.ts` | login/register payload, pairing signature |
| Crypto / noise | `src/Utils/crypto.ts`, `noise-handler.ts` | AES-GCM/CBC, HKDF, curve25519, frame encode/decode |
| Message building | `src/Utils/messages.ts`, `messages-media.ts` | `generateWAMessageContent`, `generateWAMessageFromContent`, media encrypt/upload/download |
| Message decode | `src/Utils/decode-wa-message.ts`, `process-message.ts` | stanza -> WAMessage, signal decrypt, event emission |
| Event buffer | `src/Utils/event-buffer.ts` | `ev.buffer()/flush()`, merge/consolidate logic |
| Signal glue | `src/Signal/libsignal.ts`, `lid-mapping.ts` | session/identity storage, LID<->PN mapping |
| Group sender keys | `src/Signal/Group/` | sender-key record/state/chain, `group_cipher.ts`, `group-session-builder.ts`, SKDM |
| Retry / prekeys | `src/Utils/message-retry-manager.ts`, `pre-key-manager.ts` | retry counters/recent-message cache, prekey upload and rotation |
| Misc utils | `src/Utils/generics.ts`, `signal.ts`, `history.ts`, `group-history.ts`, `link-preview.ts`, `reporting-utils.ts`, `meta-ai-msmsg.ts`, `fetch-util.ts` | helpers, signal key utils, history sync, link preview, reporting token, Meta AI msg |
| WAM | `src/WAM/` | analytics buffer encode (rarely relevant) |
| Binary protocol | `src/WABinary/` | node encode/decode, JID helpers (`jidDecode`, `jidNormalizedUser`, `isLidUser`, `isJidGroup`) |
| USync | `src/WAUSync/` | contact/device/status/LID usync queries |
| Types | `src/Types/` | `SocketConfig`, `AuthenticationState`, `BaileysEventMap`, message types |
| Defaults | `src/Defaults/` | WA version, browser, URLs, default config values |

## 3. Layering to remember

Socket factories are stacked: base `makeSocket` -> chats -> (groups/newsletter) -> messages-send -> messages-recv -> business/community -> `makeWASocket`. A bug in a lower layer affects everything above. Fix at the lowest correct layer; do not patch around it in an upper one.

## 4. Fast triage playbook

Map the symptom to a starting point, then grep. Do not read broadly.

| Symptom | Start at |
|---|---|
| Connection closes / `DisconnectReason` code (401, 408, 428, 440, 500, 515) | `socket.ts` (`end`, `onClose`), `Types/index.ts` `DisconnectReason`, `lastDisconnect` handling |
| 515 right after pairing | expected restart-required; check reconnect logic, not a bug by itself |
| QR/pairing code fails | `socket.ts` `requestPairingCode`, `validate-connection.ts` |
| "Bad MAC" / "No matching sessions" / decrypt fails | `messages-recv.ts` `decryptMessage` + retry flow, `Signal/` session store, `auth-utils.ts` keys |
| Message not delivered to some devices | `messages-send.ts` `getUSyncDevices`, `assertSessions`, `participant` list, device cache |
| Stuck on "Waiting for this message" | retry receipts: `messages-recv.ts` `sendRetryRequest`, `retryRequestDelayMs`, `msgRetryCounterCache`, `getMessage` config |
| Group send fails / sender key issues | `messages-send.ts` sender-key map, `groups.ts` metadata cache |
| LID/PN mixup (`@lid` vs `@s.whatsapp.net`) | `WABinary/jid-utils.ts`, `Signal/` LID mapping, `messages-recv.ts` addressing mode fields |
| Media upload/download fails | `messages-media.ts` (hosts, auth token, encKey/mac, `fileSha256`, streaming) |
| Events missing or out of order | `event-buffer.ts`, `process-message.ts`, `chats.ts` app-state sync |
| Auth state corruption / race | `use-multi-file-auth-state.ts` (file lock/mutex), `addTransactionCapability` |
| Type error after proto change | regenerate proto, then fix `src/Types` |

## 5. Debugging method

1. Reproduce from the user's log/stack. Extract: error text, JID type, message type, library version, node version.
2. Locate the exact throw/log string with `Grep -F` (exact error message is the best anchor).
3. Trace **one** path upstream (caller) and **one** downstream (consumer). Stop when the cause is found.
4. Check WA protocol drift first for sudden breakage: changed stanza attrs, new required node, new addressing mode, new proto field. Compare against the failing stanza, not guesses.
5. Fix minimal. Preserve public API and event names (`BaileysEventMap`). Breaking change = flag it explicitly.

## 6. Conventions

- ESM, `import ... from './x.js'` (keep `.js` extensions in imports if the repo uses them).
- Use existing helpers (`jidNormalizedUser`, `generateMessageIDV2`, `encodeBase64EncodedStringForUpload`, etc.) instead of writing new ones. Grep before adding.
- Logging via the injected `logger` (pino-style: `logger.debug({ obj }, 'msg')`). Never `console.log`.
- Errors: use `Boom` as the codebase does, with `data`/status where applicable.
- Keep async flows safe: respect existing mutexes/queues (`processingMutex`, `makeKeyedMutex`, transaction wrappers). Do not introduce unguarded shared state.
- Do not widen types with `any` unless the neighboring code already does.

## 7. Verification (cheap first)

- Typecheck/build: run the repo's own script from `package.json` (`build`, `lint`, `test`). Read `scripts` only, not the whole file: `Grep '"scripts"' -A15 package.json`.
- Run only the relevant test file when tests exist; do not run the full suite for a small fix.
- No live WhatsApp login is possible in the agent sandbox. Verify by types, unit tests, and reasoning over the stanza flow. State clearly what could not be verified.

## 8. Commit & push (mandatory after every completed fix)

After a fix passes the checks in section 7, commit and push immediately. Do not ask for confirmation. Keep it short and safe:

1. `git status --short` and `git diff --stat` to confirm only intended files changed.
2. `git add <specific files>`. Never `git add -A` or `.`. Never stage `creds.json`, `auth*/`, `.env`, logs, or `lib/`.
3. Commit with these fixed dates on **every** commit, exactly in this form (never omit the env vars):
   ```
   GIT_AUTHOR_DATE="2025-01-01T00:00:00" \
   GIT_COMMITTER_DATE="2025-01-01T00:00:00" \
   git commit -m "<type>(<scope>): <summary>"
   ```
   The message uses a conventional type (`fix`, `feat`, `refactor`, `chore`, `docs`), scope = module (e.g. `fix(messages-recv): handle missing participant in retry`). Summary under 72 chars, imperative, no trailing period. Add a one-line body only if the why is not obvious.
4. `git push` on the current branch. If there is no upstream: `git push -u origin HEAD`.
5. If push is rejected: `git pull --rebase` once, resolve conflicts minimally, push again. **Never force push** (`--force`/`--force-with-lease`) and never rewrite published history.
6. Report in one line: `<short hash> <branch> pushed`. If commit or push fails, show the exact error and stop; do not improvise workarounds.

One logical fix = one commit. Unrelated changes go in separate commits.

## 9. Never

- Never commit or print session creds, keys, `creds.json`, tokens, or phone numbers from user logs.
- Never help add spam/bulk-abuse, ban-evasion, or account-takeover features.
- Never fabricate API names or file paths. If unsure, grep; if still unsure, say so.
- Never rewrite large modules for a small bug.

## 10. Output template

```
Cause: <1-2 lines, with file:line>
Fix: <what changed and why>
Diff: <minimal patch>
Risk/notes: <only if real: breaking change, unverified>
Pushed: <short hash> <branch>
```
