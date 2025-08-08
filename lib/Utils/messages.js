"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertMediaContent = exports.downloadMediaMessage = exports.aggregateMessageKeysNotFromMe = exports.updateMessageWithPollUpdate = exports.updateMessageWithReaction = exports.updateMessageWithReceipt = exports.getDevice = exports.extractMessageContent = exports.normalizeMessageContent = exports.getContentType = exports.generateWAMessage = exports.generateWAMessageFromContent = exports.generateWAMessageContent = exports.generateForwardMessageContent = exports.prepareDisappearingMessageSettingContent = exports.prepareWAMessageMedia = exports.generateLinkPreviewIfRequired = exports.extractUrlFromText = void 0;
exports.getAggregateVotesInPollMessage = getAggregateVotesInPollMessage;
const boom_2 = require("@hapi/boom");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const WAProto_1 = require("../../WAProto");
const Defaults_1 = require("../Defaults");
const Types_1 = require("../Types");
const WABinary_1 = require("../WABinary");
const crypto_2 = require("./crypto");
const generics_1 = require("./generics");
const messages_media_1 = require("./messages-media");
const MIMETYPE_MAP = {
    image: "image/jpeg",
    video: "video/mp4",
    document: "application/pdf",
    audio: "audio/ogg; codecs=opus",
    sticker: "image/webp",
    "product-catalog-image": "image/jpeg",
};
const MessageTypeProto = {
    image: Types_1.WAProto.Message.ImageMessage,
    video: Types_1.WAProto.Message.VideoMessage,
    audio: Types_1.WAProto.Message.AudioMessage,
    sticker: Types_1.WAProto.Message.StickerMessage,
    document: Types_1.WAProto.Message.DocumentMessage,
};
const ButtonType = WAProto_1.proto.Message.ButtonsMessage.HeaderType;
/**
 * Uses a regex to test whether the string contains a URL, and returns the URL if it does.
 * @param text eg. hello https://google.com
 * @returns the URL, eg. https://google.com
 */
const extractUrlFromText = (text) => { var _c; return (_c = text.match(Defaults_1.URL_REGEX)) === null || _c === void 0 ? void 0 : _c[0]; };
exports.extractUrlFromText = extractUrlFromText;
const generateLinkPreviewIfRequired = async (text, getUrlInfo, logger) => {
    const url = (0, exports.extractUrlFromText)(text);
    if (!!getUrlInfo && url) {
        try {
            const urlInfo = await getUrlInfo(url);
            return urlInfo;
        }
        catch (error) {
            // ignore if fails
            logger === null || logger === void 0 ? void 0 : logger.warn({ trace: error.stack }, "url generation failed");
        }
    }
};
exports.generateLinkPreviewIfRequired = generateLinkPreviewIfRequired;
const assertColor = async (color) => {
    let assertedColor;
    if (typeof color === "number") {
        assertedColor = color > 0 ? color : 0xffffffff + Number(color) + 1;
    }
    else {
        let hex = color.trim().replace("#", "");
        if (hex.length <= 6) {
            hex = "FF" + hex.padStart(6, "0");
        }
        assertedColor = parseInt(hex, 16);
        return assertedColor;
    }
};
const prepareWAMessageMedia = async (message, options) => {
    const logger = options.logger;
    let mediaType;
    for (const key of Defaults_1.MEDIA_KEYS) {
        if (key in message) {
            mediaType = key;
        }
    }
    if (!mediaType) {
        throw new boom_2.Boom("Invalid media type", { statusCode: 400 });
    }
    const uploadData = {
        ...message,
        media: message[mediaType],
    };
    delete uploadData[mediaType];
    // check if cacheable + generate cache key
    const cacheableKey = typeof uploadData.media === "object" &&
        "url" in uploadData.media &&
        !!uploadData.media.url &&
        !!options.mediaCache &&
        // generate the key
        mediaType + ":" + uploadData.media.url.toString();
    if (mediaType === "document" && !uploadData.fileName) {
        uploadData.fileName = "file";
    }
    if (!uploadData.mimetype) {
        uploadData.mimetype = MIMETYPE_MAP[mediaType];
    }
    // check for cache hit
    if (cacheableKey) {
        const mediaBuff = options.mediaCache.get(cacheableKey);
        if (mediaBuff) {
            logger === null || logger === void 0 ? void 0 : logger.debug({ cacheableKey }, "got media cache hit");
            const obj = Types_1.WAProto.Message.decode(mediaBuff);
            const key = `${mediaType}Message`;
            Object.assign(obj[key], { ...uploadData, media: undefined });
            return obj;
        }
    }
    const requiresDurationComputation = mediaType === "audio" && typeof uploadData.seconds === "undefined";
    const requiresThumbnailComputation = (mediaType === "image" || mediaType === "video") &&
        typeof uploadData["jpegThumbnail"] === "undefined";
    const requiresWaveformProcessing = mediaType === "audio" && uploadData.ptt === true;
    const requiresAudioBackground = options.backgroundColor && mediaType === "audio" && uploadData.ptt === true;
    const requiresOriginalForSomeProcessing = requiresDurationComputation || requiresThumbnailComputation;
    const { mediaKey, encFilePath, originalFilePath, fileEncSha256, fileSha256, fileLength, } = await (0, messages_media_1.encryptedStream)(uploadData.media, options.mediaTypeOverride || mediaType, {
        logger,
        saveOriginalFileIfRequired: requiresOriginalForSomeProcessing,
        opts: options.options,
    });
    // url safe Base64 encode the SHA256 hash of the body
    const fileEncSha256B64 = fileEncSha256.toString("base64");
    const [{ mediaUrl, directPath }] = await Promise.all([
        (async () => {
            const result = await options.upload(encFilePath, {
                fileEncSha256B64,
                mediaType,
                timeoutMs: options.mediaUploadTimeoutMs,
            });
            logger === null || logger === void 0 ? void 0 : logger.debug({ mediaType, cacheableKey }, "uploaded media");
            return result;
        })(),
        (async () => {
            try {
                if (requiresThumbnailComputation) {
                    const { thumbnail, originalImageDimensions } = await (0, messages_media_1.generateThumbnail)(originalFilePath, mediaType, options);
                    uploadData.jpegThumbnail = thumbnail;
                    if (!uploadData.width && originalImageDimensions) {
                        uploadData.width = originalImageDimensions.width;
                        uploadData.height = originalImageDimensions.height;
                        logger === null || logger === void 0 ? void 0 : logger.debug("set dimensions");
                    }
                    logger === null || logger === void 0 ? void 0 : logger.debug("generated thumbnail");
                }
                if (requiresDurationComputation) {
                    uploadData.seconds = await (0, messages_media_1.getAudioDuration)(originalFilePath);
                    logger === null || logger === void 0 ? void 0 : logger.debug("computed audio duration");
                }
                if (requiresWaveformProcessing) {
                    uploadData.waveform = await (0, messages_media_1.getAudioWaveform)(originalFilePath, logger);
                    logger === null || logger === void 0 ? void 0 : logger.debug("processed waveform");
                }
                if (requiresAudioBackground) {
                    uploadData.backgroundArgb = await assertColor(options.backgroundColor);
                    logger === null || logger === void 0 ? void 0 : logger.debug("computed backgroundColor audio status");
                }
            }
            catch (error) {
                logger === null || logger === void 0 ? void 0 : logger.warn({ trace: error.stack }, "failed to obtain extra info");
            }
        })(),
    ]).finally(async () => {
        try {
            await fs_1.promises.unlink(encFilePath);
            if (originalFilePath) {
                await fs_1.promises.unlink(originalFilePath);
            }
            logger === null || logger === void 0 ? void 0 : logger.debug("removed tmp files");
        }
        catch (error) {
            logger === null || logger === void 0 ? void 0 : logger.warn("failed to remove tmp file");
        }
    });
    const obj = Types_1.WAProto.Message.fromObject({
        [`${mediaType}Message`]: MessageTypeProto[mediaType].fromObject({
            url: mediaUrl,
            directPath,
            mediaKey,
            fileEncSha256,
            fileSha256,
            fileLength,
            mediaKeyTimestamp: (0, generics_1.unixTimestampSeconds)(),
            ...uploadData,
            media: undefined,
        }),
    });
    if (uploadData.ptv) {
        obj.ptvMessage = obj.videoMessage;
        delete obj.videoMessage;
    }
    if (cacheableKey) {
        logger === null || logger === void 0 ? void 0 : logger.debug({ cacheableKey }, "set cache");
        options.mediaCache.set(cacheableKey, Types_1.WAProto.Message.encode(obj).finish());
    }
    return obj;
};
exports.prepareWAMessageMedia = prepareWAMessageMedia;
const prepareDisappearingMessageSettingContent = (ephemeralExpiration) => {
    ephemeralExpiration = ephemeralExpiration || 0;
    const content = {
        ephemeralMessage: {
            message: {
                protocolMessage: {
                    type: Types_1.WAProto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING,
                    ephemeralExpiration,
                },
            },
        },
    };
    return Types_1.WAProto.Message.fromObject(content);
};
exports.prepareDisappearingMessageSettingContent = prepareDisappearingMessageSettingContent;
/**
 * Generate forwarded message content like WA does
 * @param message the message to forward
 * @param options.forceForward will show the message as forwarded even if it is from you
 */
