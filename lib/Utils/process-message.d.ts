/**
 * Decrypt a poll vote
 * @param vote encrypted vote
 * @param ctx additional info about the poll required for decryption
 * @returns list of SHA256 options
 */
export function decryptPollVote({ encPayload, encIv }: {
    encPayload: any;
    encIv: any;
}, { pollCreatorJid, pollMsgId, pollEncKey, voterJid }: {
    pollCreatorJid: any;
    pollMsgId: any;
    pollEncKey: any;
    voterJid: any;
}): proto.Message.PollVoteMessage;
export function cleanMessage(message: any, meId: any): void;
export function isRealMessage(message: any, meId: any): any;
export function shouldIncrementChatUnread(message: any): boolean;
export function getChatId({ remoteJid, participant, fromMe }: {
    remoteJid: any;
    participant: any;
    fromMe: any;
}): any;
export default processMessage;
import { proto } from "../../WAProto/index.js";
declare function processMessage(message: any, { shouldProcessHistoryMsg, placeholderResendCache, ev, creds, signalRepository, keyStore, logger, options, }: {
    shouldProcessHistoryMsg: any;
    placeholderResendCache: any;
    ev: any;
    creds: any;
    signalRepository: any;
    keyStore: any;
    logger: any;
    options: any;
}): Promise<void>;
