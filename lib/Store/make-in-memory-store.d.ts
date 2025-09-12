export function waChatKey(pin: any): {
    key: (c: any) => string;
    compare: (k1: any, k2: any) => any;
};
export function waMessageID(m: any): any;
export namespace waLabelAssociationKey {
    function key(la: any): any;
    function compare(k1: any, k2: any): any;
}
declare function _default(config: any): {
    defaultSettings: {
        allowMessageDelete: boolean;
    };
    chats: any;
    contacts: {};
    messages: {};
    groupMetadata: {};
    state: {
        connection: string;
    };
    presences: {};
    labels: any;
    labelAssociations: any;
    bind: (ev: any, options?: {}) => void;
    /** loads messages from the store, if not found -- uses the legacy connection */
    loadMessages: (jid: any, count: any, cursor: any) => any;
    /**
     * Get all available labels for profile
     *
     * Keep in mind that the list is formed from predefined tags and tags
     * that were "caught" during their editing.
     */
    getLabels: () => any;
    /**
     * Get labels for chat
     *
     * @returns Label IDs
     **/
    getChatLabels: (chatId: any) => any;
    /**
     * Get labels for message
     *
     * @returns Label IDs
     **/
    getMessageLabels: (messageId: any) => any;
    loadMessage: (jid: any, id: any) => Promise<any>;
    mostRecentMessage: (jid: any) => Promise<any>;
    fetchImageUrl: (jid: any, sock: any) => Promise<any>;
    fetchGroupMetadata: (jid: any, sock: any) => Promise<any>;
    fetchMessageReceipts: ({ remoteJid, id }: {
        remoteJid: any;
        id: any;
    }) => Promise<any>;
    toJSON: () => {
        chats: any;
        contacts: {};
        messages: {};
        labels: any;
        labelAssociations: any;
    };
    fromJSON: (json: any) => void;
    writeToFile: (path: any) => void;
    readFromFile: (path: any) => void;
};
export default _default;
