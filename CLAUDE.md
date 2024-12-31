# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Baileys is a WebSockets-based TypeScript library for interacting with WhatsApp Web / Multi-Device. It talks directly to WhatsApp servers over a WebSocket (no Selenium/Chromium). This fork (`v5` branch) is where recent work happens — the main/stable line is `v4`. `package.json` version is `7.0.0-rc.9`.

## Commands

```bash
yarn install            # deps (packageManager: yarn@4.9.2; preinstall runs engine-requirements.js)
yarn build              # tsc -P tsconfig.build.json && tsc-esm-fix → emits lib/
yarn build:all          # build + typedoc docs
yarn lint               # tsc typecheck + eslint on src/
yarn lint:fix           # prettier format + lint --fix
yarn test               # jest on src/**/*.test.ts (ESM, ts-jest)
yarn test:e2e           # jest on src/**/*.test-e2e.ts
yarn example            # run Example/example.ts via tsx
yarn gen:protobuf       # regenerate WAProto (runs WAProto/GenerateStatics.sh)
```

- Node >= 20 required.
- Unit tests live beside code as `*.test.ts` (e.g. `src/Utils/process-message.test.ts`); e2e tests are `*.test-e2e.ts` under `src/__tests__/e2e/`. To run a single test, pass the path pattern to jest, e.g. `yarn test src/Utils/generics.test.ts` (jest `--testMatch` still applies; you can add `-t <name>` to filter by test name).
- ESLint ignores (do not edit/lint): `lib/`, `**/WAProto`, `docs/`, `proto-extract/`, `src/WABinary/index.ts`.
- `lib/` is the compiled output of `src/` and is committed; keep `src/` as the source of truth. `main`/`types` in package.json point into `lib/`.

## Architecture

The library is organized around a set of layers under `src/` that are re-exported from `src/index.ts`. The public entrypoint `makeWASocket` (default export) is defined in `src/Socket/index.ts`.

### Socket layering (the core big-picture concept)

`makeWASocket` composes **nested socket layers**. Each layer adds features on top of the one below it by calling the next `make*Socket(config)` internally and exposing a superset object (original methods plus new ones). The chain from outermost to innermost:

```
makeCommunitiesSocket (communities.ts)   ← top-level entrypoint
  └─ makeBusinessSocket   (business.ts)
       └─ makeMessagesRecvSocket (messages-recv.ts)   handle incoming messages/events
            └─ makeMessagesSocket (messages-send.ts)  send/encode messages
                 └─ makeNewsletterSocket (newsletter.ts)
                      └─ makeGroupsSocket (groups.ts)
                           └─ makeChatsSocket (chats.ts)   chats/communities, app-state sync
                                └─ makeSocket (socket.ts)  core: WS connect, noise/signal, queries
```

- `src/Socket/socket.ts` — innermost core: establishes the WebSocket + Noise handshake, performs XMPP-style queries (via `WABinary` encoding), handles pairing, and reconnects. Uses `Signal` for end-to-end encryption sessions.
- Each outer layer destructures shared state off the inner socket (`{ ev, ws, authState, query, signalRepository, ... }`) and builds on it. `ev` is the event emitter/event buffer carrying `WAMessage`s and updates.
- `Socket/Client/` contains the low-level WebSocket client wrapper.

### Supporting modules

- `src/WABinary/` — encode/decode of WhatsApp's binary XML node format, and JID parsing/encoding utilities. `BinaryNode` is the fundamental wire type.
- `src/Types/` — all shared TS types/interfaces. Key ones: `Auth` (authentication state), `Socket` (`SocketConfig`, `UserFacingSocketConfig`), `Message`, `Events`, `Chat`, `State` (app state), `Signal`.
- `src/Defaults/` — `DEFAULT_CONNECTION_CONFIG` (base socket config), constants (prekeys, TTLs), `baileys-version.json`.
- `src/Utils/` — large collection of pure-ish helpers: message encode/decode (`messages.ts`, `decode-wa-message.ts`, `process-message.ts`), media handling (`messages-media.ts`), cryptography (`crypto.ts`, `noise-handler.ts`, `signal.ts`), auth/persistence (`auth-utils.ts`, `use-multi-file-auth-state.ts`), JSON<->binary message construction (`generics.ts`), event buffering (`event-buffer.ts`), message retry (`message-retry-manager.ts`).
- `src/Signal/` — Signal Protocol implementation for end-to-end encrypted sessions (group + session encryption via `libsignal-node`).
- `src/WAM/` — `BinaryInfo.ts` for decoding binary node payloads.

### Protobuf (WAProto)

WhatsApp messages are protobuf-serialized. The generated JS/TS live in the top-level `WAProto/` directory (`index.js`, `index.d.ts`, `WAProto.proto`) — note this is **not** under `src/`. Code imports it as `../../WAProto/index.js`. `src/utils/` and socket layers construct payloads via `proto.<Message>`. Protobuf definitions are extracted at build time from WhatsApp's encrypted web bundle by an offline tool in `proto-extract/` (`index.js`), which writes `WAProto/WAProto.proto`; `yarn gen:protobuf` converts that proto into the runtime `index.js`/`index.d.ts`. Do not hand-edit generated `WAProto/index.js`/`index.d.ts`.

### Root files

- `WAProto.proto` (root), and modified `proto-extract/` are local dev/scratch artifacts on the `v5` branch, not part of the published build.
- `engine-requirements.js` — Node version gate run on install.
