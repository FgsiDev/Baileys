export const LT_HASH_ANTI_TAMPERING: LTHash;
declare class LTHash {
    constructor(e: any);
    salt: any;
    add(e: any, t: any): Promise<any>;
    subtract(e: any, t: any): Promise<any>;
    subtractThenAdd(e: any, addList: any, subtractList: any): Promise<any>;
    _addSingle(e: any, t: any): Promise<ArrayBuffer>;
    _subtractSingle(e: any, t: any): Promise<ArrayBuffer>;
    performPointwiseWithOverflow(e: any, t: any, op: any): ArrayBuffer;
}
export {};
