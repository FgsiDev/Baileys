/**
 * Decode the received node as a message.
 * @note this will only parse the message, not decrypt it
 */
export function decodeMessageNode(stanza: any, meId: any, meLid: any): {
    fullMessage: {
        key: {
            remoteJid: any;
            fromMe: boolean;
            id: any;
            senderPn: any;
            senderLid: any;
            participant: any;
            participantLid: any;
            server_id: any;
        };
        messageTimestamp: number;
        pushName: any;
        broadcast: any;
    };
    author: any;
    sender: any;
};
export const NO_MESSAGE_FOUND_ERROR_TEXT: "Message absent from node";
export const MISSING_KEYS_ERROR_TEXT: "Key used already or never filled";
export namespace NACK_REASONS {
    let ParsingError: number;
    let UnrecognizedStanza: number;
    let UnrecognizedStanzaClass: number;
    let UnrecognizedStanzaType: number;
    let InvalidProtobuf: number;
    let InvalidHostedCompanionStanza: number;
    let MissingMessageSecret: number;
    let SignalErrorOldCounter: number;
    let MessageDeletedOnPeer: number;
    let UnhandledError: number;
    let UnsupportedAdminRevoke: number;
    let UnsupportedLIDGroup: number;
    let DBOperationFailed: number;
}
export function decryptMessageNode(stanza: any, meId: any, meLid: any, repository: any, logger: any): {
    fullMessage: {
        key: {
            remoteJid: any;
            fromMe: boolean;
            id: any;
            senderPn: any;
            senderLid: any;
            participant: any;
            participantLid: any;
            server_id: any;
        };
        messageTimestamp: number;
        pushName: any;
        broadcast: any;
    };
    category: any;
    author: any;
    decrypt(): Promise<void>;
};
