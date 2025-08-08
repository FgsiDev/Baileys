export = SenderKeyMessage;
declare class SenderKeyMessage extends CiphertextMessage {
    constructor(keyId?: null, iteration?: null, ciphertext?: null, signatureKey?: null, serialized?: null);
    SIGNATURE_LENGTH: number;
    serialized: any;
    messageVersion: number;
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
import CiphertextMessage = require("./ciphertext_message");
