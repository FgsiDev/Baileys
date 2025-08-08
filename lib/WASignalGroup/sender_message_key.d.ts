export = SenderMessageKey;
declare class SenderMessageKey {
    constructor(iteration: any, seed: any);
    iteration: number;
    iv: any;
    cipherKey: any;
    seed: any;
    getIteration(): number;
    getIv(): any;
    getCipherKey(): any;
    getSeed(): any;
}
