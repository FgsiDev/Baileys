import { promisify } from "util";
import { inflate } from "zlib";
import { proto } from "../../WAProto/index.js";
import { WAMessageStubType } from "../Types";
import { toNumber } from "./generics";
import { normalizeMessageContent } from "./messages";
import { downloadContentFromMessage } from "./messages-media";
const inflatePromise = promisify(inflate);
export const downloadHistory = async (msg, options) => {
    const stream = await downloadContentFromMessage(msg, "md-msg-hist", {
        options,
    });
    const bufferArray = [];
    for await (const chunk of stream) {
        bufferArray.push(chunk);
    }
    let buffer = Buffer.concat(bufferArray);
    // decompress buffer
    buffer = await inflatePromise(buffer);
    const syncData = proto.HistorySync.decode(buffer);
    return syncData;
};
export const processHistoryMessage = (item) => {
    var _a, _b, _c;
    const messages = [];
    const contacts = [];
    const chats = [];
    switch (item.syncType) {
        case proto.HistorySync.HistorySyncType.INITIAL_BOOTSTRAP:
        case proto.HistorySync.HistorySyncType.RECENT:
        case proto.HistorySync.HistorySyncType.FULL:
        case proto.HistorySync.HistorySyncType.ON_DEMAND:
            for (const chat of item.conversations) {
                contacts.push({
                    id: chat.id,
                    name: chat.name || undefined,
                    lid: chat.lidJid || undefined,
                    phoneNumber: chat.pnJid || undefined,
                });
                const msgs = chat.messages || [];
                delete chat.messages;
                for (const item of msgs) {
                    const message = item.message;
                    messages.push(message);
                    if (!((_a = chat.messages) === null || _a === void 0 ? void 0 : _a.length)) {
                        // keep only the most recent message in the chat array
                        chat.messages = [{ message }];
                    }
                    if (!message.key.fromMe && !chat.lastMessageRecvTimestamp) {
                        chat.lastMessageRecvTimestamp = toNumber(message.messageTimestamp);
                    }
                    if ((message.messageStubType ===
                        WAMessageStubType.BIZ_PRIVACY_MODE_TO_BSP ||
                        message.messageStubType ===
                            WAMessageStubType.BIZ_PRIVACY_MODE_TO_FB) &&
                        ((_b = message.messageStubParameters) === null || _b === void 0 ? void 0 : _b[0])) {
                        contacts.push({
                            id: message.key.participant || message.key.remoteJid,
                            verifiedName: (_c = message.messageStubParameters) === null || _c === void 0 ? void 0 : _c[0],
                        });
                    }
                }
                chats.push({ ...chat });
            }
            break;
        case proto.HistorySync.HistorySyncType.PUSH_NAME:
            for (const c of item.pushnames) {
                contacts.push({ id: c.id, notify: c.pushname });
            }
            break;
    }
    return {
        chats,
        contacts,
        messages,
        syncType: item.syncType,
        progress: item.progress,
    };
};
export const downloadAndProcessHistorySyncNotification = async (msg, options) => {
    const historyMsg = await downloadHistory(msg, options);
    return processHistoryMessage(historyMsg);
};
export const getHistoryMsg = (message) => {
    var _a;
    const normalizedContent = !!message
        ? normalizeMessageContent(message)
        : undefined;
    const anyHistoryMsg = (_a = normalizedContent === null || normalizedContent === void 0 ? void 0 : normalizedContent.protocolMessage) === null || _a === void 0 ? void 0 : _a.historySyncNotification;
    return anyHistoryMsg;
};