const generateForwardMessageContent = (message, forceForward) => {
    var _c;
    let content = message.message;
    if (!content) {
        throw new boom_2.Boom("no content in message", { statusCode: 400 });
    }
    // hacky copy
    content = (0, exports.normalizeMessageContent)(content);
    content = WAProto_1.proto.Message.decode(WAProto_1.proto.Message.encode(content).finish());
    let key = Object.keys(content)[0];
    let score = ((_c = content[key].contextInfo) === null || _c === void 0 ? void 0 : _c.forwardingScore) || 0;
    score += message.key.fromMe && !forceForward ? 0 : 1;
    if (key === "conversation") {
        content.extendedTextMessage = { text: content[key] };
        delete content.conversation;
        key = "extendedTextMessage";
    }
    if (score > 0) {
        content[key].contextInfo = { forwardingScore: score, isForwarded: true };
    }
    else {
        content[key].contextInfo = {};
    }
    return content;
};
exports.generateForwardMessageContent = generateForwardMessageContent;
const generateWAMessageContent = async (message, options) => {
    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var _a, _b;
    let m = {};
    if ("text" in message) {
        const extContent = { text: message.text };
        let urlInfo = message.linkPreview;
        if (typeof urlInfo === "undefined") {
            urlInfo = await (0, exports.generateLinkPreviewIfRequired)(message.text, options.getUrlInfo, options.logger);
        }
        if (urlInfo) {
            extContent.matchedText = urlInfo["matched-text"];
            extContent.jpegThumbnail = urlInfo.jpegThumbnail;
            extContent.description = urlInfo.description;
            extContent.title = urlInfo.title;
            extContent.previewType = 0;
            const img = urlInfo.highQualityThumbnail;
            if (img) {
                extContent.thumbnailDirectPath = img.directPath;
                extContent.mediaKey = img.mediaKey;
                extContent.mediaKeyTimestamp = img.mediaKeyTimestamp;
                extContent.thumbnailWidth = img.width;
                extContent.thumbnailHeight = img.height;
                extContent.thumbnailSha256 = img.fileSha256;
                extContent.thumbnailEncSha256 = img.fileEncSha256;
            }
        }
        if (options.backgroundColor) {
            extContent.backgroundArgb = await assertColor(options.backgroundColor);
        }
        if (options.font) {
            extContent.font = options.font;
        }
        m.extendedTextMessage = extContent;
    }
    else if ("contacts" in message) {
        const contactLen = message.contacts.contacts.length;
        if (!contactLen) {
            throw new boom_2.Boom("require atleast 1 contact", { statusCode: 400 });
        }
        if (contactLen === 1) {
            m.contactMessage = Types_1.WAProto.Message.ContactMessage.fromObject(message.contacts.contacts[0]);
        }
        else {
            m.contactsArrayMessage = Types_1.WAProto.Message.ContactsArrayMessage.fromObject(message.contacts);
        }
    }
    else if ("location" in message) {
        m.locationMessage = Types_1.WAProto.Message.LocationMessage.fromObject(message.location);
    }
    else if ("react" in message) {
        if (!message.react.senderTimestampMs) {
            message.react.senderTimestampMs = Date.now();
        }
        m.reactionMessage = Types_1.WAProto.Message.ReactionMessage.fromObject(message.react);
    }
    else if ("delete" in message) {
        m.protocolMessage = {
            key: message.delete,
            type: Types_1.WAProto.Message.ProtocolMessage.Type.REVOKE,
        };
    }
    else if ("forward" in message) {
        m = (0, exports.generateForwardMessageContent)(message.forward, message.force);
    }
    else if ("disappearingMessagesInChat" in message) {
        const exp = typeof message.disappearingMessagesInChat === "boolean"
            ? message.disappearingMessagesInChat
                ? Defaults_1.WA_DEFAULT_EPHEMERAL
                : 0
            : message.disappearingMessagesInChat;
        m = (0, exports.prepareDisappearingMessageSettingContent)(exp);
    }
    else if ("groupInvite" in message) {
        m.groupInviteMessage = {};
        m.groupInviteMessage.inviteCode = message.groupInvite.inviteCode;
        m.groupInviteMessage.inviteExpiration =
            message.groupInvite.inviteExpiration;
        m.groupInviteMessage.caption = message.groupInvite.text;
        m.groupInviteMessage.groupJid = message.groupInvite.jid;
        m.groupInviteMessage.groupName = message.groupInvite.subject;
        //TODO: use built-in interface and get disappearing mode info etc.
        //TODO: cache / use store!?
        if (options.getProfilePicUrl) {
            const pfpUrl = await options.getProfilePicUrl(message.groupInvite.jid, "preview");
            if (pfpUrl) {
                const resp = await axios_1.default.get(pfpUrl, { responseType: "arraybuffer" });
                if (resp.status === 200) {
                    m.groupInviteMessage.jpegThumbnail = resp.data;
                }
            }
        }
    }
    else if ("adminInvite" in message) {
        m.newsletterAdminInviteMessage = {};
        m.newsletterAdminInviteMessage.newsletterJid = message.adminInvite.jid;
        m.newsletterAdminInviteMessage.newsletterName = message.adminInvite.name;
        m.newsletterAdminInviteMessage.caption = message.adminInvite.caption;
        m.newsletterAdminInviteMessage.inviteExpiration =
            message.adminInvite.expiration;
        m.newsletterAdminInviteMessage.contextInfo = message.contextInfo;
        if (options.getProfilePicUrl) {
            const pfpUrl = await options.getProfilePicUrl(message.adminInvite.jid);
            const { thumbnail } = await (0, messages_media_1.generateThumbnail)(pfpUrl, "image");
            m.newsletterAdminInviteMessage.jpegThumbnail = thumbnail;
        }
    }
    else if ("pin" in message) {
        m.pinInChatMessage = {};
        m.messageContextInfo = {};
        m.pinInChatMessage.key = message.pin.key;
        m.pinInChatMessage.type = message.pin.type;
        m.pinInChatMessage.senderTimestampMs = Date.now();
        m.messageContextInfo.messageAddOnDurationInSecs =
            message.pin.type === 1 ? message.pin.time || 86400 : 0;
    }
    else if ("keep" in message) {
        m.keepInChatMessage = {};
        m.keepInChatMessage.key = message.keep.key;
        m.keepInChatMessage.keepType = message.keep.type;
        m.keepInChatMessage.timestampMs = Date.now();
    }
    else if ("call" in message) {
        m.scheduledCallCreationMessage = {
            scheduledTimestampMs: message.call.time || Date.now(),
            callType: message.call.type || 1,
            title: message.call.name,
        };
    }
    else if ("paymentInvite" in message) {
        m.paymentInviteMessage = {
            serviceType: message.paymentInvite.type,
            expiryTimestamp: message.paymentInvite.expiry,
        };
    }
    else if ("buttonReply" in message) {
        switch (message.type) {
            case "list":
                m.listResponseMessage = {
                    title: message.buttonReply.title,
                    description: message.buttonReply.description,
                    singleSelectReply: {
                        selectedRowId: message.buttonReply.rowId,
                    },
                    lisType: Types_1.WAProto.Message.ListResponseMessage.ListType.SINGLE_SELECT,
                };
                break;
            case "template":
                m.templateButtonReplyMessage = {
                    selectedDisplayText: message.buttonReply.displayText,
                    selectedId: message.buttonReply.id,
                    selectedIndex: message.buttonReply.index,
                };
                break;
            case "plain":
                m.buttonsResponseMessage = {
                    selectedButtonId: message.buttonReply.id,
                    selectedDisplayText: message.buttonReply.displayText,
                    type: Types_1.WAProto.Message.ButtonsResponseMessage.Type.DISPLAY_TEXT,
                };
                break;
            case "interactive":
                m.interactiveResponseMessage = {
                    body: {
                        text: message.buttonReply.displayText,
                        format: Types_1.WAProto.Message.InteractiveResponseMessage.Body.Format
                            .EXTENSIONS_1,
                    },
                    nativeFlowResponseMessage: {
                        name: message.buttonReply.nativeFlows.name,
                        paramsJson: message.buttonReply.nativeFlows.paramsJson,
                        version: message.buttonReply.nativeFlows.version,
                    },
                };
                break;
        }
    }
    else if ("ptv" in message && message.ptv) {
        const { videoMessage } = await (0, exports.prepareWAMessageMedia)({ video: message.video }, options);
        m.ptvMessage = videoMessage;
    }
    else if ("order" in message) {
        m.orderMessage = Types_1.WAProto.Message.OrderMessage.fromObject({
            ...message.order,
        });
    }
    else if ("event" in message) {
        m.messageContextInfo = {
            messageSecret: (0, crypto_1.randomBytes)(32).toString("base64"),
        };
        m.eventMessage = { ...message.event };
    }
    else if ("product" in message) {
        const { imageMessage } = await (0, exports.prepareWAMessageMedia)({ image: message.product.productImage }, options);
        m.productMessage = Types_1.WAProto.Message.ProductMessage.fromObject({
            ...message,
            product: {
                ...message.product,
                productImage: imageMessage,
            },
        });
    }
    else if ("pollResult" in message) {
        if (!Array.isArray(message.pollResult.values)) {
            throw new boom_1.Boom("Invalid pollResult values", { statusCode: 400 });
        }
        const pollResultSnapshotMessage = {
            name: message.pollResult.name,
            pollVotes: message.pollResult.values.map(([optionName, optionVoteCount]) => ({
                optionName,
                optionVoteCount,
            })),
        };
        if ("mentions" in message && !!message.mentions) {
            pollResultSnapshotMessage.contextInfo = {
                mentionedJid: message.mentions,
            };
        }
        if ("contextInfo" in message && !!message.contextInfo) {
            pollResultSnapshotMessage.contextInfo = message.contextInfo;
        }
        m.pollResultSnapshotMessage = pollResultSnapshotMessage;
    }
    else if ("poll" in message) {
        (_a = message.poll).selectableCount || (_a.selectableCount = 0);
        (_b = message.poll).toAnnouncementGroup || (_b.toAnnouncementGroup = false);
        if (!Array.isArray(message.poll.values)) {
            throw new boom_2.Boom("Invalid poll values", { statusCode: 400 });
        }
        if (message.poll.selectableCount < 0 ||
            message.poll.selectableCount > message.poll.values.length) {
            throw new boom_2.Boom(`poll.selectableCount in poll should be >= 0 and <= ${message.poll.values.length}`, { statusCode: 400 });
        }
        m.messageContextInfo = {
            // encKey
            messageSecret: message.poll.messageSecret || (0, crypto_1.randomBytes)(32),
        };
        const pollCreationMessage = {
            name: message.poll.name,
            selectableOptionsCount: message.poll.selectableCount,
            options: message.poll.values.map((optionName) => ({ optionName })),
        };
        if (message.poll.toAnnouncementGroup) {
            // poll v2 is for community announcement groups (single select and multiple)
            m.pollCreationMessageV2 = pollCreationMessage;
        }
        else {
            if (message.poll.selectableCount > 0) {
                //poll v3 is for single select polls
                m.pollCreationMessageV3 = pollCreationMessage;
            }
            else {
                // poll v3 for multiple choice polls
                m.pollCreationMessage = pollCreationMessage;
            }
        }
    }
    else if ("payment" in message) {
        const { imageMessage } = ((_c = message === null || message === void 0 ? void 0 : message.payment) === null || _c === void 0 ? void 0 : _c.background_url)
            ? await (0, exports.prepareWAMessageMedia)({ image: { url: message.payment.background_url } }, options)
            : { imageMessage: {} };
        m.requestPaymentMessage = {
            amount: {
                currencyCode: message.payment.currency || "IDR",
                offset: message.payment.offset || 0,
                value: message.payment.amount || 999999999,
            },
            expiryTimestamp: message.payment.expiry || 0,
            amount1000: message.payment.amount || 999999999 * 1000,
            currencyCodeIso4217: message.payment.currency || "IDR",
            requestFrom: message.payment.from || "0@s.whatsapp.net",
            noteMessage: {
                extendedTextMessage: {
                    text: message.payment.note,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: true,
                        },
                    },
                },
            },
            ...(message.payment.background_url
                ? {
                    background: {
                        fileLength: imageMessage.fileLength,
                        width: imageMessage.width,
                        height: imageMessage.height,
                        mimetype: imageMessage.mimetype,
                        placeholderArgb: message.payment.image.placeholderArgb,
                        textArgb: message.payment.image.textArgb,
                        subtextArgb: message.payment.image.subtextArgb,
                        mediaData: {
                            mediaKey: imageMessage.mediaKey,
                            mediaKeyTimestamp: imageMessage.mediaKeyTimestamp,
                            fileSha256: imageMessage.fileSha256,
                            fileEncSha256: imageMessage.fileEncSha256,
                            directPath: imageMessage.directPath,
                        },
                        type: 1,
                    },
                }
                : {}),
        };
    }
    else if ("sharePhoneNumber" in message) {
        m.protocolMessage = {
            type: WAProto_1.proto.Message.ProtocolMessage.Type.SHARE_PHONE_NUMBER,
        };
    }
    else if ("requestPhoneNumber" in message) {
        m.requestPhoneNumberMessage = {};
    }
    else {
        m = await (0, exports.prepareWAMessageMedia)(message, options);
    }
    if ("productList" in message && !!message.productList) {
        const thumbnail = message.thumbnail
            ? await (0, messages_media_1.generateThumbnail)(message.thumbnail, "image")
            : null;
        const listMessage = {
            title: message.title,
            buttonText: message.buttonText,
            footerText: message.footer,
            description: message.text,
            productListInfo: {
                productSections: message.productList,
                headerImage: {
                    productId: message.productList[0].products[0].productId,
                    jpegThumbnail: (thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.thumbnail) || null,
                },
                businessOwnerJid: message.businessOwnerJid,
            },
            listType: Types_1.WAProto.Message.ListMessage.ListType.PRODUCT_LIST,
        };
        listMessage.contextInfo = {
            ...(message.contextInfo || {}),
            ...(message.mentions ? { mentionedJid: message.mentions } : {}),
        };
        m = { listMessage };
    }
    else if ("buttons" in message && !!message.buttons) {
        const buttonsMessage = {
            buttons: message.buttons.map((b) => ({
                ...b,
                type: Types_1.WAProto.Message.ButtonsMessage.Button.Type.RESPONSE,
            })),
        };
        if ("text" in message) {
            buttonsMessage.contentText = message.text;
            buttonsMessage.headerType = ButtonType.EMPTY;
        }
        else {
            if ("caption" in message) {
                buttonsMessage.contentText = message.caption;
            }
            const type = Object.keys(m)[0].replace("Message", "").toUpperCase();
            buttonsMessage.headerType = ButtonType[type];
            Object.assign(buttonsMessage, m);
        }
        if ("footer" in message && !!message.footer) {
            buttonsMessage.footerText = message.footer;
        }
        if ("title" in message && !!message.title) {
            buttonsMessage.text = message.title;
            buttonsMessage.headerType =
                Types_1.WAProto.Message.ButtonsMessage.HeaderType.TEXT;
        }
        buttonsMessage.contextInfo = {
            ...(message.contextInfo || {}),
            ...(message.mentions ? { mentionedJid: message.mentions } : {}),
        };
        m = { buttonsMessage };
    }
    else if ("templateButtons" in message && !!message.templateButtons) {
        const hydratedTemplate = {
            hydratedButtons: message.templateButtons,
        };
        if ("text" in message) {
            hydratedTemplate.hydratedContentText = message.text;
        }
        else {
            if ("caption" in message) {
                hydratedTemplate.hydratedContentText = message.caption;
            }
            Object.assign(msg, m);
        }
        if ("footer" in message && !!message.footer) {
            hydratedTemplate.hydratedFooterText = message.footer;
        }
        hydratedTemplate.contextInfo = {
            ...(message.contextInfo || {}),
            ...(message.mentions ? { mentionedJid: message.mentions } : {}),
        };
        m = {
            templateMessage: {
                hydratedTemplate,
            },
        };
    }
    else if ("sections" in message && !!message.sections) {
        const listMessage = {
            sections: message.sections,
            buttonText: message.buttonText,
            title: message.title,
            footerText: message.footer,
            description: message.text,
            listType: WAProto_1.proto.Message.ListMessage.ListType.SINGLE_SELECT,
        };
        m = { listMessage };
    }
    else if ("interactiveButtons" in message && !!message.interactiveButtons) {
        const image = ((_d = message === null || message === void 0 ? void 0 : message.header) === null || _d === void 0 ? void 0 : _d.image)
            ? await (0, exports.prepareWAMessageMedia)({ image: (_e = message === null || message === void 0 ? void 0 : message.header) === null || _e === void 0 ? void 0 : _e.image, ...options }, options)
            : null;
        const video = ((_f = message === null || message === void 0 ? void 0 : message.header) === null || _f === void 0 ? void 0 : _f.video)
            ? await (0, exports.prepareWAMessageMedia)({ video: (_g = message === null || message === void 0 ? void 0 : message.header) === null || _g === void 0 ? void 0 : _g.video, ...options }, options)
            : null;
        const document = ((_h = message === null || message === void 0 ? void 0 : message.header) === null || _h === void 0 ? void 0 : _h.document)
            ? await (0, exports.prepareWAMessageMedia)({ document: (_j = message === null || message === void 0 ? void 0 : message.header) === null || _j === void 0 ? void 0 : _j.document, ...options }, options)
            : null;
        const interactiveMessage = {
            viewOnceMessageV2Extension: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                    },
                    interactiveMessage: WAProto_1.proto.Message.InteractiveMessage.create({
                        contextInfo: message.contextInfo,
                        body: WAProto_1.proto.Message.InteractiveMessage.Body.create({
                            text: message.text,
                        }),
                        footer: WAProto_1.proto.Message.InteractiveMessage.Footer.create({
                            text: message.footer,
                        }),
                        header: WAProto_1.proto.Message.InteractiveMessage.Body.create({
                            title: message.title,
                            subtitle: message.subtitle,
                            hasMediaAttachment: ((_k = message === null || message === void 0 ? void 0 : message.header) === null || _k === void 0 ? void 0 : _k.hasMediaAttachment) || false,
                            imageMessage: image ? image.imageMessage : null,
                            videoMessage: video ? video.videoMessage : null,
                            documentMessage: document ? document.documentMessage : null,
                            locationMessage: ((_l = message === null || message === void 0 ? void 0 : message.header) === null || _l === void 0 ? void 0 : _l.location) || null,
                            productMessage: ((_m = message === null || message === void 0 ? void 0 : message.header) === null || _m === void 0 ? void 0 : _m.product) || null,
                        }),
                        nativeFlowMessage: WAProto_1.proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: message.interactiveButtons,
                        }),
                    }),
                },
            },
        };
        m = interactiveMessage;
    }
    if ("cards" in message && !!message.cards) {
        const cards = await Promise.all(message.cards.map(async (slide) => {
            const [url, title, body, footer, buttonType, buttonText, buttonID] = slide;
            let buttonParamsJson = {};
            switch (buttonType) {
                case "cta_url":
                    buttonParamsJson = {
                        display_text: buttonText,
                        url: buttonID,
                        merchant_url: buttonID,
                    };
                    break;
                case "cta_call":
                case "cta_reminder":
                case "cta_cancel_reminder":
                case "address_message":
                case "quick_reply":
                    buttonParamsJson = { display_text: buttonText, id: buttonID };
                    break;
                case "cta_copy":
                    buttonParamsJson = {
                        display_text: buttonText,
                        copy_code: buttonID,
                    };
                    break;
                case "send_location":
                    buttonParamsJson = {};
                    break;
                default:
                    throw new Error(`Invalid buttonType: ${buttonType}`);
            }
            let media;
            const type = message.type;
            const buttonParamsJsonString = JSON.stringify(buttonParamsJson);
            if (type === "image") {
                media = await (0, exports.prepareWAMessageMedia)({ image: { url }, ...options }, options);
            }
            else if (type === "video") {
                media = await (0, exports.prepareWAMessageMedia)({ video: { url }, ...options }, options);
            }
            else {
                throw new Error("Invalid Media Type");
            }
            return {
                body: WAProto_1.proto.Message.InteractiveMessage.Body.fromObject({
                    text: body,
                }),
                footer: WAProto_1.proto.Message.InteractiveMessage.Footer.fromObject({
                    text: footer,
                }),
                header: WAProto_1.proto.Message.InteractiveMessage.Header.fromObject({
                    title,
                    hasMediaAttachment: true,
                    ...media,
                }),
                nativeFlowMessage: WAProto_1.proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: buttonType,
                            buttonParamsJson: buttonParamsJsonString,
                        },
                    ],
                }),
            };
        }));
        const interactiveMessage = {
            viewOnceMessageV2Extension: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                    },
                    interactiveMessage: WAProto_1.proto.Message.InteractiveMessage.fromObject({
                        contextInfo: message.contextInfo,
                        body: WAProto_1.proto.Message.InteractiveMessage.Body.fromObject({
                            text: message.text,
                        }),
                        footer: WAProto_1.proto.Message.InteractiveMessage.Footer.fromObject({
                            text: message.footer,
                        }),
                        header: WAProto_1.proto.Message.InteractiveMessage.Body.fromObject({
                            title: message.title,
                            subtitle: message.subtitle,
                            hasMediaAttachment: false,
                        }),
                        carouselMessage: WAProto_1.proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards,
                        }),
                    }),
                },
            },
        };
        m = interactiveMessage;
    }
    if ("viewOnce" in message && !!message.viewOnce) {
        m = { viewOnceMessage: { message: m } };
    }
    if ("viewOnceV2" in message && !!message.viewOnceV2) {
        m = { viewOnceMessageV2: { message: m } };
    }
    if ("viewOnceV2Extension" in message && !!message.viewOnceV2Extension) {
        m = { viewOnceMessageV2Extension: { message: m } };
    }
    if ("ephemeral" in message && !!message.ephemeral) {
        m = { ephemeralMessage: { message: m } };
    }
    if ("lottie" in message && !!message.lottie) {
        m = { lottieStickerMessage: { message: m } };
    }
    if ("mentions" in message && ((_o = message.mentions) === null || _o === void 0 ? void 0 : _o.length)) {
        const [messageType] = Object.keys(m);
        m[messageType].contextInfo = m[messageType] || {};
        m[messageType].contextInfo.mentionedJid = message.mentions;
    }
    if ("edit" in message) {
        m = {
            protocolMessage: {
                key: message.edit,
                editedMessage: m,
                timestampMs: Date.now(),
                type: Types_1.WAProto.Message.ProtocolMessage.Type.MESSAGE_EDIT,
            },
        };
    }
    if ("contextInfo" in message && !!message.contextInfo) {
        const [messageType] = Object.keys(m);
        m[messageType] = m[messageType] || {};
        m[messageType].contextInfo = message.contextInfo;
    }
    return Types_1.WAProto.Message.fromObject(m);
};
exports.generateWAMessageContent = generateWAMessageContent;
const generateWAMessageFromContent = (jid, message, options) => {
    // set timestamp to now
    // if not specified
    if (!options.timestamp) {
        options.timestamp = new Date();
    }
    const innerMessage = (0, exports.normalizeMessageContent)(message);
    const key = (0, exports.getContentType)(innerMessage);
    const timestamp = (0, generics_1.unixTimestampSeconds)(options.timestamp);
    const { quoted, userJid } = options;
    if (quoted) {
        const participant = quoted.key.fromMe
            ? userJid
            : quoted.participant || quoted.key.participant || quoted.key.remoteJid;
        let quotedMsg = (0, exports.normalizeMessageContent)(quoted.message);
        const msgType = (0, exports.getContentType)(quotedMsg);
        // strip any redundant properties
        quotedMsg = WAProto_1.proto.Message.fromObject({ [msgType]: quotedMsg[msgType] });
        const quotedContent = quotedMsg[msgType];
        if (typeof quotedContent === "object" &&
            quotedContent &&
            "contextInfo" in quotedContent) {
            delete quotedContent.contextInfo;
        }
        const contextInfo = innerMessage[key].contextInfo || {};
        contextInfo.participant = (0, WABinary_1.jidNormalizedUser)(participant);
        contextInfo.stanzaId = quoted.key.id;
        contextInfo.quotedMessage = quotedMsg;
        // if a participant is quoted, then it must be a group
        // hence, remoteJid of group must also be entered
        if (jid !== quoted.key.remoteJid) {
            contextInfo.remoteJid = quoted.key.remoteJid;
        }
        innerMessage[key].contextInfo = contextInfo;
    }
    if (
    // if we want to send a disappearing message
    !!(options === null || options === void 0 ? void 0 : options.ephemeralExpiration) &&
        // and it's not a protocol message -- delete, toggle disappear message
        key !== "protocolMessage" &&
        // already not converted to disappearing message
        key !== "ephemeralMessage") {
        innerMessage[key].contextInfo = {
            ...(innerMessage[key].contextInfo || {}),
            expiration: options.ephemeralExpiration || Defaults_1.WA_DEFAULT_EPHEMERAL,
            //ephemeralSettingTimestamp: options.ephemeralOptions.eph_setting_ts?.toString()
        };
    }
    message = Types_1.WAProto.Message.fromObject(message);
    const messageJSON = {
        key: {
            remoteJid: jid,
            fromMe: true,
            id: (options === null || options === void 0 ? void 0 : options.messageId) || (0, generics_1.generateMessageIDV2)(),
        },
        message: message,
        messageTimestamp: timestamp,
        messageStubParameters: [],
        participant: (0, WABinary_1.isJidGroup)(jid) || (0, WABinary_1.isJidStatusBroadcast)(jid) ? userJid : undefined,
        status: Types_1.WAMessageStatus.PENDING,
    };
    return Types_1.WAProto.WebMessageInfo.fromObject(messageJSON);
};
exports.generateWAMessageFromContent = generateWAMessageFromContent;
const generateWAMessage = async (jid, content, options) => {
    var _c;
    // ensure msg ID is with every log
    options.logger = (_c = options === null || options === void 0 ? void 0 : options.logger) === null || _c === void 0 ? void 0 : _c.child({ msgId: options.messageId });
    return (0, exports.generateWAMessageFromContent)(jid, await (0, exports.generateWAMessageContent)(content, options), options);
};
exports.generateWAMessage = generateWAMessage;
/** Get the key to access the true type of content */
const getContentType = (content) => {
    if (content) {
        const keys = Object.keys(content);
        const key = keys.find((k) => (k === "conversation" || k.includes("Message")) &&
            k !== "senderKeyDistributionMessage");
        return key;
    }
};
exports.getContentType = getContentType;
/**
 * Normalizes ephemeral, view once messages to regular message content
 * Eg. image messages in ephemeral messages, in view once messages etc.
 * @param content
 * @returns
 */
