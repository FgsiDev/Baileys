export function downloadHistory(msg: any, options: any): Promise<proto.HistorySync>;
export function processHistoryMessage(item: any): {
    chats: any[];
    contacts: ({
        id: any;
        name: any;
        lid: any;
        phoneNumber: any;
        verifiedName?: undefined;
        notify?: undefined;
    } | {
        id: any;
        verifiedName: any;
        name?: undefined;
        lid?: undefined;
        phoneNumber?: undefined;
        notify?: undefined;
    } | {
        id: any;
        notify: any;
        name?: undefined;
        lid?: undefined;
        phoneNumber?: undefined;
        verifiedName?: undefined;
    })[];
    messages: any[];
    syncType: any;
    progress: any;
};
export function downloadAndProcessHistorySyncNotification(msg: any, options: any): Promise<{
    chats: any[];
    contacts: ({
        id: any;
        name: any;
        lid: any;
        phoneNumber: any;
        verifiedName?: undefined;
        notify?: undefined;
    } | {
        id: any;
        verifiedName: any;
        name?: undefined;
        lid?: undefined;
        phoneNumber?: undefined;
        notify?: undefined;
    } | {
        id: any;
        notify: any;
        name?: undefined;
        lid?: undefined;
        phoneNumber?: undefined;
        verifiedName?: undefined;
    })[];
    messages: any[];
    syncType: any;
    progress: any;
}>;
export function getHistoryMsg(message: any): any;
import { proto } from "../../WAProto/index.js";
