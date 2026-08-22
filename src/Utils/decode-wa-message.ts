import { Boom } from '@hapi/boom'
import { proto } from '../../WAProto/index.js'
import type { WAMessage, WAMessageKey } from '../Types'
import type { SignalRepositoryWithLIDStore } from '../Types/Signal'
import {
	areJidsSameUser,
	type BinaryNode,
	type BinaryNodeAttributes,
	isHostedLidUser,
	isHostedPnUser,
	isJidBroadcast,
	isJidGroup,
	isJidMetaAI,
	isJidNewsletter,
	isJidStatusBroadcast,
	isLidUser,
	isPnUser
	//	transferDevice
} from '../WABinary'
import { unpadRandomMax16 } from './generics'
import type { ILogger } from './logger'
import { decodeDecryptedMsmsgMessage, decryptMsmsgBotMessage, type MsmsgMessageKey } from './meta-ai-msmsg'

const MAX_SECRETS_PER_CHAT = 20

const botMessageSecrets = new Map<string, Buffer>()
const botRecentSecretsByChat = new Map<string, { id: string; secret: Buffer }[]>()
const pushRecentChatSecret = (chatJid: string, id: string, secretBuf: Buffer): void => {
	if (!chatJid || !secretBuf) return
	const existing = botRecentSecretsByChat.get(chatJid) || []
	const filtered = existing.filter(item => item.id !== id && !item.secret.equals(secretBuf))
	filtered.unshift({ id, secret: secretBuf })
	if (filtered.length > MAX_SECRETS_PER_CHAT) filtered.length = MAX_SECRETS_PER_CHAT
	botRecentSecretsByChat.set(chatJid, filtered)
}

export const setBotMessageSecret = (id: string, secret: Uint8Array | Buffer | string, chatJid?: string): void => {
	if (!id || !secret) return
	let buf: Buffer
	if (Buffer.isBuffer(secret)) {
		buf = secret
	} else if (secret instanceof Uint8Array) {
		buf = Buffer.from(secret.buffer, secret.byteOffset, secret.byteLength)
	} else if (typeof secret === 'string') {
		buf = Buffer.from(secret, 'base64')
	} else {
		return
	}

	botMessageSecrets.set(id, buf)
	if (chatJid) pushRecentChatSecret(chatJid, id, buf)
}

export const getDecryptionJid = async (sender: string, repository: SignalRepositoryWithLIDStore): Promise<string> => {
	if (isLidUser(sender) || isHostedLidUser(sender)) {
		return sender
	}

	const mapped = await repository.lidMapping.getLIDForPN(sender)
	return mapped || sender
}

const storeMappingFromEnvelope = async (
	stanza: BinaryNode,
	sender: string,
	repository: SignalRepositoryWithLIDStore,
	decryptionJid: string,
	logger: ILogger
): Promise<void> => {
	// TODO: Handle hosted IDs
	const { senderAlt } = extractAddressingContext(stanza)

	if (
		senderAlt &&
		(isLidUser(senderAlt) || isHostedLidUser(senderAlt)) &&
		(isPnUser(sender) || isHostedPnUser(sender)) &&
		decryptionJid === sender
	) {
		try {
			await repository.lidMapping.storeLIDPNMappings([{ lid: senderAlt, pn: sender }])
			await repository.migrateSession(sender, senderAlt)
			logger.debug({ sender, senderAlt }, 'Stored LID mapping from envelope')
		} catch (error) {
			logger.warn({ sender, senderAlt, error }, 'Failed to store LID mapping')
		}
	}
}

export const NO_MESSAGE_FOUND_ERROR_TEXT = 'Message absent from node'
export const MISSING_KEYS_ERROR_TEXT = 'Key used already or never filled'
export const ACCOUNT_RESTRICTED_TEXT = 'Your account has been restricted'

// Retry configuration for failed decryption
export const DECRYPTION_RETRY_CONFIG = {
	maxRetries: 3,
	baseDelayMs: 100,
	sessionRecordErrors: ['No session record', 'SessionError: No session record']
}

