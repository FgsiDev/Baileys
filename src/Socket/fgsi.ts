import { proto } from '../../WAProto/index.js'
import type { MessageRelayOptions, MiscMessageGenerationOptions, SocketConfig, WAMediaUploadFunction } from '../Types'
import { encryptedStream, unixTimestampSeconds } from '../Utils'
import {
	encodeGroupHistoryBundle,
	GROUP_HISTORY_BUNDLE_MIMETYPE,
	oldestTimestampSeconds,
	type WaGroupHistoryAudience,
	type WaShareGroupHistoryInput,
	type WaShareGroupHistoryResult
} from '../Utils/group-history'
import { isJidGroup, isLidUser, jidNormalizedUser, type BinaryNode } from '../WABinary'
import { makeNewsletterSocket } from './newsletter'

export type FgsiFns = {
	relayMessage: (jid: string, message: proto.IMessage, options: MessageRelayOptions) => Promise<string>
	waUploadToServer: WAMediaUploadFunction
}

export const makeFgsiSocket = (config: SocketConfig, getFns: () => FgsiFns) => {
	const sock = makeNewsletterSocket(config)
	const { logger } = config
	const { authState, groupMetadata } = sock

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

			const { relayMessage, waUploadToServer } = getFns()
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
