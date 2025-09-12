import WebSocket from "ws";
import { DEFAULT_ORIGIN } from "../../Defaults";
import { AbstractSocketClient } from "./types";
export class WebSocketClient extends AbstractSocketClient {
    constructor() {
        super(...arguments);
        this.socket = null;
    }
    get isOpen() {
        var _a;
        return ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN;
    }
    get isClosed() {
        var _a;
        return this.socket === null || ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.CLOSED;
    }
    get isClosing() {
        var _a;
        return (this.socket === null || ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.CLOSING);
    }
    get isConnecting() {
        var _a;
        return ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.CONNECTING;
    }
    async connect() {
        var _a, _b;
        if (this.socket) {
            return;
        }
        this.socket = new WebSocket(this.url, {
            origin: DEFAULT_ORIGIN,
            headers: (_a = this.config.options) === null || _a === void 0 ? void 0 : _a.headers,
            handshakeTimeout: this.config.connectTimeoutMs,
            timeout: this.config.connectTimeoutMs,
            agent: this.config.agent,
        });
        this.socket.setMaxListeners(0);
        const events = [
            "close",
            "error",
            "upgrade",
            "message",
            "open",
            "ping",
            "pong",
            "unexpected-response",
        ];
        for (const event of events) {
            (_b = this.socket) === null || _b === void 0 ? void 0 : _b.on(event, (...args) => this.emit(event, ...args));
        }
    }
    async close() {
        if (!this.socket) {
            return;
        }
        this.socket.close();
        this.socket = null;
    }
    async restart() {
        if (this.socket) {
            await new Promise((resolve) => {
                var _a, _b, _c, _d;
                (_b = (_a = this.socket) === null || _a === void 0 ? void 0 : _a.once) === null || _b === void 0 ? void 0 : _b.call(_a, "close", resolve);
                (_d = (_c = this.socket) === null || _c === void 0 ? void 0 : _c.terminate) === null || _d === void 0 ? void 0 : _d.call(_c);
            });
            this.socket = null;
        }
        this.connect();
    }
    send(str, cb) {
        var _a;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(str, cb);
        return Boolean(this.socket);
    }
}
