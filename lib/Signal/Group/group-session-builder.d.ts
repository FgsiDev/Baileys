export class GroupSessionBuilder {
    constructor(senderKeyStore: any);
    senderKeyStore: any;
    process(senderKeyName: any, senderKeyDistributionMessage: any): Promise<void>;
    create(senderKeyName: any): Promise<any>;
}
