export class SenderKeyState {
    constructor(id: any, iteration: any, chainKey: any, signatureKeyPair: any, signatureKeyPublic: any, signatureKeyPrivate: any, senderKeyStateStructure: any);
    MAX_MESSAGE_KEYS: number;
    senderKeyStateStructure: any;
    getKeyId(): any;
    getSenderChainKey(): any;
    setSenderChainKey(chainKey: any): void;
    getSigningKeyPublic(): any;
    getSigningKeyPrivate(): any;
    hasSenderMessageKey(iteration: any): any;
    addSenderMessageKey(senderMessageKey: any): void;
    removeSenderMessageKey(iteration: any): any;
    getStructure(): any;
}