/** NACK reason codes we send to the server (client → server) */
export const NACK_REASONS = {
	SenderReachoutTimelocked: 463,
	ParsingError: 487,
	UnrecognizedStanza: 488,
	UnrecognizedStanzaClass: 489,
	UnrecognizedStanzaType: 490,
	InvalidProtobuf: 491,
	InvalidHostedCompanionStanza: 493,
	MissingMessageSecret: 495,
	SignalErrorOldCounter: 496,
	MessageDeletedOnPeer: 499,
	UnhandledError: 500,
	UnsupportedAdminRevoke: 550,
	UnsupportedLIDGroup: 551,
	DBOperationFailed: 552
}

/**
 * Server-side error codes returned in ack stanzas (server → client) that we
 * currently have dedicated handlers for. Extend as more handlers are added.
 * Distinct from the client-side NackReason enum (WAWebCreateNackFromStanza).
 */
export const SERVER_ERROR_CODES = {
	/**
	 * 1:1 message missing privacy token (tctoken). Usually means the account is
	 * restricted: WhatsApp blocks starting new chats but preserves existing ones,
	 * since established chats already carry a tctoken.
	 */
	MessageAccountRestriction: '463',
	/** Stanza validation failure (SMAX_INVALID) — likely stale device session */
	SmaxInvalid: '479'
} as const

type MessageType =
	| 'chat'
	| 'peer_broadcast'
	| 'other_broadcast'
	| 'group'
	| 'direct_peer_status'
	| 'other_status'
	| 'newsletter'

export const extractAddressingContext = (stanza: BinaryNode) => {
	let senderAlt: string | undefined
	let recipientAlt: string | undefined

	const sender = stanza.attrs.participant || stanza.attrs.from
	const addressingMode = stanza.attrs.addressing_mode || (sender?.endsWith('lid') ? 'lid' : 'pn')

	if (addressingMode === 'lid') {
		// Message is LID-addressed: sender is LID, extract corresponding PN
		// without device data
		senderAlt = stanza.attrs.participant_pn || stanza.attrs.sender_pn || stanza.attrs.peer_recipient_pn
		recipientAlt = stanza.attrs.recipient_pn
		// with device data
		//if (sender && senderAlt) senderAlt = transferDevice(sender, senderAlt)
	} else {
		// Message is PN-addressed: sender is PN, extract corresponding LID
		// without device data
		senderAlt = stanza.attrs.participant_lid || stanza.attrs.sender_lid || stanza.attrs.peer_recipient_lid
		recipientAlt = stanza.attrs.recipient_lid

		//with device data
		//if (sender && senderAlt) senderAlt = transferDevice(sender, senderAlt)
	}

	return {
		addressingMode,
		senderAlt,
		recipientAlt
	}
}

/**
 * Decode the received node as a message.
 * @note this will only parse the message, not decrypt it
 */
