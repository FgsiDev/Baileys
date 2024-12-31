import { promisify } from 'util'
import { deflate, unzip } from 'zlib'
import { proto } from '../../WAProto/index.js'

const deflateAsync = promisify(deflate)
const unzipAsync = promisify(unzip)

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
