import { promisify } from 'util'
import { deflate, unzip } from 'zlib'
import { proto } from '../../WAProto/index.js'

const deflateAsync = promisify(deflate)
const unzipAsync = promisify(unzip)

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
	const compressed = Buffer.from(await deflateAsync(encoded, { level: 1 }))
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
	meUserJid: string
}

export interface WaShareGroupHistoryInput {
	toJids?: string[]
	forceSkip?: boolean
	count?: number
	sinceMs?: number
	messages?: proto.IWebMessageInfo[]
	outOfWindowPinnedMessages?: proto.IWebMessageInfo[]
	includesChatTheme?: boolean
}

export interface WaShareGroupHistoryResult {
	bundleMessageId: string
	noticeMessageId?: string
	messagesCount: number
	historyReceivers: string[]
	nonHistoryReceivers: string[]
}

const timestampSeconds = (message: proto.IWebMessageInfo | null | undefined): number | undefined => {
	const raw = message?.messageTimestamp
	const seconds = typeof raw === 'object' && raw !== null ? Number(raw) : raw
	return typeof seconds === 'number' && Number.isFinite(seconds) ? seconds : undefined
}

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