const normalizeMessageContent = (content) => {
    if (!content) {
        return undefined;
    }
    // set max iterations to prevent an infinite loop
    for (let i = 0; i < 5; i++) {
        const inner = getFutureProofMessage(content);
        if (!inner) {
            break;
        }
        content = inner.message;
    }
    return content;
    function getFutureProofMessage(message) {
        if (!message)
            return;
        return (message.editedMessage ||
            message.statusAddYours ||
            message.eventCoverImage ||
            message.botInvokeMessage ||
            message.botTaskMessage ||
            message.questionMessage ||
            message.limitSharingMessage ||
            message.viewOnceMessage ||
            message.ephemeralMessage ||
            message.lottieStickerMessage ||
            message.groupStatusMessage ||
            message.viewOnceMessageV2 ||
            message.statusMentionMessage ||
            message.pollCreationMessageV4 ||
            message.pollCreationMessageV5 ||
            message.associatedChildMessage ||
            message.groupMentionedMessage ||
            message.groupStatusMentionMessage ||
            message.viewOnceMessageV2Extension ||
            message.documentWithCaptionMessage ||
            message.pollCreationOptionImageMessage);
    }
};
exports.normalizeMessageContent = normalizeMessageContent;
/**
 * Extract the true message content from a message
 * Eg. extracts the inner message from a disappearing message/view once message
 */
