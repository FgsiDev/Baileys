import NodeCache from "@cacheable/node-cache";
import { Boom } from "@hapi/boom";
import { proto } from "../../WAProto";
import { DEFAULT_CACHE_TTLS, WA_DEFAULT_EPHEMERAL } from "../Defaults";
import {
  aggregateMessageKeysNotFromMe,
  assertMediaContent,
  bindWaitForEvent,
  decryptMediaRetryData,
  encodeNewsletterMessage,
  encodeSignedDeviceIdentity,
  encodeWAMessage,
  encryptMediaRetryRequest,
  extractDeviceJids,
  generateMessageIDV2,
  generateWAMessage,
  getStatusCodeForMediaRetry,
  getUrlFromDirectPath,
  getWAUploadToServer,
  normalizeMessageContent,
  parseAndInjectE2ESessions,
  unixTimestampSeconds,
} from "../Utils";
import { getUrlInfo } from "../Utils/link-preview";
import {
  areJidsSameUser,
  getBinaryNodeChild,
  getBinaryNodeChildren,
  isJidGroup,
  isJidUser,
  jidDecode,
  jidEncode,
  jidNormalizedUser,
  S_WHATSAPP_NET,
} from "../WABinary";
import { USyncQuery, USyncUser } from "../WAUSync";
import { makeGroupsSocket } from "./groups";
import { makeNewsletterSocket } from "./newsletter";
import { randomBytes } from "crypto";