export function decodeMessageNode(stanza: BinaryNode, meId: string, meLid: string) {
	let msgType: MessageType
	let chatId: string
	let author: string
	let fromMe = false

	const msgId = stanza.attrs.id
	const from = stanza.attrs.from
	const participant: string | undefined = stanza.attrs.participant
	const recipient: string | undefined = stanza.attrs.recipient

	if (!msgId) {
		throw new Boom('Invalid message stanza: missing id attribute', { data: stanza })
	}

	if (!from) {
		throw new Boom('Invalid message stanza: missing from attribute', { data: stanza })
	}

	const addressingContext = extractAddressingContext(stanza)

	const isMe = (jid: string) => areJidsSameUser(jid, meId)
	const isMeLid = (jid: string) => areJidsSameUser(jid, meLid)

	if (isPnUser(from) || isLidUser(from) || isHostedLidUser(from) || isHostedPnUser(from)) {
		if (recipient && !isJidMetaAI(recipient)) {
			if (!isMe(from) && !isMeLid(from)) {
				throw new Boom('receipient present, but msg not from me', { data: stanza })
			}

			if (isMe(from) || isMeLid(from)) {
				fromMe = true
			}

			chatId = recipient
		} else {
			// Peer-routed self stanzas (history sync, app-state sync, etc.) arrive
			// with `from` set to our own device but no `recipient` attribute —
			// still mark as fromMe so self-only protocolMessage handlers run.
			if (isMe(from) || isMeLid(from)) {
				fromMe = true
			}

			chatId = from
		}

		msgType = 'chat'
		author = from
	} else if (isJidGroup(from)) {
		if (!participant) {
			throw new Boom('No participant in group message')
		}

		if (isMe(participant) || isMeLid(participant)) {
			fromMe = true
		}

		msgType = 'group'
		author = participant
		chatId = from
	} else if (isJidBroadcast(from)) {
		if (!participant) {
			throw new Boom('No participant in group message')
		}

		const isParticipantMe = isMe(participant)
		if (isJidStatusBroadcast(from)) {
			msgType = isParticipantMe ? 'direct_peer_status' : 'other_status'
		} else {
			msgType = isParticipantMe ? 'peer_broadcast' : 'other_broadcast'
		}

		fromMe = isParticipantMe
		chatId = from
		author = participant
	} else if (isJidMetaAI(from)) {
		msgType = 'chat'
		chatId = from
		author = from
		fromMe = false
	} else if (isJidNewsletter(from)) {
		msgType = 'newsletter'
		chatId = from
		author = from

		if (isMe(from) || isMeLid(from)) {
			fromMe = true
		}
	} else {
		throw new Boom('Unknown message type', { data: stanza })
	}

	const pushname = stanza?.attrs?.notify

	const key: WAMessageKey = {
		remoteJid: chatId,
		remoteJidAlt: !isJidGroup(chatId) ? addressingContext.senderAlt : undefined,
		remoteJidUsername: !isJidGroup(chatId)
			? stanza.attrs.peer_recipient_username || stanza.attrs.recipient_username
			: undefined,
		fromMe,
		id: msgId,
		participant,
		participantAlt: isJidGroup(chatId) ? addressingContext.senderAlt : undefined,
		participantUsername: stanza.attrs.participant ? stanza.attrs.participant_username : undefined,
		addressingMode: addressingContext.addressingMode,
		...(msgType === 'newsletter' && stanza.attrs.server_id ? { server_id: stanza.attrs.server_id } : {})
	}

	const fullMessage: WAMessage = {
		key,
		category: stanza.attrs.category,
		messageTimestamp: +stanza.attrs.t!,
		pushName: pushname,
		broadcast: isJidBroadcast(from)
	}

	if (key.fromMe) {
		fullMessage.status = proto.WebMessageInfo.Status.SERVER_ACK
	}

	if (msgType === 'newsletter') {
		;(fullMessage as any).newsletterServerId = +(stanza.attrs?.server_id || 0)
	}

	if (!key.fromMe) {
		;(fullMessage as any).platform = getDevice(key.id!)
	}

	return {
		fullMessage,
		author,
		sender: msgType === 'chat' ? author : chatId
	}
}

// Simple device detection from message ID prefix
const getDevice = (id: string) => {
	if (!id) return undefined
	const prefix = id.substring(0, 1)
	if (prefix === '3') return 0 // android
	if (prefix === '1') return 1 // ios
	if (prefix === '5') return 2 // web
	return undefined
}

type MsmsgNodeContext = {
	stanza: BinaryNode
	content: Uint8Array
	fullMessage: WAMessage
	author: string
	sender: string
	meLid: string
	botType: string | null
	botEditTargetId: string | null
	metaTargetId: string | null
	metaTargetSenderJid: string | null
	logger: ILogger
}

