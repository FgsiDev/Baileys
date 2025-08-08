export = SenderChainKey;
declare class SenderChainKey {
    constructor(iteration: any, chainKey: any);
    MESSAGE_KEY_SEED: any;
    CHAIN_KEY_SEED: any;
    iteration: number;
    chainKey: any;
    getIteration(): number;
    getSenderMessageKey(): SenderMessageKey;
    getNext(): SenderChainKey;
    getSeed(): any;
    getDerivative(seed: any, key: any): any;
}
import SenderMessageKey = require("./sender_message_key");