const extractMessageContent = (content) => {
    const extractFromTemplateMessage = (msg) => {
        if (msg.imageMessage) {
            return { imageMessage: msg.imageMessage };
        }
        else if (msg.documentMessage) {
            return { documentMessage: msg.documentMessage };
        }
        else if (msg.videoMessage) {
            return { videoMessage: msg.videoMessage };
        }
        else if (msg.locationMessage) {
            return { locationMessage: msg.locationMessage };
        }
        else {
            return {
                conversation: "contentText" in msg
                    ? msg.contentText
                    : "hydratedContentText" in msg
                        ? msg.hydratedContentText
                        : "",
            };
        }
    };
    function getTemplateMessage(content) {
        var _c, _d, _e, _f, _g, _h, _j, _k;
        if (!content)
            return;
        return content.buttonsMessage
            ? extractFromTemplateMessage(content.buttonsMessage)
            : content.listMessage
                ? extractFromTemplateMessage(content.listMessage)
                : ((_c = content.templateMessage) === null || _c === void 0 ? void 0 : _c.interactiveMessageTemplate)
                    ? extractFromTemplateMessage(content.templateMessage.interactiveMessageTemplate)
                    : ((_d = content.templateMessage) === null || _d === void 0 ? void 0 : _d.hydratedFourRowTemplate)
                        ? extractFromTemplateMessage(content.templateMessage.hydratedFourRowTemplate)
                        : ((_e = content.templateMessage) === null || _e === void 0 ? void 0 : _e.hydratedTemplate)
                            ? extractFromTemplateMessage(content.templateMessage.hydratedTemplate)
                            : ((_f = content.templateMessage) === null || _f === void 0 ? void 0 : _f.fourRowTemplate)
                                ? extractFromTemplateMessage(content.templateMessage.fourRowTemplate)
                                : ((_g = content.interactiveMessage) === null || _g === void 0 ? void 0 : _g.shopStorefrontMessage)
                                    ? extractFromTemplateMessage(content.interactiveMessage.shopStorefrontMessage)
                                    : ((_h = content.interactiveMessage) === null || _h === void 0 ? void 0 : _h.collectionMessage)
                                        ? extractFromTemplateMessage(content.interactiveMessage.collectionMessage)
                                        : ((_j = content.interactiveMessage) === null || _j === void 0 ? void 0 : _j.nativeFlowMessage)
                                            ? extractFromTemplateMessage(content.interactiveMessage.nativeFlowMessage)
                                            : ((_k = content.interactiveMessage) === null || _k === void 0 ? void 0 : _k.carouselMessage)
                                                ? extractFromTemplateMessage(content.interactiveMessage.carouselMessage)
                                                : content;
    }
    content = (0, exports.normalizeMessageContent)(content);
    return getTemplateMessage(content);
};
exports.extractMessageContent = extractMessageContent;
/**
 * Returns the device predicted by message ID
 */
