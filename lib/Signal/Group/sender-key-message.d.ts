export class SenderKeyMessage {
    constructor(keyId: any, iteration: any, ciphertext: any, signatureKey: any, serialized: any);
    SIGNATURE_LENGTH: number;
    serialized: any;
    messageVersion: any;
    keyId: any;
    iteration: any;
    ciphertext: any;
    signature: any;
    getKeyId(): any;
    getIteration(): any;
    getCipherText(): any;
    verifySignature(signatureKey: any): void;
    getSignature(signatureKey: any, serialized: any): any;
    serialize(): any;
    getType(): number;
}