const decryptMsmsgNode = async ({
	stanza,
	content,
	fullMessage,
	author,
	sender,
	meLid,
	botType,
	botEditTargetId,
	metaTargetId,
	metaTargetSenderJid,
	logger
}: MsmsgNodeContext): Promise<Buffer | null> => {
	if (botType !== null && !['full', 'last'].includes(botType)) {
		return null
	}

	const secretIdCandidates = [botEditTargetId, metaTargetId, fullMessage.key?.id].filter(Boolean) as string[]
	const secretCandidates: { source: string; secret: Buffer }[] = []
	const seenSecrets = new Set<string>()

	for (const idCandidate of secretIdCandidates) {
		const byId = botMessageSecrets.get(idCandidate)
		if (!byId) continue
		const fp = byId.toString('hex')
		if (!seenSecrets.has(fp)) {
			seenSecrets.add(fp)
			secretCandidates.push({ source: `id:${idCandidate}`, secret: byId })
		}
	}

	const chatRecent = botRecentSecretsByChat.get(sender) || []
	for (const item of chatRecent) {
		const fp = item.secret.toString('hex')
		if (!seenSecrets.has(fp)) {
			seenSecrets.add(fp)
			secretCandidates.push({ source: `chat:${item.id}`, secret: item.secret })
		}

		if (secretCandidates.length >= 6) break
	}

	if (!secretCandidates.length) {
		logger.warn({ metaTargetId, botType, secretIdCandidates }, 'msmsg: no candidate messageSecret found, skipping')
		return null
	}

	const msMsg = proto.MessageSecretMessage.decode(content)
	const helperKey: MsmsgMessageKey = {
		participant: author,
		meId: metaTargetSenderJid || `${meLid.split(':')[0]}@lid`,
		meLid,
		conversationJid: sender,
		senderJid: metaTargetSenderJid || undefined,
		botType,
		botEditTargetId,
		metaTargetId,
		stanzaId: stanza.attrs?.id,
		targetId: botEditTargetId || metaTargetId || stanza.attrs?.id,
		targetIdCandidates: secretIdCandidates
	}

	let decrypted: Buffer | undefined
	let decryptErr: unknown
	const candidateAttemptSummaries: object[] = []

	for (const candidate of secretCandidates) {
		try {
			decrypted = await decryptMsmsgBotMessage(candidate.secret, helperKey, msMsg)
			logger.debug({ source: candidate.source }, 'msmsg: decrypted with candidate secret')
			break
		} catch (e: any) {
			decryptErr = e
			if (Array.isArray(e?.attemptedStrategies) && e.attemptedStrategies.length) {
				candidateAttemptSummaries.push({
					secretSource: candidate.source,
					attemptedStrategies: e.attemptedStrategies
				})
			}
		}
	}

	if (!decrypted && candidateAttemptSummaries.length) {
		logger.warn(
			{
				secretCandidateSources: secretCandidates.map(c => c.source),
				attemptsBySecret: candidateAttemptSummaries
			},
			'msmsg: helper decryption failed for all candidate secrets'
		)
	}

	if (!decrypted && decryptErr) throw decryptErr

	return decrypted || null
}