const getDevice = (id) => /^3A.{18}$/.test(id)
    ? "ios"
    : /^3E.{20}$/.test(id)
        ? "web"
        : /^(.{21}|.{32})$/.test(id)
            ? "android"
            : /^(3F|.{18}$)/.test(id)
                ? "desktop"
                : "unknown";
exports.getDevice = getDevice;
/** Upserts a receipt in the message */
const updateMessageWithReceipt = (msg, receipt) => {
    msg.userReceipt = msg.userReceipt || [];
    const recp = msg.userReceipt.find((m) => m.userJid === receipt.userJid);
    if (recp) {
        Object.assign(recp, receipt);
    }
    else {
        msg.userReceipt.push(receipt);
    }
};
exports.updateMessageWithReceipt = updateMessageWithReceipt;
/** Update the message with a new reaction */
const updateMessageWithReaction = (msg, reaction) => {
    const authorID = (0, generics_1.getKeyAuthor)(reaction.key);
    const reactions = (msg.reactions || []).filter((r) => (0, generics_1.getKeyAuthor)(r.key) !== authorID);
    if (reaction.text) {
        reactions.push(reaction);
    }
    msg.reactions = reactions;
};
exports.updateMessageWithReaction = updateMessageWithReaction;
/** Update the message with a new poll update */
const updateMessageWithPollUpdate = (msg, update) => {
    var _c, _d;
    const authorID = (0, generics_1.getKeyAuthor)(update.pollUpdateMessageKey);
    const reactions = (msg.pollUpdates || []).filter((r) => (0, generics_1.getKeyAuthor)(r.pollUpdateMessageKey) !== authorID);
    if ((_d = (_c = update.vote) === null || _c === void 0 ? void 0 : _c.selectedOptions) === null || _d === void 0 ? void 0 : _d.length) {
        reactions.push(update);
    }
    msg.pollUpdates = reactions;
};
exports.updateMessageWithPollUpdate = updateMessageWithPollUpdate;
/**
 * Aggregates all poll updates in a poll.
 * @param msg the poll creation message
 * @param meId your jid
 * @returns A list of options & their voters
 */
