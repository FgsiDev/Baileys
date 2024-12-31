import { randomBytes, randomUUID } from 'crypto'
import { proto } from '../../WAProto/index.js'
import type { MiscMessageGenerationOptions, SocketConfig } from '../Types'
import { encryptedStream, generateMessageIDV2, unixTimestampSeconds } from '../Utils'
import { setBotMessageSecret } from '../Utils/decode-wa-message'
import {
	encodeGroupHistoryBundle,
	GROUP_HISTORY_BUNDLE_MIMETYPE,
	oldestTimestampSeconds,
	type WaGroupHistoryAudience,
	type WaShareGroupHistoryInput,
	type WaShareGroupHistoryResult
} from '../Utils/group-history'
import { isJidGroup, isLidUser, jidNormalizedUser, type BinaryNode } from '../WABinary'
import { makeCommunitiesSocket } from './communities'

export const makeFgsiSocket = (config: SocketConfig) => {
	const sock = makeCommunitiesSocket(config)
	const { logger } = config
	const { authState, groupMetadata, relayMessage, waUploadToServer } = sock

	const resolveGroupHistoryAudience = async (
		groupJid: string,
		requestedJids: string[]
	): Promise<WaGroupHistoryAudience> => {
		const groupData = await groupMetadata(groupJid)
		const addressingMode: 'pn' | 'lid' =
			groupData?.addressingMode ||
			((groupData?.participants || []).some(participant => !!participant.id && isLidUser(participant.id))
				? 'lid'
				: 'pn')
		const meId = authState.creds.me!.id
		const meLid = authState.creds.me?.lid
		const meUserJid = jidNormalizedUser(addressingMode === 'lid' && meLid ? meLid : meId)

		const pending = new Set<string>()
		for (const jid of requestedJids) {
			pending.add(jidNormalizedUser(jid))
		}

		const historyReceivers: string[] = []
		const nonHistoryReceivers: string[] = []
		for (const participant of groupData?.participants || []) {
			const pnUserJid = participant.id ? jidNormalizedUser(participant.id) : undefined
			const lidUserJid = participant.lid ? jidNormalizedUser(participant.lid) : undefined
			const userJid = addressingMode === 'lid' ? lidUserJid || pnUserJid : pnUserJid
			if (!userJid) {
				continue
			}
			if (userJid === meUserJid || pnUserJid === meUserJid || lidUserJid === meUserJid) {
				continue
			}
			const matched =
				pending.delete(userJid) ||
				(!!pnUserJid && pending.delete(pnUserJid)) ||
				(!!lidUserJid && pending.delete(lidUserJid))
			if (matched) {
				historyReceivers.push(userJid)
			} else {
				nonHistoryReceivers.push(userJid)
			}
		}

		const requestedSelf =
			pending.delete(meUserJid) ||
			pending.delete(jidNormalizedUser(meId)) ||
			(!!meLid && pending.delete(jidNormalizedUser(meLid)))

		return {
			historyReceivers,
			nonHistoryReceivers,
			unknownJids: [...pending],
			requestedSelf,
			addressingMode,
			meUserJid
		}
	}

	return {
		...sock,
		sendMetaAI: async (
			text: string,
			opts: {
				jid?: string
				invokerJid?: string
				botFbid?: string
				mention?: boolean
				sessionId?: string
				capabilities?: number[]
				messageSecret?: Buffer
				quoted?: any
				links?: any
				personaType?: string
				agentEngagementType?: string
				modeSelected?: string
			} = {}
		) => {
			const META_AI_BOT_JID = '867051314767696@bot'
			const META_AI_FBID = '867051314767696'
			const jid = opts.jid || META_AI_BOT_JID
			const isGroup = isJidGroup(jid)
			const invokerJid = opts.invokerJid || authState.creds.me?.id
			const botMetadata = isGroup
				? {
						botGroupMetadata: { participantsMetadata: [{ botFbid: opts.botFbid || META_AI_FBID }] },
						botRenderingConfigMetadata: {
							bloksVersioningId: 'd7c89519fd412464e4a4ddd60b2e5fa57c5000766a697d60835246ef0952daba',
							pixelDensity: 2.625
						}
					}
				: {
						personaId: jid,
						invokerJid,
						sessionMetadata: { sessionId: opts.sessionId || randomUUID(), sessionSource: 3 },
						capabilityMetadata: {
							capabilities: opts.capabilities || Array.from({ length: 72 }, (_, i) => i + 1)
						},
						botMetricsMetadata: { destinationId: jid, destinationEntryPoint: 2 }
					}
			let content: proto.IMessage
			if (isGroup) {
				if (opts.mention) {
					const fbid = opts.botFbid || META_AI_FBID
					content = {
						extendedTextMessage: proto.Message.ExtendedTextMessage.fromObject({
							text: `@${fbid} ${text}`,
							contextInfo: proto.ContextInfo.fromObject({
								mentionedJid: [META_AI_BOT_JID],
								botMessageSharingInfo: {
									botEntryPointOrigin: 'GROUP_MEMBER',
									forwardScore: 0
								}
							})
						})
					}
				} else {
					content = { conversation: text }
				}
			} else {
				content = { extendedTextMessage: { text } }
			}
			const messageSecret = opts.messageSecret || randomBytes(32)
			const message: proto.IMessage = {
				...content,
				messageContextInfo: proto.MessageContextInfo.fromObject({
					messageSecret,
					botMetadata
				})
			}
			const msgId = generateMessageIDV2(invokerJid)
			const messageOptions = {
				messageId: msgId,
				quoted: opts.quoted,
				links: opts.links,
				additionalNodes: [
					{
						tag: 'bot',
						attrs: {
							persona_type: opts.personaType || 'default',
							agent_engagement_type: opts.agentEngagementType || (isGroup ? 'invoked' : 'direct_chat'),
							mode_selected: opts.modeSelected || '0'
						}
					} as BinaryNode
				]
			}
			await relayMessage(jid, message, messageOptions)
			setBotMessageSecret(msgId, messageSecret, jid)
			return msgId
		},
		shareGroupHistory: async (
			groupJid: string,
			input: WaShareGroupHistoryInput,
			options: MiscMessageGenerationOptions = {}
		): Promise<WaShareGroupHistoryResult> => {
			if (!isJidGroup(groupJid)) {
				throw new Error(`shareGroupHistory requires a group jid: ${groupJid}`)
			}
			const requestedJids = input.toJids ?? []
			if (!input.forceSkip && !requestedJids.length) {
				throw new Error('shareGroupHistory requires at least one recipient')
			}
			if (!input.messages?.length) {
				throw new Error('shareGroupHistory requires `messages` to share')
			}

			const audience = await resolveGroupHistoryAudience(groupJid, requestedJids)
			if (input.forceSkip) {
				audience.unknownJids = []
				audience.requestedSelf = false
				if (!audience.historyReceivers.length) {
					audience.historyReceivers.push(...audience.nonHistoryReceivers)
					audience.nonHistoryReceivers = []
				}
			} else {
				if (audience.requestedSelf) {
					throw new Error('shareGroupHistory cannot share history with this account itself')
				}
				if (audience.unknownJids.length) {
					throw new Error(
						`shareGroupHistory recipients are not members of the group (addressing mode: ${audience.addressingMode}): ${audience.unknownJids.join(', ')}`
					)
				}
			}
			if (!audience.historyReceivers.length) {
				throw new Error('shareGroupHistory resolved no recipients')
			}

			const { compressed } = await encodeGroupHistoryBundle(input.messages, input.outOfWindowPinnedMessages)
			const mediaType = 'group-history' as const
			const { mediaKey, encFilePath, fileEncSha256, fileSha256 } = await encryptedStream(compressed, mediaType, {
				logger
			})
			const upload = await waUploadToServer(encFilePath, {
				mediaType,
				fileEncSha256B64: fileEncSha256.toString('base64'),
				contentType: GROUP_HISTORY_BUNDLE_MIMETYPE
			})

			const oldestInWindow = oldestTimestampSeconds(input.messages)
			const oldestPin = oldestTimestampSeconds(input.outOfWindowPinnedMessages)
			const oldestInBundle =
				oldestPin === undefined
					? oldestInWindow
					: oldestInWindow === undefined
						? oldestPin
						: Math.min(oldestInWindow, oldestPin)
			const oldestInWindowOrNow = oldestInWindow ?? unixTimestampSeconds()
			const metadataProto: proto.Message.IMessageHistoryMetadata = {
				historyReceivers: audience.historyReceivers,
				nonHistoryReceivers: audience.nonHistoryReceivers,
				messageCount: input.messages.length,
				oldestMessageTimestampInWindow: oldestInWindowOrNow,
				oldestMessageTimestampInBundle: oldestInBundle ?? oldestInWindowOrNow,
				includesChatTheme: input?.includesChatTheme || false
			}

			const bundleMsgId = await relayMessage(
				groupJid,
				{
					messageHistoryBundle: {
						mimetype: GROUP_HISTORY_BUNDLE_MIMETYPE,
						fileSha256,
						fileEncSha256,
						mediaKey,
						directPath: upload.directPath,
						mediaKeyTimestamp: unixTimestampSeconds(),
						messageHistoryMetadata: metadataProto
					}
				},
				{
					...options,
					restrictedGroupTargets: audience.historyReceivers
				}
			)

			let noticeMessageId: string | undefined
			try {
				noticeMessageId = await relayMessage(
					groupJid,
					{
						messageHistoryNotice: { messageHistoryMetadata: metadataProto }
					},
					{
						additionalNodes: [
							{
								tag: 'meta',
								attrs: { appdata: 'group_history' }
							} as BinaryNode
						]
					}
				)
			} catch (error: any) {
				logger.warn({ error, groupJid }, 'group history notice failed after bundle delivered')
			}

			logger.debug(
				{
					groupJid,
					id: bundleMsgId,
					messagesCount: input.messages.length,
					receiverCount: audience.historyReceivers.length
				},
				'shared group history'
			)

			return {
				bundleMessageId: bundleMsgId,
				noticeMessageId,
				messagesCount: input.messages.length,
				historyReceivers: audience.historyReceivers,
				nonHistoryReceivers: audience.nonHistoryReceivers
			}
		}
	}
}