const applyDecodedMetadata = (
	fullMessage: WAMessage,
	msg: proto.IMessage,
	e2eType: string,
	attrs: BinaryNodeAttributes
): void => {
	// --- story_reply metadata ---
	if (e2eType === 'story_reply') {
		;(fullMessage as any).storyReply = true
		const quotedJid = msg.extendedTextMessage?.contextInfo?.remoteJid
		if (quotedJid && isJidStatusBroadcast(quotedJid)) {
			;(fullMessage as any).storyReply = true
		}
	}

	// --- feed_reshare metadata ---
	if (e2eType === 'feed_reshare') {
		;(fullMessage as any).feedReshare = true
	}

	// --- view_once type from enc attributes ---
	if (attrs.view_once === 'read' || attrs.view_once === 'write') {
		;(fullMessage as any).viewOnceType = attrs.view_once
	}

	// --- XMA message ---
	if ((msg as any).xmaMessage) {
		;(fullMessage as any).xma = (msg as any).xmaMessage
		;(fullMessage as any).messageType = 'xma'
	}

	// --- native_flow_response ---
	if (e2eType === 'native_flow_response' || (msg as any).nativeFlowResponseMessage) {
		;(fullMessage as any).messageType = 'native_flow_response'
		if ((msg as any).nativeFlowResponseMessage) {
			;(fullMessage as any).nativeFlowResponse = (msg as any).nativeFlowResponseMessage
			if ((msg as any).nativeFlowResponseMessage.name === 'md_smb_quick_reply') {
				;(fullMessage as any).smbQuickReply = true
			}
		}
	}

	// --- call_permission_request ---
	if ((msg as any).callPermissionRequestMessage) {
		;(fullMessage as any).messageType = 'call_permission_request'
		;(fullMessage as any).callPermissionRequest = (msg as any).callPermissionRequestMessage
	}

	// --- Product / Order / Catalog types ---
	if (msg.productMessage) {
		;(fullMessage as any).messageType = 'product'
	} else if (msg.orderMessage) {
		;(fullMessage as any).messageType = 'order'
	} else if ((msg as any).catalogMessage || (msg.listMessage as any)?.catalogType) {
		;(fullMessage as any).messageType = 'catalog'
	}

	// --- Payment types ---
	if ((msg as any).paymentMessage) {
		;(fullMessage as any).messageType = 'payment'
		const pm = (msg as any).paymentMessage
		;(fullMessage as any).paymentInfo = {
			amount: pm.amount1000 ? pm.amount1000 / 1000 : null,
			currency: pm.currencyCodeIso4217 || null,
			status: pm.status || null,
			transactionTimestamp: pm.transactionTimestamp
				? typeof pm.transactionTimestamp === 'object' && pm.transactionTimestamp?.toNumber
					? pm.transactionTimestamp.toNumber()
					: pm.transactionTimestamp || null
				: null,
			type: pm.type || null,
			method: pm.paymentMethod || null,
			futureProofed: pm.futureProofed || false
		}
	}

	if (msg.requestPaymentMessage) {
		;(fullMessage as any).messageType = 'request_payment'
		;(fullMessage as any).paymentRequest = {
			amount: msg.requestPaymentMessage.amount || null,
			currency: msg.requestPaymentMessage.currencyCodeIso4217 || null,
			expiry: msg.requestPaymentMessage.expiryTimestamp || null
		}
	}

	if (msg.sendPaymentMessage) {
		;(fullMessage as any).messageType = 'send_payment'
	}

	if (msg.cancelPaymentRequestMessage) {
		;(fullMessage as any).messageType = 'cancel_payment'
	}

	// --- Sticker flags ---
	if (msg.stickerMessage) {
		if (msg.stickerMessage.isAvatar) {
			;(fullMessage as any).isAvatarSticker = true
		}

		if (msg.stickerMessage.isAiSticker || (msg.stickerMessage as any).isGenAI) {
			;(fullMessage as any).isAiSticker = true
		}
	}

	// --- StickerPackMessage ---
	if ((msg as any).stickerPackMessage) {
		;(fullMessage as any).messageType = 'sticker_pack'
		const sp = (msg as any).stickerPackMessage
		;(fullMessage as any).stickerPack = {
			id: sp.stickerPackId,
			name: sp.name,
			origin: sp.stickerPackOrigin,
			size: sp.stickerPackSize,
			stickers: sp.stickers || []
		}
	}

	// --- AI media collection metadata from bot context ---
	if (msg.messageContextInfo?.botMetadata?.aiMediaCollectionMetadata) {
		;(fullMessage as any).aiMediaCollectionMetadata = {
			collectionId: msg.messageContextInfo.botMetadata.aiMediaCollectionMetadata.collectionId,
			uploadOrderIndex: msg.messageContextInfo.botMetadata.aiMediaCollectionMetadata.uploadOrderIndex
		}
	}

	// --- ProtocolMessage: AI media collection coordination ---
	if ((msg.protocolMessage as any)?.aiMediaCollectionMessage) {
		;(fullMessage as any).messageType = 'ai_media_collection'
		const amc = (msg.protocolMessage as any).aiMediaCollectionMessage
		;(fullMessage as any).aiMediaCollection = {
			collectionId: amc.collectionId,
			expectedMediaCount: amc.expectedMediaCount
		}
	}

	// --- SplitPaymentMessage ---
	if ((msg as any).splitPaymentMessage) {
		;(fullMessage as any).messageType = 'split_payment'
		const sp = (msg as any).splitPaymentMessage
		;(fullMessage as any).splitPayment = {
			splitId: sp.splitId,
			totalAmount: sp.totalAmount,
			description: sp.description,
			requesterJid: sp.requesterJid,
			participants: (sp.participants || []).map((p: any) => ({
				jid: p.jid,
				amount: p.amount,
				status: p.status
			})),
			createdAtMs: sp.createdAtMs
				? typeof sp.createdAtMs === 'object' && sp.createdAtMs?.toNumber
					? sp.createdAtMs.toNumber()
					: sp.createdAtMs
				: null
		}
	}

	// --- PaymentInviteMessage (FBPAY / UPI / NOVI) ---
	if (msg.paymentInviteMessage) {
		;(fullMessage as any).messageType = 'payment_invite'
		const SERVICE_TYPE: Record<number, string> = { 0: 'UNKNOWN', 1: 'FBPAY', 2: 'NOVI', 3: 'UPI' }
		;(fullMessage as any).paymentInvite = {
			serviceType: SERVICE_TYPE[msg.paymentInviteMessage.serviceType as number] || 'UNKNOWN',
			expiry: msg.paymentInviteMessage.expiryTimestamp
				? typeof msg.paymentInviteMessage.expiryTimestamp === 'object' &&
					msg.paymentInviteMessage.expiryTimestamp?.toNumber
					? msg.paymentInviteMessage.expiryTimestamp.toNumber()
					: msg.paymentInviteMessage.expiryTimestamp || null
				: null,
			incentiveEligible: msg.paymentInviteMessage.incentiveEligible || false
		}
	}

	// --- PaymentReminderMessage ---
	if ((msg as any).paymentReminderMessage) {
		;(fullMessage as any).messageType = 'payment_reminder'
	}

	// --- companion_enc_static ---
	if (e2eType === 'companion_enc_static') {
		;(fullMessage as any).companionEncStatic = true
	}

	// --- avatar_sticker / genai_sticker enc type ---
	if (e2eType === 'avatar_sticker' || e2eType === 'genai_sticker') {
		;(fullMessage as any).stickerType = e2eType
	}

	// --- account_authentication_request ---
	if (e2eType === 'account_authentication_request' || (msg as any).accountAuthRequestMessage) {
		;(fullMessage as any).messageType = 'account_auth_request'
	}

	// --- motion_video ---
	if (e2eType === 'motion_video' || (msg.videoMessage && (msg.videoMessage as any).motionVideo)) {
		;(fullMessage as any).messageType = 'motion_video'
		;(fullMessage as any).motionVideo = true
	}

	// --- motion_photo ---
	if (e2eType === 'motion_photo' || (msg.imageMessage && (msg.imageMessage as any).motionPhoto)) {
		;(fullMessage as any).messageType = 'motion_photo'
		;(fullMessage as any).motionPhoto = true
	}

	// --- non-E2EE plaintext (newsletter / system channel messages) ---
	if (e2eType === 'plaintext') {
		;(fullMessage as any).isNonE2EE = true
	}

	// Cache messageSecret for future msmsg decryption
	const secret = msg.messageContextInfo?.messageSecret
	if (secret) {
		const secretBuf = Buffer.isBuffer(secret)
			? secret
			: Buffer.from(secret.buffer, secret.byteOffset, secret.byteLength)
		setBotMessageSecret(fullMessage.key.id!, secretBuf, fullMessage.key.remoteJid!)
	}
}

