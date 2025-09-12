export function makeSocket(config: any): {
    type: string;
    ws: WebSocketClient;
    ev: {
        process(handler: any): () => void;
        emit(event: any, evData: any): any;
        isBuffering(): boolean;
        buffer: () => void;
        flush: () => boolean;
        createBufferedFunction(work: any): (...args: any[]) => Promise<any>;
        on: (...args: any[]) => any;
        off: (...args: any[]) => any;
        removeAllListeners: (...args: any[]) => any;
    };
    authState: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => Promise<any>;
            set: (data: any) => Promise<void>;
            isInTransaction: () => boolean;
            transaction(work: any, key: any): Promise<any>;
        };
    };
    signalRepository: any;
    readonly user: any;
    generateMessageTag: () => string;
    query: (node: any, timeoutMs: any) => Promise<any>;
    waitForMessage: (msgId: any, timeoutMs?: any) => Promise<any>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: any) => Promise<void>;
    sendNode: (frame: any) => Promise<void>;
    logout: (msg: any) => Promise<void>;
    end: (error: any) => void;
    onUnexpectedError: (err: any, msg: any) => void;
    uploadPreKeys: (count?: number, retryCount?: number) => Promise<any>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    requestPairingCode: (phoneNumber: any, code: any) => Promise<any>;
    /** Waits for the connection to WA to reach a state */
    waitForConnectionUpdate: (check: any, timeoutMs: any) => Promise<void>;
    sendWAMBuffer: (wamBuffer: any) => Promise<any>;
    executeUSyncQuery: (usyncQuery: any) => Promise<any>;
    onWhatsApp: (...jids: any[]) => Promise<any>;
};
import { WebSocketClient } from "./Client";
