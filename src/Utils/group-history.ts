import { promisify } from 'util'
import { deflate, unzip } from 'zlib'
import { proto } from '../../WAProto/index.js'

const deflateAsync = promisify(deflate)
const unzipAsync = promisify(unzip)

/** Wire mimetype of an uploaded group-history bundle blob. */
export const GROUP_HISTORY_BUNDLE_MIMETYPE = 'application/protobuf'

export interface WaGroupHistoryBundleEncoding {
	readonly compressed: Buffer
	readonly encoded: Buffer
}

export async function encodeGroupHistoryBundle(
	messages: proto.IWebMessageInfo[],
	outOfWindowPinnedMessages?: proto.IWebMessageInfo[]
): Promise<WaGroupHistoryBundleEncoding> {
	const encoded = proto.GroupHistory.encode({
		messages: messages as proto.IWebMessageInfo[],
		outOfWindowPinnedMessages: outOfWindowPinnedMessages?.length
			? (outOfWindowPinnedMessages as proto.IWebMessageInfo[])
			: undefined
	}).finish()
	const compressed = Buffer.from(await deflateAsync(encoded))
	return { compressed, encoded: Buffer.from(encoded) }
}

export async function decodeGroupHistoryBundle(blob: Uint8Array): Promise<proto.GroupHistory> {
	const inflated = Buffer.from(await unzipAsync(Buffer.from(blob)))
	return proto.GroupHistory.decode(inflated)
}

export interface WaGroupHistoryAudience {
	historyReceivers: string[]
	nonHistoryReceivers: string[]
	unknownJids: string[]
	requestedSelf: boolean
	addressingMode: 'pn' | 'lid'
	/** This account's own user jid, written in the group's addressing mode. */
	meUserJid: string
}

export interface WaShareGroupHistoryInput {
	toJids: string[]
	count?: number
	sinceMs?: number
	messages?: proto.IWebMessageInfo[]
	outOfWindowPinnedMessages?: proto.IWebMessageInfo[]
}

export interface WaShareGroupHistoryResult {
	bundleMessageId: string
	noticeMessageId?: string
	messagesCount: number
	historyReceivers: string[]
	nonHistoryReceivers: string[]
}

/** Reads `messageTimestamp` (unix seconds, may arrive as a protobuf Long) as a number. */
const timestampSeconds = (message: proto.IWebMessageInfo | null | undefined): number | undefined => {
	const raw = message?.messageTimestamp
	const seconds = typeof raw === 'object' && raw !== null ? Number(raw) : raw
	return typeof seconds === 'number' && Number.isFinite(seconds) ? seconds : undefined
}

/**
 * Oldest message timestamp (unix seconds) of the list, or `undefined` when no
 * message carries one. The sender reports it so the receiver can tell how far
 * back the shared window reaches.
 */
export function oldestTimestampSeconds(
	messages: readonly proto.IWebMessageInfo[] | null | undefined
): number | undefined {
	let oldest: number | undefined
	for (const message of messages || []) {
		const seconds = timestampSeconds(message)
		if (seconds === undefined) {
			continue
		}
		if (oldest === undefined || seconds < oldest) {
			oldest = seconds
		}
	}
	return oldest
}