export const decryptMessageNode = (
	stanza: BinaryNode,
	meId: string,
	meLid: string,
	repository: SignalRepositoryWithLIDStore,
	logger: ILogger
) => {
	const { fullMessage, author, sender } = decodeMessageNode(stanza, meId, meLid)
	let metaTargetId: string | null = null
	let botEditTargetId: string | null = null
	let botType: string | null = null
	let metaTargetSenderJid: string | null = null
	return {
		fullMessage,
		category: stanza.attrs.category,
		author,
		async decrypt() {
			let decryptables = 0
			if (Array.isArray(stanza.content)) {
				const hasMsmsg = stanza.content.some(({ attrs }) => attrs?.type === 'msmsg')
				if (hasMsmsg) {
					for (const { tag, attrs } of stanza.content) {
						if (tag === 'meta' && attrs?.target_id) metaTargetId = attrs.target_id
						if (tag === 'meta' && attrs?.target_sender_jid) metaTargetSenderJid = attrs.target_sender_jid
						if (tag === 'bot' && attrs && 'edit_target_id' in attrs) botEditTargetId = attrs.edit_target_id
						if (tag === 'bot' && attrs?.edit) botType = attrs.edit
					}
				}

				// Process unicast enc nodes (pkmsg/msg) before group enc nodes (skmsg/frskmsg)
				// so that any SenderKeyDistributionMessage carried in a unicast is installed
				// before GroupCipher.decrypt() runs for frskmsg in the same stanza.
				const _isGroupEnc = (n: BinaryNode) =>
					n.tag === 'enc' && (n.attrs?.type === 'skmsg' || n.attrs?.type === 'frskmsg')
				const _stanzaContent = [
					...stanza.content.filter(n => !_isGroupEnc(n)),
					...stanza.content.filter(n => _isGroupEnc(n))
				]

				for (const { tag, attrs, content } of _stanzaContent) {
					if (tag === 'verified_name' && content instanceof Uint8Array) {
						const cert = proto.VerifiedNameCertificate.decode(content)
						const details = proto.VerifiedNameCertificate.Details.decode(cert.details)
						fullMessage.verifiedBizName = details.verifiedName
						if (attrs?.verified_level) {
							;(fullMessage as any).verifiedNameLevel = attrs.verified_level
						}
					}

					if (tag === 'unavailable' && attrs.type === 'view_once') {
						fullMessage.key.isViewOnce = true // TODO: remove from here and add a STUB TYPE
					}

					if (attrs.count && tag === 'enc') {
						fullMessage.retryCount = Number(attrs.count)
					}

					if (tag !== 'enc' && tag !== 'plaintext') {
						continue
					}

					if (!(content instanceof Uint8Array)) {
						continue
					}

					decryptables += 1

					let msgBuffer: Uint8Array | Buffer | undefined

					const decryptionJid = await getDecryptionJid(author, repository)

					if (tag !== 'plaintext') {
						// TODO: Handle hosted devices
						await storeMappingFromEnvelope(stanza, author, repository, decryptionJid, logger)
					}

					try {
						const e2eType = tag === 'plaintext' ? 'plaintext' : attrs.type

						switch (e2eType) {
							case 'frskmsg':
							case 'skmsg':
								msgBuffer = await repository.decryptGroupMessage({
									group: sender,
									authorJid: author,
									msg: content
								})
								break
							case 'story_reply':
							case 'feed_reshare':
							case 'native_flow_response':
							case 'companion_enc_static':
							case 'avatar_sticker':
							case 'genai_sticker':
							case 'account_authentication_request':
							case 'motion_video':
							case 'motion_photo':
							case 'pkmsg':
							case 'msg': {
								const _unicastType =
									e2eType === 'story_reply' ||
									e2eType === 'feed_reshare' ||
									e2eType === 'native_flow_response' ||
									e2eType === 'companion_enc_static' ||
									e2eType === 'avatar_sticker' ||
									e2eType === 'genai_sticker' ||
									e2eType === 'account_authentication_request' ||
									e2eType === 'motion_video' ||
									e2eType === 'motion_photo'
										? 'msg'
										: e2eType
								msgBuffer = await repository.decryptMessage({
									jid: decryptionJid,
									type: _unicastType,
									ciphertext: content
								})
								break
							}

							case 'msmsg':
								// null = no bot node (non-streaming), 'full'/'last' = complete response
								// 'first' = streaming partial response, intentionally skipped
								msgBuffer =
									(await decryptMsmsgNode({
										stanza,
										content,
										fullMessage,
										author,
										sender,
										meLid,
										botType,
										botEditTargetId,
										metaTargetId,
										metaTargetSenderJid,
										logger
									})) || undefined
								break
							case 'plaintext':
								msgBuffer = content
								break
							default:
								throw new Error(`Unknown e2e type: ${e2eType}`)
						}

						if (!msgBuffer) continue

						let msg: proto.IMessage =
							e2eType === 'msmsg'
								? decodeDecryptedMsmsgMessage(msgBuffer)
								: proto.Message.decode(e2eType !== 'plaintext' ? unpadRandomMax16(msgBuffer) : msgBuffer)

						const outerMessageContextInfo = msg.messageContextInfo
						msg = msg.deviceSentMessage?.message || msg
						// deviceSentMessage.message may not carry messageContextInfo — preserve it
						if (outerMessageContextInfo && !msg.messageContextInfo) {
							msg.messageContextInfo = outerMessageContextInfo
						}

						if (msg.senderKeyDistributionMessage) {
							//eslint-disable-next-line max-depth
							try {
								await repository.processSenderKeyDistributionMessage({
									authorJid: author,
									item: msg.senderKeyDistributionMessage
								})
							} catch (err) {
								logger.error({ key: fullMessage.key, err }, 'failed to process sender key distribution message')
							}
						}

						if (msg.fastRatchetKeySenderKeyDistributionMessage) {
							//eslint-disable-next-line max-depth
							try {
								await repository.processSenderKeyDistributionMessage({
									authorJid: author,
									item: msg.fastRatchetKeySenderKeyDistributionMessage
								})
							} catch (err) {
								logger.error(
									{ key: fullMessage.key, err },
									'failed to process fast ratchet sender key distribution message'
								)
							}
						}

						if (fullMessage.message) {
							Object.assign(fullMessage.message, msg)
						} else {
							fullMessage.message = msg
						}

						applyDecodedMetadata(fullMessage, msg, e2eType, attrs)
					} catch (err: any) {
						const errorContext = {
							key: fullMessage.key,
							err,
							messageType: tag === 'plaintext' ? 'plaintext' : attrs.type,
							sender,
							author,
							isSessionRecordError: isSessionRecordError(err)
						}

						logger.error(errorContext, 'failed to decrypt message')

						fullMessage.messageStubType = proto.WebMessageInfo.StubType.CIPHERTEXT
						fullMessage.messageStubParameters = [err.message.toString()]
					}
				}
			}

			// if nothing was found to decrypt
			if (!decryptables && !fullMessage.key?.isViewOnce) {
				fullMessage.messageStubType = proto.WebMessageInfo.StubType.CIPHERTEXT
				fullMessage.messageStubParameters = [NO_MESSAGE_FOUND_ERROR_TEXT]
			}
		}
	}
}

/**
 * Utility function to check if an error is related to missing session record
 */
function isSessionRecordError(error: any): boolean {
	const errorMessage = error?.message || error?.toString() || ''
	return DECRYPTION_RETRY_CONFIG.sessionRecordErrors.some(errorPattern => errorMessage.includes(errorPattern))
}