function getAggregateVotesInPollMessage({ message, pollUpdates }, meId) {
    var _c, _d, _e;
    const opts = ((_c = message === null || message === void 0 ? void 0 : message.pollCreationMessage) === null || _c === void 0 ? void 0 : _c.options) ||
        ((_d = message === null || message === void 0 ? void 0 : message.pollCreationMessageV2) === null || _d === void 0 ? void 0 : _d.options) ||
        ((_e = message === null || message === void 0 ? void 0 : message.pollCreationMessageV3) === null || _e === void 0 ? void 0 : _e.options) ||
        [];
    const voteHashMap = opts.reduce((acc, opt) => {
        const hash = (0, crypto_2.sha256)(Buffer.from(opt.optionName || "")).toString();
        acc[hash] = {
            name: opt.optionName || "",
            voters: [],
        };
        return acc;
    }, {});
    for (const update of pollUpdates || []) {
        const { vote } = update;
        if (!vote) {
            continue;
        }
        for (const option of vote.selectedOptions || []) {
            const hash = option.toString();
            let data = voteHashMap[hash];
            if (!data) {
                voteHashMap[hash] = {
                    name: "Unknown",
                    voters: [],
                };
                data = voteHashMap[hash];
            }
            voteHashMap[hash].voters.push((0, generics_1.getKeyAuthor)(update.pollUpdateMessageKey, meId));
        }
    }
    return Object.values(voteHashMap);
}
/** Given a list of message keys, aggregates them by chat & sender. Useful for sending read receipts in bulk */
const aggregateMessageKeysNotFromMe = (keys) => {
    const keyMap = {};
    for (const { remoteJid, id, participant, fromMe } of keys) {
        if (!fromMe) {
            const uqKey = `${remoteJid}:${participant || ""}`;
            if (!keyMap[uqKey]) {
                keyMap[uqKey] = {
                    jid: remoteJid,
                    participant: participant,
                    messageIds: [],
                };
            }
            keyMap[uqKey].messageIds.push(id);
        }
    }
    return Object.values(keyMap);
};
exports.aggregateMessageKeysNotFromMe = aggregateMessageKeysNotFromMe;
const REUPLOAD_REQUIRED_STATUS = [410, 404];
/**
 * Downloads the given message. Throws an error if it's not a media message
 */
