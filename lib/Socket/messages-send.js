"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMessagesSocket = void 0;
const node_cache_1 = __importDefault(require("@cacheable/node-cache"));
const boom_1 = require("@hapi/boom");
const WAProto_1 = require("../../WAProto");
const Defaults_1 = require("../Defaults");
const Utils_1 = require("../Utils");
const link_preview_1 = require("../Utils/link-preview");
const WABinary_1 = require("../WABinary");
const WAUSync_1 = require("../WAUSync");
const newsletter_1 = require("./newsletter");
const makeMessagesSocket = (config) => {
    const { logger, linkPreviewImageThumbnailWidth, generateHighQualityLinkPreview, options: axiosOptions, patchMessageBeforeSending, cachedGroupMetadata, } = config;
    const sock = (0, newsletter_1.makeNewsLetterSocket)(config);
    const { ev, authState, processingMutex, signalRepository, upsertMessage, query, fetchPrivacySettings, sendNode, groupMetadata, groupToggleEphemeral, } = sock;
    const userDevicesCache = config.userDevicesCache ||
        new node_cache_1.default({
            stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.USER_DEVICES, // 5 minutes
            useClones: false,
        });
    let mediaConn;
    const refreshMediaConn = async (forceGet = false) => {
        const media = await mediaConn;
        if (!media ||
            forceGet ||
            new Date().getTime() - media.fetchDate.getTime() > media.ttl * 1000) {
            mediaConn = (async () => {
                const result = await query({
                    tag: "iq",
                    attrs: {
                        type: "set",
                        xmlns: "w:m",
                        to: WABinary_1.S_WHATSAPP_NET,
                    },
                    content: [{ tag: "media_conn", attrs: {} }],
                });
                const mediaConnNode = (0, WABinary_1.getBinaryNodeChild)(result, "media_conn");
                const node = {
                    hosts: (0, WABinary_1.getBinaryNodeChildren)(mediaConnNode, "host").map(({ attrs }) => ({
                        hostname: attrs.hostname,
                        maxContentLengthBytes: +attrs.maxContentLengthBytes,
                    })),
                    auth: mediaConnNode.attrs.auth,
                    ttl: +mediaConnNode.attrs.ttl,
                    fetchDate: new Date(),
                };
                logger.debug("fetched media conn");
                return node;
            })();
        }
        return mediaConn;
    };
    /**
     * generic send receipt function
     * used for receipts of phone call, read, delivery etc.
     * */
    const sendReceipt = async (jid, participant, messageIds, type) => {
        const node = {
            tag: "receipt",
            attrs: {
                id: messageIds[0],
            },
        };
        const isReadReceipt = type === "read" || type === "read-self";
        if (isReadReceipt) {
            node.attrs.t = (0, Utils_1.unixTimestampSeconds)().toString();
        }
        if (type === "sender" && (0, WABinary_1.isJidUser)(jid)) {
            node.attrs.recipient = jid;
            node.attrs.to = participant;
        }
        else {
            node.attrs.to = jid;
            if (participant) {
                node.attrs.participant = participant;
            }
        }
        if (type) {
            node.attrs.type = type;
        }
        const remainingMessageIds = messageIds.slice(1);
        if (remainingMessageIds.length) {
            node.content = [
                {
                    tag: "list",
                    attrs: {},
                    content: remainingMessageIds.map((id) => ({
                        tag: "item",
                        attrs: { id },
                    })),
                },
            ];
        }
        logger.debug({ attrs: node.attrs, messageIds }, "sending receipt for messages");
        await sendNode(node);
    };
    /** Correctly bulk send receipts to multiple chats, participants */
    const sendReceipts = async (keys, type) => {
        const recps = (0, Utils_1.aggregateMessageKeysNotFromMe)(keys);
        for (const { jid, participant, messageIds } of recps) {
            await sendReceipt(jid, participant, messageIds, type);
        }
    };
    /** Bulk read messages. Keys can be from different chats & participants */
    const readMessages = async (keys) => {
        const privacySettings = await fetchPrivacySettings();
        // based on privacy settings, we have to change the read type
        const readType = privacySettings.readreceipts === "all" ? "read" : "read-self";
        await sendReceipts(keys, readType);
    };
    /** Fetch all the devices we've to send a message to */
    const getUSyncDevices = async (jids, useCache, ignoreZeroDevices) => {
        var _a;
        const deviceResults = [];
        if (!useCache) {
            logger.debug("not using cache for devices");
        }
        const toFetch = [];
        jids = Array.from(new Set(jids));
        for (let jid of jids) {
            const user = (_a = (0, WABinary_1.jidDecode)(jid)) === null || _a === void 0 ? void 0 : _a.user;
            jid = (0, WABinary_1.jidNormalizedUser)(jid);
            if (useCache) {
                const devices = userDevicesCache.get(user);
                if (devices) {
                    deviceResults.push(...devices);
                    logger.trace({ user }, "using cache for devices");
                }
                else {
                    toFetch.push(jid);
                }
            }
            else {
                toFetch.push(jid);
            }
        }
        if (!toFetch.length) {
            return deviceResults;
        }
        const query = new WAUSync_1.USyncQuery().withContext("message").withDeviceProtocol();
        for (const jid of toFetch) {
            query.withUser(new WAUSync_1.USyncUser().withId(jid));
        }
        const result = await sock.executeUSyncQuery(query);
        if (result) {
            const extracted = (0, Utils_1.extractDeviceJids)(result === null || result === void 0 ? void 0 : result.list, authState.creds.me.id, ignoreZeroDevices);
            const deviceMap = {};
            for (const item of extracted) {
                deviceMap[item.user] = deviceMap[item.user] || [];
                deviceMap[item.user].push(item);
                deviceResults.push(item);
            }
            for (const key in deviceMap) {
                userDevicesCache.set(key, deviceMap[key]);
            }
        }
        return deviceResults;
    };
    const assertSessions = async (jids, force) => {
        let didFetchNewSession = false;
        let jidsRequiringFetch = [];
        if (force) {
            jidsRequiringFetch = jids;
        }
        else {
            const addrs = jids.map((jid) => signalRepository.jidToSignalProtocolAddress(jid));
            const sessions = await authState.keys.get("session", addrs);
            for (const jid of jids) {
                const signalId = signalRepository.jidToSignalProtocolAddress(jid);
                if (!sessions[signalId]) {
                    jidsRequiringFetch.push(jid);
                }
            }
        }
        if (jidsRequiringFetch.length) {
            logger.debug({ jidsRequiringFetch }, "fetching sessions");
            const result = await query({
                tag: "iq",
                attrs: {
                    xmlns: "encrypt",
                    type: "get",
                    to: WABinary_1.S_WHATSAPP_NET,
                },
                content: [
                    {
                        tag: "key",
                        attrs: {},
                        content: jidsRequiringFetch.map((jid) => ({
                            tag: "user",
                            attrs: { jid },
                        })),
                    },
                ],
            });
            await (0, Utils_1.parseAndInjectE2ESessions)(result, signalRepository);
            didFetchNewSession = true;
        }
        return didFetchNewSession;
    };
    const sendPeerDataOperationMessage = async (pdoMessage) => {
        var _a;
        //TODO: for later, abstract the logic to send a Peer Message instead of just PDO - useful for App State Key Resync with phone
        if (!((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new boom_1.Boom("Not authenticated");
        }
        const protocolMessage = {
            protocolMessage: {
                peerDataOperationRequestMessage: pdoMessage,
                type: WAProto_1.proto.Message.ProtocolMessage.Type
                    .PEER_DATA_OPERATION_REQUEST_MESSAGE,
            },
        };
        const meJid = (0, WABinary_1.jidNormalizedUser)(authState.creds.me.id);
        const msgId = await relayMessage(meJid, protocolMessage, {
            additionalAttributes: {
                category: "peer",
                // eslint-disable-next-line camelcase
                push_priority: "high_force",
            },
        });
        return msgId;
    };
    const createParticipantNodes = async (jids, message, extraAttrs) => {
        let patched = await patchMessageBeforeSending(message, jids);
        if (!Array.isArray(patched)) {
            patched = jids
                ? jids.map((jid) => ({ recipientJid: jid, ...patched }))
                : [patched];
        }
        let shouldIncludeDeviceIdentity = false;
        const nodes = await Promise.all(patched.map(async (patchedMessageWithJid) => {
            const { recipientJid: jid, ...patchedMessage } = patchedMessageWithJid;
            if (!jid) {
                return {};
            }
            const bytes = (0, Utils_1.encodeWAMessage)(patchedMessage);
            const { type, ciphertext } = await signalRepository.encryptMessage({
                jid,
                data: bytes,
            });
            if (type === "pkmsg") {
                shouldIncludeDeviceIdentity = true;
            }
            const node = {
                tag: "to",
                attrs: { jid },
                content: [
                    {
                        tag: "enc",
                        attrs: {
                            v: "2",
                            type,
                            ...(extraAttrs || {}),
                        },
                        content: ciphertext,
                    },
                ],
            };
            return node;
        }));
        return { nodes, shouldIncludeDeviceIdentity };
    };
    const relayMessage = async (jid, message, options, attempts = 0, maxRetries = 5) => {
        try {
            return await relayMessageB(jid, message, options);
        }
        catch (e) {
            if (/rate\-overlimit/i.test(e.message) && attempts < maxRetries) {
                console.log(`Percobaan ke-${attempts + 1}, menunggu 2 detik...`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                return relayMessage(jid, message, options, attempts + 1, maxRetries);
            }
            throw e;
        }
    };
    const relayMessageB = async (jid, message, { messageId: msgId, participant, additionalAttributes, additionalNodes, useUserDevicesCache, useCachedGroupMetadata, statusJidList, }) => {
        var _a;
        const meId = authState.creds.me.id;
        let shouldIncludeDeviceIdentity = false;
        const { user, server } = (0, WABinary_1.jidDecode)(jid);
        const statusJid = "status@broadcast";
        const isGroup = server === "g.us";
        const isStatus = jid === statusJid;
        const isLid = server === "lid";
        const isNewSletter = server === "newsletter";
        msgId = msgId || (0, Utils_1.generateMessageIDV2)((_a = sock.user) === null || _a === void 0 ? void 0 : _a.id);
        useUserDevicesCache = useUserDevicesCache !== false;
        useCachedGroupMetadata = useCachedGroupMetadata !== false && !isStatus;
        const participants = [];
        const destinationJid = !isStatus
            ? (0, WABinary_1.jidEncode)(user, isLid
                ? "lid"
                : isGroup
                    ? "g.us"
                    : isNewSletter
                        ? "newsletter"
                        : "s.whatsapp.net")
            : statusJid;
        const binaryNodeContent = [];
        const devices = [];
        const meMsg = {
            deviceSentMessage: {
                destinationJid,
                message,
            },
            messageContextInfo: message.messageContextInfo,
        };
        const extraAttrs = {};
        if (participant) {
            // when the retry request is not for a group
            // only send to the specific device that asked for a retry
            // otherwise the message is sent out to every device that should be a recipient
            if (!isGroup && !isStatus) {
                additionalAttributes = {
                    ...additionalAttributes,
                    device_fanout: "false",
                };
            }
            const { user, device } = (0, WABinary_1.jidDecode)(participant.jid);
            devices.push({ user, device });
        }
        await authState.keys.transaction(async () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const mediaType = getMediaType(message);
            if (mediaType) {
                extraAttrs["mediatype"] = mediaType;
            }
            if ((_a = (0, Utils_1.normalizeMessageContent)(message)) === null || _a === void 0 ? void 0 : _a.pinInChatMessage) {
                extraAttrs["decrypt-fail"] = "hide";
            }
            if (isGroup || isStatus) {
                const [groupData, senderKeyMap] = await Promise.all([
                    (async () => {
                        let groupData = useCachedGroupMetadata && cachedGroupMetadata
                            ? await cachedGroupMetadata(jid)
                            : undefined;
                        if (groupData && Array.isArray(groupData === null || groupData === void 0 ? void 0 : groupData.participants)) {
                            logger.trace({ jid, participants: groupData.participants.length }, "using cached group metadata");
                        }
                        else if (!isStatus) {
                            groupData = await groupMetadata(jid);
                        }
                        return groupData;
                    })(),
                    (async () => {
                        if (!participant && !isStatus) {
                            const result = await authState.keys.get("sender-key-memory", [
                                jid,
                            ]);
                            return result[jid] || {};
                        }
                        return {};
                    })(),
                ]);
                if (!participant) {
                    const participantsList = groupData && !isStatus
                        ? groupData.participants.map((p) => p.id)
                        : [];
                    if (isStatus && statusJidList) {
                        participantsList.push(...statusJidList);
                    }
                    if (!isStatus) {
                        additionalAttributes = {
                            ...additionalAttributes,
                            addressing_mode: (groupData === null || groupData === void 0 ? void 0 : groupData.addressingMode) || "pn",
                        };
                    }
                    const additionalDevices = await getUSyncDevices(participantsList, !!useUserDevicesCache, false);
                    devices.push(...additionalDevices);
                }
                const patched = await patchMessageBeforeSending(message);
                if (Array.isArray(patched)) {
                    throw new boom_1.Boom("Per-jid patching is not supported in groups");
                }
                const bytes = (0, Utils_1.encodeWAMessage)(patched);
                const { ciphertext, senderKeyDistributionMessage } = await signalRepository.encryptGroupMessage({
                    group: destinationJid,
                    data: bytes,
                    meId,
                });
                const senderKeyJids = [];
                // ensure a connection is established with every device
                for (const { user, device } of devices) {
                    const jid = (0, WABinary_1.jidEncode)(user, (groupData === null || groupData === void 0 ? void 0 : groupData.addressingMode) === "lid" ? "lid" : "s.whatsapp.net", device);
                    if (!senderKeyMap[jid] || !!participant) {
                        senderKeyJids.push(jid);
                        // store that this person has had the sender keys sent to them
                        senderKeyMap[jid] = true;
                    }
                }
                // if there are some participants with whom the session has not been established
                // if there are, we re-send the senderkey
                if (senderKeyJids.length) {
                    logger.debug({ senderKeyJids }, "sending new sender key");
                    const senderKeyMsg = {
                        senderKeyDistributionMessage: {
                            axolotlSenderKeyDistributionMessage: senderKeyDistributionMessage,
                            groupId: destinationJid,
                        },
                    };
                    await assertSessions(senderKeyJids, false);
                    const result = await createParticipantNodes(senderKeyJids, senderKeyMsg, extraAttrs);
                    shouldIncludeDeviceIdentity =
                        shouldIncludeDeviceIdentity || result.shouldIncludeDeviceIdentity;
                    participants.push(...result.nodes);
                }
                binaryNodeContent.push({
                    tag: "enc",
                    attrs: { v: "2", type: "skmsg" },
                    content: ciphertext,
                });
                await authState.keys.set({
                    "sender-key-memory": { [jid]: senderKeyMap },
                });
            }
            else if (isNewSletter) {
                // Message edit
                if ((_b = message.protocolMessage) === null || _b === void 0 ? void 0 : _b.editedMessage) {
                    msgId = (_c = message.protocolMessage.key) === null || _c === void 0 ? void 0 : _c.id;
                    message = message.protocolMessage.editedMessage;
                }
                // Message delete
                if (((_d = message.protocolMessage) === null || _d === void 0 ? void 0 : _d.type) ===
                    WAProto_1.proto.Message.ProtocolMessage.Type.REVOKE) {
                    msgId = (_e = message.protocolMessage.key) === null || _e === void 0 ? void 0 : _e.id;
                    message = {};
                }
                const patched = await patchMessageBeforeSending(message, []);
                const bytes = WAProto_1.proto.Message.encode(patched).finish();
                binaryNodeContent.push({
                    tag: "plaintext",
                    attrs: mediaType ? { mediatype: mediaType } : {},
                    content: bytes,
                });
            }
            else {
                const { user: meUser } = (0, WABinary_1.jidDecode)(meId);
                if (!participant) {
                    devices.push({ user });
                    if (user !== meUser) {
                        devices.push({ user: meUser });
                    }
                    if ((additionalAttributes === null || additionalAttributes === void 0 ? void 0 : additionalAttributes["category"]) !== "peer") {
                        const additionalDevices = await getUSyncDevices([meId, jid], !!useUserDevicesCache, true);
                        devices.push(...additionalDevices);
                    }
                }
                const allJids = [];
                const meJids = [];
                const otherJids = [];
                for (const { user, device } of devices) {
                    const isMe = user === meUser;
                    const jid = (0, WABinary_1.jidEncode)(isMe && isLid
                        ? ((_g = (_f = authState.creds) === null || _f === void 0 ? void 0 : _f.me) === null || _g === void 0 ? void 0 : _g.lid.split(":")[0]) || user
                        : user, isLid ? "lid" : "s.whatsapp.net", device);
                    if (isMe) {
                        meJids.push(jid);
                    }
                    else {
                        otherJids.push(jid);
                    }
                    allJids.push(jid);
                }
                await assertSessions(allJids, false);
                const [{ nodes: meNodes, shouldIncludeDeviceIdentity: s1 }, { nodes: otherNodes, shouldIncludeDeviceIdentity: s2 },] = await Promise.all([
                    createParticipantNodes(meJids, meMsg, extraAttrs),
                    createParticipantNodes(otherJids, message, extraAttrs),
                ]);
                participants.push(...meNodes);
                participants.push(...otherNodes);
                shouldIncludeDeviceIdentity = shouldIncludeDeviceIdentity || s1 || s2;
            }
            if (participants.length) {
                if ((additionalAttributes === null || additionalAttributes === void 0 ? void 0 : additionalAttributes["category"]) === "peer") {
                    const peerNode = (_j = (_h = participants[0]) === null || _h === void 0 ? void 0 : _h.content) === null || _j === void 0 ? void 0 : _j[0];
                    if (peerNode) {
                        binaryNodeContent.push(peerNode); // push only enc
                    }
                }
                else {
                    binaryNodeContent.push({
                        tag: "participants",
                        attrs: {},
                        content: participants,
                    });
                }
            }
            const stanza = {
                tag: "message",
                attrs: {
                    id: msgId,
                    type: getTypeMessage(message),
                    ...(additionalAttributes || {}),
                },
                content: binaryNodeContent,
            };
            // if the participant to send to is explicitly specified (generally retry recp)
            // ensure the message is only sent to that person
            // if a retry receipt is sent to everyone -- it'll fail decryption for everyone else who received the msg
            if (participant) {
                if ((0, WABinary_1.isJidGroup)(destinationJid)) {
                    stanza.attrs.to = destinationJid;
                    stanza.attrs.participant = participant.jid;
                }
                else if ((0, WABinary_1.areJidsSameUser)(participant.jid, meId)) {
                    stanza.attrs.to = participant.jid;
                    stanza.attrs.recipient = destinationJid;
                }
                else {
                    stanza.attrs.to = participant.jid;
                }
            }
            else {
                stanza.attrs.to = destinationJid;
            }
            if (shouldIncludeDeviceIdentity) {
                stanza.content.push({
                    tag: "device-identity",
                    attrs: {},
                    content: (0, Utils_1.encodeSignedDeviceIdentity)(authState.creds.account, true),
                });
                logger.debug({ jid }, "adding device identity");
            }
            const messages = (0, Utils_1.normalizeMessageContent)(message);
            const messagesType = getButtonType(messages);
            const isViewOnceButton = isViewOnceWithSpecificType(message);
            if (!isNewSletter &&
                (messagesType || isViewOnceButton) &&
                ((_k = messages === null || messages === void 0 ? void 0 : messages.listMessage) === null || _k === void 0 ? void 0 : _k.listType) !== "PRODUCT_LIST") {
                if (!stanza.content || !Array.isArray(stanza.content)) {
                    stanza.content = [];
                }
                const businessNode = {
                    tag: "biz",
                    attrs: {},
                    content: [
                        {
                            ...getButtonArgs(messages, message),
                        },
                    ],
                };
                /*const resultFilteredButtons = getBinaryFilteredButtons([businessNode]);
                if (resultFilteredButtons.length > 0) {
                  stanza.content.push(...resultFilteredButtons);
                } else {
                  stanza.content.push(businessNode);
                }*/
                stanza.content.push(businessNode);
                logger.debug({ jid }, "adding business node");
            }
            if (additionalNodes && additionalNodes.length > 0) {
                stanza.content.push(...additionalNodes);
            }
            logger.debug({ msgId }, `sending message to ${participants.length} devices`);
            await sendNode(stanza);
        });
        return msgId;
    };
    const getTypeMessage = (msg) => {
        /*if (msg.viewOnceMessage) {
          return getTypeMessage(msg?.viewOnceMessage?.message);
        } else if (msg.viewOnceMessageV2) {
          return getTypeMessage(msg?.viewOnceMessageV2?.message);
        } else if (msg.viewOnceMessageV2Extension) {
          return getTypeMessage(msg.viewOnceMessageV2Extension?.message);
        } else if (msg.ephemeralMessage) {
          return getTypeMessage(msg.ephemeralMessage?.message);
        } else if (msg.documentWithCaptionMessage) {
          return getTypeMessage(msg.documentWithCaptionMessage?.message);
        } else if (msg.reactionMessage) {
          return "reaction";
        } else*/
        if (msg.pollCreationMessage ||
            msg.pollCreationMessageV2 ||
            msg.pollCreationMessageV3 ||
            /*msg.pollCreationMessageV4 ||
            msg.pollCreationMessageV5 ||
            msg.pollCreationMessageV6 ||*/
            msg.pollUpdateMessage) {
            return "poll";
        } /*else if (getMediaType(msg)) {
          return "media";
        }*/
        else {
            return "text";
        }
    };
    const getMediaType = (message) => {
        if (message.imageMessage) {
            return "image";
        }
        else if (message.videoMessage) {
            return message.videoMessage.gifPlayback ? "gif" : "video";
        }
        else if (message.audioMessage) {
            return message.audioMessage.ptt ? "ptt" : "audio";
        }
        else if (message.contactMessage) {
            return "vcard";
        }
        else if (message.documentMessage) {
            return "document";
        }
        else if (message.contactsArrayMessage) {
            return "contact_array";
        }
        else if (message.liveLocationMessage) {
            return "livelocation";
        }
        else if (message.stickerMessage) {
            return "sticker";
        }
        else if (message.listMessage) {
            return "list";
        }
        else if (message.listResponseMessage) {
            return "list_response";
        }
        else if (message.buttonsResponseMessage) {
            return "buttons_response";
        }
        else if (message.orderMessage) {
            return "order";
        }
        else if (message.productMessage) {
            return "product";
        }
        else if (message.interactiveResponseMessage) {
            return "native_flow_response";
        }
        else if (message.groupInviteMessage) {
            return "url";
        }
    };
    const getButtonType = (message) => {
        if (message.listMessage) {
            return "list";
        }
        else if (message.listResponseMessage) {
            return "list_response";
        }
        else if (message.buttonsMessage) {
            return "buttons";
        }
        else if (message.buttonsResponseMessage) {
            return "buttons_response";
        }
        else if (message.templateMessage) {
            return "template";
        }
        else if (message.templateButtonReplyMessage) {
            return "template_response";
        }
        else if (message.interactiveMessage) {
            return "interactive";
        }
        else if (message.interactiveResponseMessage) {
            return "native_flow_response";
        }
    };
    const getButtonArgs = (message, message2) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const type = Object.keys(message || {})[0];
        if (((_a = message.interactiveMessage) === null || _a === void 0 ? void 0 : _a.nativeFlowMessage) &&
            ((_c = (_b = message.interactiveMessage.nativeFlowMessage) === null || _b === void 0 ? void 0 : _b.buttons) === null || _c === void 0 ? void 0 : _c.length) > 0 &&
            message.interactiveMessage.nativeFlowMessage.buttons[0].name ===
                "review_and_pay") {
            return {
                tag: "biz",
                attrs: {
                    native_flow_name: "order_details",
                },
            };
        }
        else if (((_d = message.interactiveMessage) === null || _d === void 0 ? void 0 : _d.nativeFlowMessage) &&
            ((_f = (_e = message.interactiveMessage.nativeFlowMessage) === null || _e === void 0 ? void 0 : _e.buttons) === null || _f === void 0 ? void 0 : _f.length) > 0 &&
            message.interactiveMessage.nativeFlowMessage.buttons[0].name ===
                "payment_info") {
            return {
                tag: "biz",
                attrs: {
                    native_flow_name: "payment_info",
                },
            };
        }
        else if (((_g = message.interactiveMessage) === null || _g === void 0 ? void 0 : _g.nativeFlowMessage) &&
            ((_j = (_h = message.interactiveMessage.nativeFlowMessage) === null || _h === void 0 ? void 0 : _h.buttons) === null || _j === void 0 ? void 0 : _j.length) > 0 &&
            [
                "mpm",
                "cta_catalog",
                "send_location",
                "call_permission_request",
                "wa_payment_transaction_details",
                "automated_greeting_message_view_catalog",
            ].includes(message.interactiveMessage.nativeFlowMessage.buttons[0].name)) {
            return {
                tag: "biz",
                attrs: {},
                content: [
                    {
                        tag: "interactive",
                        attrs: {
                            type: "native_flow",
                            v: "1",
                        },
                        content: [
                            {
                                tag: "native_flow",
                                attrs: {
                                    v: "2",
                                    name: message.interactiveMessage.nativeFlowMessage.buttons[0]
                                        .name,
                                },
                            },
                        ],
                    },
                ],
            };
        }
        else if (["buttonsMessage", "interactiveMessage"].includes(type) ||
            isViewOnceWithSpecificType(message2)) {
            return {
                tag: "interactive",
                attrs: {
                    type: "native_flow",
                    v: "1",
                },
                content: [
                    {
                        tag: "native_flow",
                        attrs: { v: "9", name: "mixed" },
                    },
                    /*{
                      tag: "native_flow",
                      attrs: {
                        name: "quick_reply",
                      },
                    },*/
                ],
            };
        }
        else if (message.listMessage) {
            return {
                tag: "list",
                attrs: {
                    type: "product_list",
                    v: "2",
                },
            };
        }
        else {
            return {
                tag: "biz",
                attrs: {},
            };
        }
    };
    const isViewOnceWithSpecificType = (message) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!message)
            return false;
        return (((_b = (_a = ((message === null || message === void 0 ? void 0 : message.viewOnceMessage) ||
            (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2) ||
            (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2Extension))) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.interactiveMessage) ||
            ((_d = (_c = ((message === null || message === void 0 ? void 0 : message.viewOnceMessage) ||
                (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2) ||
                (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2Extension))) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.ephemeralMessage) ||
            ((_f = (_e = ((message === null || message === void 0 ? void 0 : message.viewOnceMessage) ||
                (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2) ||
                (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2Extension))) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.buttonsMessage) ||
            ((_h = (_g = ((message === null || message === void 0 ? void 0 : message.viewOnceMessage) ||
                (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2) ||
                (message === null || message === void 0 ? void 0 : message.viewOnceMessageV2Extension))) === null || _g === void 0 ? void 0 : _g.message) === null || _h === void 0 ? void 0 : _h.templateMessage));
    };
    const getPrivacyTokens = async (jids) => {
        const t = (0, Utils_1.unixTimestampSeconds)().toString();
        const result = await query({
            tag: "iq",
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: "set",
                xmlns: "privacy",
            },
            content: [
                {
                    tag: "tokens",
                    attrs: {},
                    content: jids.map((jid) => ({
                        tag: "token",
                        attrs: {
                            jid: (0, WABinary_1.jidNormalizedUser)(jid),
                            t,
                            type: "trusted_contact",
                        },
                    })),
                },
            ],
        });
        return result;
    };
    const waUploadToServer = (0, Utils_1.getWAUploadToServer)(config, refreshMediaConn);
    const waitForMsgMediaUpdate = (0, Utils_1.bindWaitForEvent)(ev, "messages.media-update");
    return {
        ...sock,
        getPrivacyTokens,
        assertSessions,
        relayMessage,
        sendReceipt,
        sendReceipts,
        readMessages,
        refreshMediaConn,
        waUploadToServer,
        fetchPrivacySettings,
        sendPeerDataOperationMessage,
        createParticipantNodes,
        getUSyncDevices,
        updateMediaMessage: async (message) => {
            const content = (0, Utils_1.assertMediaContent)(message.message);
            const mediaKey = content.mediaKey;
            const meId = authState.creds.me.id;
            const node = await (0, Utils_1.encryptMediaRetryRequest)(message.key, mediaKey, meId);
            let error = undefined;
            await Promise.all([
                sendNode(node),
                waitForMsgMediaUpdate(async (update) => {
                    const result = update.find((c) => c.key.id === message.key.id);
                    if (result) {
                        if (result.error) {
                            error = result.error;
                        }
                        else {
                            try {
                                const media = await (0, Utils_1.decryptMediaRetryData)(result.media, mediaKey, result.key.id);
                                if (media.result !==
                                    WAProto_1.proto.MediaRetryNotification.ResultType.SUCCESS) {
                                    const resultStr = WAProto_1.proto.MediaRetryNotification.ResultType[media.result];
                                    throw new boom_1.Boom(`Media re-upload failed by device (${resultStr})`, {
                                        data: media,
                                        statusCode: (0, Utils_1.getStatusCodeForMediaRetry)(media.result) || 404,
                                    });
                                }
                                content.directPath = media.directPath;
                                content.url = (0, Utils_1.getUrlFromDirectPath)(content.directPath);
                                logger.debug({ directPath: media.directPath, key: result.key }, "media update successful");
                            }
                            catch (err) {
                                error = err;
                            }
                        }
                        return true;
                    }
                }),
            ]);
            if (error) {
                throw error;
            }
            ev.emit("messages.update", [
                { key: message.key, update: { message: message.message } },
            ]);
            return message;
        },
        sendMessage: async (jid, content, options = {}) => {
            var _a, _b, _c, _d, _e;
            const userJid = authState.creds.me.id;
            if (!options.ephemeralExpiration) {
                if ((0, WABinary_1.isJidGroup)(jid)) {
                    const groups = await sock.groupQuery(jid, "get", [
                        {
                            tag: "query",
                            attrs: {
                                request: "interactive",
                            },
                        },
                    ]);
                    const metadata = (0, WABinary_1.getBinaryNodeChild)(groups, "group");
                    const expiration = ((_b = (_a = (0, WABinary_1.getBinaryNodeChild)(metadata, "ephemeral")) === null || _a === void 0 ? void 0 : _a.attrs) === null || _b === void 0 ? void 0 : _b.expiration) || 0;
                    options.ephemeralExpiration = expiration;
                }
            }
            if (typeof content === "object" &&
                "disappearingMessagesInChat" in content &&
                typeof content["disappearingMessagesInChat"] !== "undefined" &&
                (0, WABinary_1.isJidGroup)(jid)) {
                const { disappearingMessagesInChat } = content;
                const value = typeof disappearingMessagesInChat === "boolean"
                    ? disappearingMessagesInChat
                        ? Defaults_1.WA_DEFAULT_EPHEMERAL
                        : 0
                    : disappearingMessagesInChat;
                await groupToggleEphemeral(jid, value);
            }
            else {
                let mediaHandle;
                const fullMsg = await (0, Utils_1.generateWAMessage)(jid, content, {
                    logger,
                    userJid,
                    getUrlInfo: (text) => (0, link_preview_1.getUrlInfo)(text, {
                        thumbnailWidth: linkPreviewImageThumbnailWidth,
                        fetchOpts: {
                            timeout: 3000,
                            ...(axiosOptions || {}),
                        },
                        logger,
                        uploadImage: generateHighQualityLinkPreview
                            ? waUploadToServer
                            : undefined,
                    }),
                    //TODO: CACHE
                    getProfilePicUrl: sock.profilePictureUrl,
                    upload: async (readStream, opts) => {
                        const up = await waUploadToServer(readStream, {
                            ...opts,
                            newsletter: (0, WABinary_1.isJidNewsletter)(jid),
                        });
                        mediaHandle = up.handle;
                        return up;
                    },
                    mediaCache: config.mediaCache,
                    options: config.options,
                    messageId: (0, Utils_1.generateMessageIDV2)((_c = sock.user) === null || _c === void 0 ? void 0 : _c.id),
                    ...options,
                });
                const isDeleteMsg = "delete" in content && !!content.delete;
                const isEditMsg = "edit" in content && !!content.edit;
                const isPinMsg = "pin" in content && !!content.pin;
                const isPollMessage = "poll" in content && !!content.poll;
                const isAi = "ai" in content && !!content.ai;
                const isKeep = "keep" in content && !!content.keep;
                const additionalAttributes = {};
                const additionalNodes = [];
                // required for delete
                if (isDeleteMsg) {
                    // if the chat is a group, and I am not the author, then delete the message as an admin
                    if (((0, WABinary_1.isJidGroup)((_d = content.delete) === null || _d === void 0 ? void 0 : _d.remoteJid) &&
                        !((_e = content.delete) === null || _e === void 0 ? void 0 : _e.fromMe)) ||
                        (0, WABinary_1.isJidNewsletter)(jid)) {
                        additionalAttributes.edit = "8";
                    }
                    else {
                        additionalAttributes.edit = "7";
                    }
                }
                else if (isEditMsg) {
                    additionalAttributes.edit = "1";
                }
                else if (isKeep) {
                    additionalAttributes.edit = "6";
                }
                else if (isPinMsg) {
                    additionalAttributes.edit = "2";
                }
                else if (isAi) {
                    additionalNodes.push({ attrs: { biz_bot: "1" }, tag: "bot" }, { attrs: {}, tag: "biz" });
                }
                else if (isPollMessage) {
                    additionalNodes.push({
                        tag: "meta",
                        attrs: {
                            polltype: "creation",
                        },
                    });
                }
                if ("cachedGroupMetadata" in options) {
                    console.warn("cachedGroupMetadata in sendMessage are deprecated, now cachedGroupMetadata is part of the socket config.");
                }
                if (mediaHandle) {
                    additionalAttributes["media_id"] = mediaHandle;
                }
                await relayMessage(jid, fullMsg.message, {
                    messageId: fullMsg.key.id,
                    useCachedGroupMetadata: options.useCachedGroupMetadata,
                    additionalAttributes,
                    statusJidList: options.statusJidList,
                    additionalNodes,
                });
                if (config.emitOwnEvents) {
                    process.nextTick(() => {
                        processingMutex.mutex(() => upsertMessage(fullMsg, "append"));
                    });
                }
                return fullMsg;
            }
        },
        sendAlbumMessage: async (jid, medias, options = {}) => {
            var _a, _b, _c, _d, _e;
            /*
              Which makes the code;
              WhatsApp Channel: https://whatsapp.com/channel/0029VajRhmk2P59nLvTfyx3v
              Don't delete this WM, you must accept the risk!
            */
            if (typeof jid !== "string")
                throw new TypeError(`jid must be string, received: ${jid} (${(_a = jid === null || jid === void 0 ? void 0 : jid.constructor) === null || _a === void 0 ? void 0 : _a.name})`);
            for (const media of medias) {
                if (!media.type || (media.type !== "image" && media.type !== "video"))
                    throw new TypeError(`medias[i].type must be "image" or "video", received: ${media.type} (${(_c = (_b = media.type) === null || _b === void 0 ? void 0 : _b.constructor) === null || _c === void 0 ? void 0 : _c.name})`);
                if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data)))
                    throw new TypeError(`medias[i].data must be object with url or buffer, received: ${media.data} (${(_e = (_d = media.data) === null || _d === void 0 ? void 0 : _d.constructor) === null || _e === void 0 ? void 0 : _e.name})`);
            }
            if (medias.length < 2)
                throw new RangeError("Minimum 2 media");
            const caption = options.text || options.caption || "";
            const delay = !isNaN(options.delay) ? options.delay : 500;
            delete options.text;
            delete options.caption;
            delete options.delay;
            const album = (0, Utils_1.generateWAMessageFromContent)(jid, {
                messageContextInfo: {
                    messageSecret: new Uint8Array(randomBytes(32)),
                },
                albumMessage: {
                    expectedImageCount: medias.filter((media) => media.type === "image")
                        .length,
                    expectedVideoCount: medias.filter((media) => media.type === "video")
                        .length,
                    ...(options.quoted
                        ? {
                            contextInfo: {
                                remoteJid: options.quoted.key.remoteJid,
                                fromMe: options.quoted.key.fromMe,
                                stanzaId: options.quoted.key.id,
                                participant: options.quoted.key.participant ||
                                    options.quoted.key.remoteJid,
                                quotedMessage: options.quoted.message,
                            },
                        }
                        : {}),
                },
            }, {});
            await relayMessage(album.key.remoteJid, album.message, {
                messageId: album.key.id,
            });
            for (const media of medias) {
                const img = await (0, Utils_1.generateWAMessage)(album.key.remoteJid, {
                    [media.type]: media.data,
                    caption,
                }, {
                    upload: waUploadToServer,
                });
                img.message.messageContextInfo = {
                    messageSecret: new Uint8Array(randomBytes(32)),
                    messageAssociation: {
                        associationType: 1,
                        parentMessageKey: album.key,
                    },
                };
                await relayMessage(img.key.remoteJid, img.message, {
                    messageId: img.key.id,
                });
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
            if (config.emitOwnEvents) {
                process.nextTick(() => {
                    processingMutex.mutex(() => upsertMessage(album, "append"));
                });
            }
            return album;
        },
        fileName: "Message-Send.js",
    };
};
exports.makeMessagesSocket = makeMessagesSocket;
