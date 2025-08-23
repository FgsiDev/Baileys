export function makeLibSignalRepository(auth: any): {
    decryptGroupMessage({ group, authorJid, msg }: {
        group: any;
        authorJid: any;
        msg: any;
    }): Promise<any>;
    processSenderKeyDistributionMessage({ item, authorJid }: {
        item: any;
        authorJid: any;
    }): Promise<void>;
    decryptMessage({ jid, type, ciphertext }: {
        jid: any;
        type: any;
        ciphertext: any;
    }): Promise<any>;
    encryptMessage({ jid, data }: {
        jid: any;
        data: any;
    }): Promise<{
        type: string;
        ciphertext: any;
    }>;
    encryptGroupMessage({ group, meId, data }: {
        group: any;
        meId: any;
        data: any;
    }): Promise<{
        ciphertext: any;
        senderKeyDistributionMessage: any;
    }>;
    injectE2ESession({ jid, session }: {
        jid: any;
        session: any;
    }): Promise<void>;
    jidToSignalProtocolAddress(jid: any): any;
};
