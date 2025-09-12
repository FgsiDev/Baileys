export const UNAUTHORIZED_CODES: number[];
export const DEFAULT_ORIGIN: "https://web.whatsapp.com";
export const CALL_VIDEO_PREFIX: "https://call.whatsapp.com/video/";
export const CALL_AUDIO_PREFIX: "https://call.whatsapp.com/voice/";
export const DEF_CALLBACK_PREFIX: "CB:";
export const DEF_TAG_PREFIX: "TAG:";
export const PHONE_CONNECTION_CB: "CB:Pong";
export const WA_DEFAULT_EPHEMERAL: number;
export const NOISE_MODE: "Noise_XX_25519_AESGCM_SHA256\0\0\0\0";
export const DICT_VERSION: 3;
export const KEY_BUNDLE_TYPE: any;
export const NOISE_WA_HEADER: any;
/** from: https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url */
export const URL_REGEX: RegExp;
export namespace WA_CERT_DETAILS {
    let SERIAL: number;
}
export const PROCESSABLE_HISTORY_TYPES: proto.Message.HistorySyncNotification.HistorySyncType[];
export namespace DEFAULT_CONNECTION_CONFIG {
    export { version };
    export let browser: any[];
    export let waWebSocketUrl: string;
    export let connectTimeoutMs: number;
    export let keepAliveIntervalMs: number;
    export let logger: any;
    export let emitOwnEvents: boolean;
    export let defaultQueryTimeoutMs: number;
    export let customUploadHosts: never[];
    export let retryRequestDelayMs: number;
    export let maxMsgRetryCount: number;
    export let fireInitQueries: boolean;
    export let auth: undefined;
    export let markOnlineOnConnect: boolean;
    export let syncFullHistory: boolean;
    export function patchMessageBeforeSending(msg: any): any;
    export function shouldSyncHistoryMessage(): boolean;
    export function shouldIgnoreJid(): boolean;
    export let linkPreviewImageThumbnailWidth: number;
    export namespace transactionOpts {
        let maxCommitRetries: number;
        let delayBetweenTriesMs: number;
    }
    export let generateHighQualityLinkPreview: boolean;
    export let enableAutoSessionRecreation: boolean;
    export let enableRecentMessageCache: boolean;
    export let options: {};
    export namespace appStateMacVerification {
        let patch: boolean;
        let snapshot: boolean;
    }
    export let countryCode: string;
    export function getMessage(): Promise<undefined>;
    export function cachedGroupMetadata(): Promise<undefined>;
    export { makeLibSignalRepository as makeSignalRepository };
}
export const MEDIA_PATH_MAP: {
    image: string;
    video: string;
    document: string;
    audio: string;
    sticker: string;
    "thumbnail-link": string;
    "product-catalog-image": string;
    "md-app-state": string;
    "md-msg-hist": string;
    "biz-cover-photo": string;
};
export const MEDIA_HKDF_KEY_MAPPING: {
    audio: string;
    document: string;
    gif: string;
    image: string;
    ppic: string;
    product: string;
    ptt: string;
    sticker: string;
    video: string;
    "thumbnail-document": string;
    "thumbnail-image": string;
    "thumbnail-video": string;
    "thumbnail-link": string;
    "md-msg-hist": string;
    "md-app-state": string;
    "product-catalog-image": string;
    "payment-bg-image": string;
    ptv: string;
    "biz-cover-photo": string;
};
export const MEDIA_KEYS: string[];
export const MIN_PREKEY_COUNT: 5;
export const INITIAL_PREKEY_COUNT: 30;
export const UPLOAD_TIMEOUT: 30000;
export const MIN_UPLOAD_INTERVAL: 5000;
export namespace DEFAULT_CACHE_TTLS {
    let SIGNAL_STORE: number;
    let MSG_RETRY: number;
    let CALL_OFFER: number;
    let USER_DEVICES: number;
}
import { proto } from "../../WAProto";
declare const version: number[];
import { makeLibSignalRepository } from "../Signal/libsignal";
export {};
