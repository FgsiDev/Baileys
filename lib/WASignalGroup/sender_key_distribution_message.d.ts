export = SenderKeyDistributionMessage;
declare class SenderKeyDistributionMessage extends CiphertextMessage {
    constructor(id?: null, iteration?: null, chainKey?: null, signatureKey?: null, serialized?: null);
    serialized: any;
    id: any;
    iteration: any;
    chainKey: any;
    signatureKey: any;
    intsToByteHighAndLow(highValue: any, lowValue: any): number;
    serialize(): any;
    getType(): number;
    getIteration(): any;
    getChainKey(): any;
    getSignatureKey(): any;
    getId(): any;
}
import CiphertextMessage = require("./ciphertext_message");