export const makeMessagesSocket = (config) => {
  const {
    logger,
    linkPreviewImageThumbnailWidth,
    generateHighQualityLinkPreview,
    options: axiosOptions,
    patchMessageBeforeSending,
    cachedGroupMetadata,
  } = config;
  const sock = makeNewsletterSocket(makeGroupsSocket(config));
  const {
    ev,
    authState,
    processingMutex,
    signalRepository,
    upsertMessage,
    query,
    fetchPrivacySettings,
    sendNode,
    groupMetadata,
    groupToggleEphemeral,
  } = sock;
  const userDevicesCache =
    config.userDevicesCache ||
    new NodeCache({
      stdTTL: DEFAULT_CACHE_TTLS.USER_DEVICES, // 5 minutes
      useClones: false,
    });
  let mediaConn;
  const refreshMediaConn = async (forceGet = false) => {
    const media = await mediaConn;
    if (
      !media ||
      forceGet ||
      new Date().getTime() - media.fetchDate.getTime() > media.ttl * 1000
    ) {
      mediaConn = (async () => {
        const result = await query({
          tag: "iq",
          attrs: {
            type: "set",
            xmlns: "w:m",
            to: S_WHATSAPP_NET,
          },
          content: [{ tag: "media_conn", attrs: {} }],
        });
        const mediaConnNode = getBinaryNodeChild(result, "media_conn");
        const node = {
          hosts: getBinaryNodeChildren(mediaConnNode, "host").map(
            ({ attrs }) => ({
              hostname: attrs.hostname,
              maxContentLengthBytes: +attrs.maxContentLengthBytes,
            }),
          ),
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
      node.attrs.t = unixTimestampSeconds().toString();
    }
    if (type === "sender" && isJidUser(jid)) {
      node.attrs.recipient = jid;
      node.attrs.to = participant;
    } else {
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
    logger.debug(
      { attrs: node.attrs, messageIds },
      "sending receipt for messages",
    );
    await sendNode(node);
  };
  /** Correctly bulk send receipts to multiple chats, participants */
  const sendReceipts = async (keys, type) => {
    const recps = aggregateMessageKeysNotFromMe(keys);
    for (const { jid, participant, messageIds } of recps) {
      await sendReceipt(jid, participant, messageIds, type);
    }
  };
  /** Bulk read messages. Keys can be from different chats & participants */
  const readMessages = async (keys) => {
    const privacySettings = await fetchPrivacySettings();
    // based on privacy settings, we have to change the read type
    const readType =
      privacySettings.readreceipts === "all" ? "read" : "read-self";
    await sendReceipts(keys, readType);
  };
  /** Fetch all the devices we've to send a message to */
  const getUSyncDevices = async (jids, useCache, ignoreZeroDevices) => {
    const deviceResults = [];
    if (!useCache) {
      logger.debug("not using cache for devices");
    }
    const toFetch = [];
    jids = Array.from(new Set(jids));
    for (let jid of jids) {
      const user = jidDecode(jid)?.user;
      jid = jidNormalizedUser(jid);
      if (useCache) {
        const devices = userDevicesCache.get(user);
        if (devices) {
          deviceResults.push(...devices);
          logger.trace({ user }, "using cache for devices");
        } else {
          toFetch.push(jid);
        }
      } else {
        toFetch.push(jid);
      }
    }
    if (!toFetch.length) {
      return deviceResults;
    }
    const query = new USyncQuery().withContext("message").withDeviceProtocol();
    for (const jid of toFetch) {
      query.withUser(new USyncUser().withId(jid));
    }
    const result = await sock.executeUSyncQuery(query);
    if (result) {
      const extracted = extractDeviceJids(
        result?.list,
        authState.creds.me.id,
        ignoreZeroDevices,
      );
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
    } else {
      const addrs = jids.map((jid) =>
        signalRepository.jidToSignalProtocolAddress(jid),
      );
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
          to: S_WHATSAPP_NET,
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
      await parseAndInjectE2ESessions(result, signalRepository);
      didFetchNewSession = true;
    }
    return didFetchNewSession;
  };
  const sendPeerDataOperationMessage = async (pdoMessage) => {
    //TODO: for later, abstract the logic to send a Peer Message instead of just PDO - useful for App State Key Resync with phone
    if (!authState.creds.me?.id) {
      throw new Boom("Not authenticated");
    }
    const protocolMessage = {
      protocolMessage: {
        peerDataOperationRequestMessage: pdoMessage,
        type: proto.Message.ProtocolMessage.Type
          .PEER_DATA_OPERATION_REQUEST_MESSAGE,
      },
    };
    const meJid = jidNormalizedUser(authState.creds.me.id);
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
    const nodes = await Promise.all(
      patched.map(async (patchedMessageWithJid) => {
        const { recipientJid: jid, ...patchedMessage } = patchedMessageWithJid;
        if (!jid) {
          return {};
        }
        const bytes = encodeWAMessage(patchedMessage);
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
      }),
    );
    return { nodes, shouldIncludeDeviceIdentity };
  };
  const relayMessage = async (
    jid,
    message,
    options,
    attempts = 0,
    maxRetries = 5,
  ) => {
    try {
      return await relayMessageB(jid, message, options);
    } catch (e) {
      if (/rate\-overlimit/i.test(e.message) && attempts < maxRetries) {
        console.log(`Percobaan ke-${attempts + 1}, menunggu 2 detik...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return relayMessage(jid, message, options, attempts + 1, maxRetries);
      }
      throw e;
    }
  };
  const relayMessageB = async (
    jid,
    message,
    {
      messageId: msgId,
      participant,
      additionalAttributes,
      additionalNodes,
      useUserDevicesCache,
      useCachedGroupMetadata,
      statusJidList,
    },
  ) => {
    const meId = authState.creds.me.id;
    let shouldIncludeDeviceIdentity = false;
    const { user, server } = jidDecode(jid);
    const statusJid = "status@broadcast";
    const isGroup = server === "g.us";
    const isStatus = jid === statusJid;
    const isLid = server === "lid";
    const isNewsletter = server === "newsletter";
    msgId = msgId || generateMessageIDV2(sock.user?.id);
    useUserDevicesCache = useUserDevicesCache !== false;
    useCachedGroupMetadata = useCachedGroupMetadata !== false && !isStatus;
    const participants = [];
    const destinationJid = !isStatus
      ? jidEncode(user, isLid ? "lid" : isGroup ? "g.us" : "s.whatsapp.net")
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
      const { user, device } = jidDecode(participant.jid);
      devices.push({ user, device });
    }
    await authState.keys.transaction(async () => {
      const mediaType = getMediaType(message);
      if (mediaType) {
        extraAttrs["mediatype"] = mediaType;
      }
      if (isNewsletter) {
        // Patch message if needed, then encode as plaintext
        const patched = patchMessageBeforeSending
          ? await patchMessageBeforeSending(message, [])
          : message;
        const bytes = encodeNewsletterMessage(patched);
        binaryNodeContent.push({
          tag: "plaintext",
          attrs: {},
          content: bytes,
        });
        const stanza = {
          tag: "message",
          attrs: {
            to: jid,
            id: msgId,
            type: getMessageType(message),
            ...(additionalAttributes || {}),
          },
          content: binaryNodeContent,
        };
        logger.debug({ msgId }, `sending newsletter message to ${jid}`);
        await sendNode(stanza);
        return;
      }
      if (normalizeMessageContent(message)?.pinInChatMessage) {
        extraAttrs["decrypt-fail"] = "hide";
      }
      if (isGroup || isStatus) {
        const [groupData, senderKeyMap] = await Promise.all([
          (async () => {
            let groupData =
              useCachedGroupMetadata && cachedGroupMetadata
                ? await cachedGroupMetadata(jid)
                : undefined;
            if (groupData && Array.isArray(groupData?.participants)) {
              logger.trace(
                { jid, participants: groupData.participants.length },
                "using cached group metadata",
              );
            } else if (!isStatus) {
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
          const participantsList =
            groupData && !isStatus
              ? groupData.participants.map((p) => p.id)
              : [];
          if (isStatus && statusJidList) {
            participantsList.push(...statusJidList);
          }
          if (!isStatus) {
            additionalAttributes = {
              ...additionalAttributes,
              addressing_mode: groupData?.addressingMode || "pn",
            };
          }
          const additionalDevices = await getUSyncDevices(
            participantsList,
            !!useUserDevicesCache,
            false,
          );
          devices.push(...additionalDevices);
        }
        const patched = await patchMessageBeforeSending(message);
        if (Array.isArray(patched)) {
          throw new Boom("Per-jid patching is not supported in groups");
        }
        const bytes = encodeWAMessage(patched);
        const { ciphertext, senderKeyDistributionMessage } =
          await signalRepository.encryptGroupMessage({
            group: destinationJid,
            data: bytes,
            meId,
          });
        const senderKeyJids = [];
        // ensure a connection is established with every device
        for (const { user, device } of devices) {
          const jid = jidEncode(
            user,
            groupData?.addressingMode === "lid" ? "lid" : "s.whatsapp.net",
            device,
          );
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
          const result = await createParticipantNodes(
            senderKeyJids,
            senderKeyMsg,
            extraAttrs,
          );
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
      } else {
        const { user: meUser } = jidDecode(meId);
        if (!participant) {
          devices.push({ user });
          if (user !== meUser) {
            devices.push({ user: meUser });
          }
          if (additionalAttributes?.["category"] !== "peer") {
            const additionalDevices = await getUSyncDevices(
              [meId, jid],
              !!useUserDevicesCache,
              true,
            );
            devices.push(...additionalDevices);
          }
        }
        const allJids = [];
        const meJids = [];
        const otherJids = [];
        for (const { user, device } of devices) {
          const isMe = user === meUser;
          const jid = jidEncode(
            isMe && isLid
              ? authState.creds?.me?.lid.split(":")[0] || user
              : user,
            isLid ? "lid" : "s.whatsapp.net",
            device,
          );
          if (isMe) {
            meJids.push(jid);
          } else {
            otherJids.push(jid);
          }
          allJids.push(jid);
        }
        await assertSessions(allJids, false);
        const [
          { nodes: meNodes, shouldIncludeDeviceIdentity: s1 },
          { nodes: otherNodes, shouldIncludeDeviceIdentity: s2 },
        ] = await Promise.all([
          createParticipantNodes(meJids, meMsg, extraAttrs),
          createParticipantNodes(otherJids, message, extraAttrs),
        ]);
        participants.push(...meNodes);
        participants.push(...otherNodes);
        shouldIncludeDeviceIdentity = shouldIncludeDeviceIdentity || s1 || s2;
      }
      if (participants.length) {
        if (additionalAttributes?.["category"] === "peer") {
          const peerNode = participants[0]?.content?.[0];
          if (peerNode) {
            binaryNodeContent.push(peerNode); // push only enc
          }
        } else {
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
          type: getMessageType(message),
          ...(additionalAttributes || {}),
        },
        content: binaryNodeContent,
      };
      // if the participant to send to is explicitly specified (generally retry recp)
      // ensure the message is only sent to that person
      // if a retry receipt is sent to everyone -- it'll fail decryption for everyone else who received the msg
      if (participant) {
        if (isJidGroup(destinationJid)) {
          stanza.attrs.to = destinationJid;
          stanza.attrs.participant = participant.jid;
        } else if (areJidsSameUser(participant.jid, meId)) {
          stanza.attrs.to = participant.jid;
          stanza.attrs.recipient = destinationJid;
        } else {
          stanza.attrs.to = participant.jid;
        }
      } else {
        stanza.attrs.to = destinationJid;
      }
      if (shouldIncludeDeviceIdentity) {
        stanza.content.push({
          tag: "device-identity",
          attrs: {},
          content: encodeSignedDeviceIdentity(authState.creds.account, true),
        });
        logger.debug({ jid }, "adding device identity");
      }

      const messages = normalizeMessageContent(message);
      const messagesType = getButtonType(messages);
      const isViewOnceButton = isViewOnceWithSpecificType(message);

      if (
        !isNewsletter &&
        (messagesType || isViewOnceButton) &&
        messages?.listMessage?.listType !== "PRODUCT_LIST"
      ) {
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
        stanza.content.push(businessNode);
        logger.debug({ jid }, "adding business node");
      }

      if (additionalNodes && additionalNodes.length > 0) {
        stanza.content.push(...additionalNodes);
      }
      logger.debug(
        { msgId },
        `sending message to ${participants.length} devices`,
      );
      await sendNode(stanza);
    });
    return msgId;
  };
  const getMessageType = (message) => {
    if (
      message.pollCreationMessage ||
      message.pollCreationMessageV2 ||
      message.pollCreationMessageV3
    ) {
      return "poll";
    }
    return "text";
  };
  const getMediaType = (message) => {
    if (message.imageMessage) {
      return "image";
    } else if (message.videoMessage) {
      return message.videoMessage.gifPlayback ? "gif" : "video";
    } else if (message.audioMessage) {
      return message.audioMessage.ptt ? "ptt" : "audio";
    } else if (message.contactMessage) {
      return "vcard";
    } else if (message.documentMessage) {
      return "document";
    } else if (message.contactsArrayMessage) {
      return "contact_array";
    } else if (message.liveLocationMessage) {
      return "livelocation";
    } else if (message.stickerMessage) {
      return "sticker";
    } else if (message.listMessage) {
      return "list";
    } else if (message.listResponseMessage) {
      return "list_response";
    } else if (message.buttonsResponseMessage) {
      return "buttons_response";
    } else if (message.orderMessage) {
      return "order";
    } else if (message.productMessage) {
      return "product";
    } else if (message.interactiveResponseMessage) {
      return "native_flow_response";
    } else if (message.groupInviteMessage) {
      return "url";
    }
  };
  const getButtonType = (message) => {
    if (message.listMessage) {
      return "list";
    } else if (message.listResponseMessage) {
      return "list_response";
    } else if (message.buttonsMessage) {
      return "buttons";
    } else if (message.buttonsResponseMessage) {
      return "buttons_response";
    } else if (message.templateMessage) {
      return "template";
    } else if (message.templateButtonReplyMessage) {
      return "template_response";
    } else if (message.interactiveMessage) {
      return "interactive";
    } else if (message.interactiveResponseMessage) {
      return "native_flow_response";
    }
  };

  const getButtonArgs = (message, message2) => {
    const type = Object.keys(message || {})[0];
    if (
      message.interactiveMessage?.nativeFlowMessage &&
      message.interactiveMessage.nativeFlowMessage?.buttons?.length > 0 &&
      message.interactiveMessage.nativeFlowMessage.buttons[0].name ===
        "review_and_pay"
    ) {
      return {
        tag: "biz",
        attrs: {
          native_flow_name: "order_details",
        },
      };
    } else if (
      message.interactiveMessage?.nativeFlowMessage &&
      message.interactiveMessage.nativeFlowMessage?.buttons?.length > 0 &&
      message.interactiveMessage.nativeFlowMessage.buttons[0].name ===
        "payment_info"
    ) {
      return {
        tag: "biz",
        attrs: {
          native_flow_name: "payment_info",
        },
      };
    } else if (
      message.interactiveMessage?.nativeFlowMessage &&
      message.interactiveMessage.nativeFlowMessage?.buttons?.length > 0 &&
      [
        "mpm",
        "cta_catalog",
        "send_location",
        "call_permission_request",
        "wa_payment_transaction_details",
        "automated_greeting_message_view_catalog",
      ].includes(message.interactiveMessage.nativeFlowMessage.buttons[0].name)
    ) {
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
    } else if (
      ["buttonsMessage", "interactiveMessage"].includes(type) ||
      isViewOnceWithSpecificType(message2)
    ) {
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
        ],
      };
    } else if (message.listMessage) {
      return {
        tag: "list",
        attrs: {
          type: "product_list",
          v: "2",
        },
      };
    } else {
      return {
        tag: "biz",
        attrs: {},
      };
    }
  };
  const isViewOnceWithSpecificType = (message) => {
    if (!message) return false;
    return (
      (
        message?.viewOnceMessage ||
        message?.viewOnceMessageV2 ||
        message?.viewOnceMessageV2Extension
      )?.message?.interactiveMessage ||
      (
        message?.viewOnceMessage ||
        message?.viewOnceMessageV2 ||
        message?.viewOnceMessageV2Extension
      )?.message?.ephemeralMessage ||
      (
        message?.viewOnceMessage ||
        message?.viewOnceMessageV2 ||
        message?.viewOnceMessageV2Extension
      )?.message?.buttonsMessage ||
      (
        message?.viewOnceMessage ||
        message?.viewOnceMessageV2 ||
        message?.viewOnceMessageV2Extension
      )?.message?.templateMessage
    );
  };
  const getPrivacyTokens = async (jids) => {
    const t = unixTimestampSeconds().toString();
    const result = await query({
      tag: "iq",
      attrs: {
        to: S_WHATSAPP_NET,
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
              jid: jidNormalizedUser(jid),
              t,
              type: "trusted_contact",
            },
          })),
        },
      ],
    });
    return result;
  };
  const waUploadToServer = getWAUploadToServer(config, refreshMediaConn);
  const waitForMsgMediaUpdate = bindWaitForEvent(ev, "messages.media-update");
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
      const content = assertMediaContent(message.message);
      const mediaKey = content.mediaKey;
      const meId = authState.creds.me.id;
      const node = await encryptMediaRetryRequest(message.key, mediaKey, meId);
      let error = undefined;
      await Promise.all([
        sendNode(node),
        waitForMsgMediaUpdate(async (update) => {
          const result = update.find((c) => c.key.id === message.key.id);
          if (result) {
            if (result.error) {
              error = result.error;
            } else {
              try {
                const media = await decryptMediaRetryData(
                  result.media,
                  mediaKey,
                  result.key.id,
                );
                if (
                  media.result !==
                  proto.MediaRetryNotification.ResultType.SUCCESS
                ) {
                  const resultStr =
                    proto.MediaRetryNotification.ResultType[media.result];
                  throw new Boom(
                    `Media re-upload failed by device (${resultStr})`,
                    {
                      data: media,
                      statusCode:
                        getStatusCodeForMediaRetry(media.result) || 404,
                    },
                  );
                }
                content.directPath = media.directPath;
                content.url = getUrlFromDirectPath(content.directPath);
                logger.debug(
                  { directPath: media.directPath, key: result.key },
                  "media update successful",
                );
              } catch (err) {
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
      const userJid = authState.creds.me.id;
      if (!options.ephemeralExpiration) {
        if (isJidGroup(jid)) {
          const groups = await sock.groupQuery(jid, "get", [
            {
              tag: "query",
              attrs: {
                request: "interactive",
              },
            },
          ]);
          const metadata = getBinaryNodeChild(groups, "group");
          const expiration =
            getBinaryNodeChild(metadata, "ephemeral")?.attrs?.expiration || 0;
          options.ephemeralExpiration = expiration;
        }
      }
      if (
        typeof content === "object" &&
        "disappearingMessagesInChat" in content &&
        typeof content["disappearingMessagesInChat"] !== "undefined" &&
        isJidGroup(jid)
      ) {
        const { disappearingMessagesInChat } = content;
        const value =
          typeof disappearingMessagesInChat === "boolean"
            ? disappearingMessagesInChat
              ? WA_DEFAULT_EPHEMERAL
              : 0
            : disappearingMessagesInChat;
        await groupToggleEphemeral(jid, value);
      } else {
        const fullMsg = await generateWAMessage(jid, content, {
          logger,
          userJid,
          getUrlInfo: (text) =>
            getUrlInfo(text, {
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
          upload: waUploadToServer,
          mediaCache: config.mediaCache,
          options: config.options,
          messageId: generateMessageIDV2(sock.user?.id),
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
          if (
            isJidGroup(content.delete?.remoteJid) &&
            !content.delete?.fromMe
          ) {
            additionalAttributes.edit = "8";
          } else {
            additionalAttributes.edit = "7";
          }
        } else if (isEditMsg) {
          additionalAttributes.edit = "1";
        } else if (isKeep) {
          additionalAttributes.edit = "6";
        } else if (isPinMsg) {
          additionalAttributes.edit = "2";
        } else if (isAi) {
          additionalNodes.push(
            { attrs: { biz_bot: "1" }, tag: "bot" },
            { attrs: {}, tag: "biz" },
          );
        } else if (isPollMessage) {
          additionalNodes.push({
            tag: "meta",
            attrs: {
              polltype: "creation",
            },
          });
        }
        if ("cachedGroupMetadata" in options) {
          console.warn(
            "cachedGroupMetadata in sendMessage are deprecated, now cachedGroupMetadata is part of the socket config.",
          );
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
      /*
        Which makes the code;
        WhatsApp Channel: https://whatsapp.com/channel/0029VajRhmk2P59nLvTfyx3v
        Don't delete this WM, you must accept the risk!
      */
      if (typeof jid !== "string")
        throw new TypeError(
          `jid must be string, received: ${jid} (${jid?.constructor?.name})`,
        );
      for (const media of medias) {
        if (!media.type || (media.type !== "image" && media.type !== "video"))
          throw new TypeError(
            `medias[i].type must be "image" or "video", received: ${media.type} (${media.type?.constructor?.name})`,
          );
        if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data)))
          throw new TypeError(
            `medias[i].data must be object with url or buffer, received: ${media.data} (${media.data?.constructor?.name})`,
          );
      }
      if (medias.length < 2) throw new RangeError("Minimum 2 media");
      const caption = options.text || options.caption || "";
      const delay = !isNaN(options.delay) ? options.delay : 500;
      delete options.text;
      delete options.caption;
      delete options.delay;
      const album = generateWAMessageFromContent(
        jid,
        {
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
                    participant:
                      options.quoted.key.participant ||
                      options.quoted.key.remoteJid,
                    quotedMessage: options.quoted.message,
                  },
                }
              : {}),
          },
        },
        {},
      );
      await relayMessage(album.key.remoteJid, album.message, {
        messageId: album.key.id,
      });

      for (const media of medias) {
        const img = await generateWAMessage(
          album.key.remoteJid,
          {
            [media.type]: media.data,
            caption,
          },
          {
            upload: waUploadToServer,
          },
        );
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
  };
};
