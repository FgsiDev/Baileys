export function makeSocket(config: any): {
    type: string;
    ws: any;
    ev: any;
    authState: {
        creds: any;
        keys: any;
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
    uploadPreKeys: (count?: any, retryCount?: number) => Promise<any>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    requestPairingCode: (phoneNumber: any, customPairingCode: any) => Promise<any>;
    /** Waits for the connection to WA to reach a state */
    waitForConnectionUpdate: any;
    sendWAMBuffer: (wamBuffer: any) => Promise<any>;
    executeUSyncQuery: (usyncQuery: any) => Promise<any>;
    onWhatsApp: (...jids: any[]) => Promise<any>;
};