const downloadMediaMessage = async (message, type, options, ctx) => {
    const result = await downloadMsg().catch(async (error) => {
        var _c;
        if (ctx &&
            axios_1.default.isAxiosError(error) && // check if the message requires a reupload
            REUPLOAD_REQUIRED_STATUS.includes((_c = error.response) === null || _c === void 0 ? void 0 : _c.status)) {
            ctx.logger.info({ key: message.key }, "sending reupload media request...");
            // request reupload
            message = await ctx.reuploadRequest(message);
            const result = await downloadMsg();
            return result;
        }
        throw error;
    });
    return result;
    async function downloadMsg() {
        const mContent = (0, exports.extractMessageContent)(message.message);
        if (!mContent) {
            throw new boom_2.Boom("No message present", { statusCode: 400, data: message });
        }
        const contentType = (0, exports.getContentType)(mContent);
        let mediaType = contentType === null || contentType === void 0 ? void 0 : contentType.replace("Message", "");
        const media = mContent[contentType];
        if (!media ||
            typeof media !== "object" ||
            (!("url" in media) && !("thumbnailDirectPath" in media))) {
            throw new boom_2.Boom(`"${contentType}" message is not a media message`);
        }
        let download;
        if ("thumbnailDirectPath" in media && !("url" in media)) {
            download = {
                directPath: media.thumbnailDirectPath,
                mediaKey: media.mediaKey,
            };
            mediaType = "thumbnail-link";
        }
        else {
            download = media;
        }
        const stream = await (0, messages_media_1.downloadContentFromMessage)(download, mediaType, options);
        if (type === "buffer") {
            const bufferArray = [];
            for await (const chunk of stream) {
                bufferArray.push(chunk);
            }
            return Buffer.concat(bufferArray);
        }
        return stream;
    }
};
exports.downloadMediaMessage = downloadMediaMessage;
/** Checks whether the given message is a media message; if it is returns the inner content */
const assertMediaContent = (content) => {
    content = (0, exports.extractMessageContent)(content);
    const mediaContent = (content === null || content === void 0 ? void 0 : content.documentMessage) ||
        (content === null || content === void 0 ? void 0 : content.imageMessage) ||
        (content === null || content === void 0 ? void 0 : content.videoMessage) ||
        (content === null || content === void 0 ? void 0 : content.audioMessage) ||
        (content === null || content === void 0 ? void 0 : content.stickerMessage);
    if (!mediaContent) {
        throw new boom_2.Boom("given message is not a media message", {
            statusCode: 400,
            data: content,
        });
    }
    return mediaContent;
};
exports.assertMediaContent = assertMediaContent;
