export class SenderKeyRecord {
    static deserialize(data: any): SenderKeyRecord;
    constructor(serialized: any);
    MAX_STATES: number;
    senderKeyStates: any[];
    isEmpty(): boolean;
    getSenderKeyState(keyId: any): any;
    addSenderKeyState(id: any, iteration: any, chainKey: any, signatureKey: any): void;
    setSenderKeyState(id: any, iteration: any, chainKey: any, keyPair: any): void;
    serialize(): any[];
}
