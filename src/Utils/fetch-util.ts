import http from 'node:http'
import https from 'node:https'

export const MAX_SIZE = 1024 * 1024 * 1024
export const TEXT_CAP_BYTES = 10_000_000

export const URL_REGEX = /https?:\/\/[^\s"'`<>]+/i
export const TRAILING_PUNCT_REGEX = /[.,;:!?]+$/
export const WRAPPER_PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308])
const MAX_REDIRECTS = 10

export interface QuotedMessage {
	message?: {
		extendedTextMessage?: { matchedText?: string | null; text?: string | null } | null
		conversation?: string | null
	} | null
}

export interface HeadResult {
	url: string
	status: number
	headers: http.IncomingHttpHeaders
	contentLength: number | null
}

export interface DownloadRangedOptions {
	chunkSize?: number
	concurrency?: number
	attempts?: number
}

const stripTrailingWrappers = (url: string): string => {
	while (url.length) {
		const last = url[url.length - 1] as string
		const open = WRAPPER_PAIRS[last]
		if (!open) break
		const openCount = url.split(open).length - 1
		const closeCount = url.split(last).length - 1
		if (closeCount <= openCount) break
		url = url.slice(0, -1)
	}
	return url
}

export const cleanUrl = (url?: string | null): string | null => {
	if (!url) return null
	let result = url.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
	let prev: string
	do {
		prev = result
		result = stripTrailingWrappers(result.replace(TRAILING_PUNCT_REGEX, ''))
	} while (result !== prev)
	return result || null
}

export const extractUrl = (text?: string | null): string | null => cleanUrl(text?.match(URL_REGEX)?.[0])

export const getUrlFromQuoted = (q?: QuotedMessage | null): string | null => {
	if (!q) return null
	const msg = q.message
	const raw =
		msg?.extendedTextMessage?.matchedText ||
		msg?.extendedTextMessage?.text?.match(URL_REGEX)?.[0] ||
		msg?.conversation?.match(URL_REGEX)?.[0] ||
		null
	return cleanUrl(raw)
}

export const buildHeaders = (url: string): Record<string, string> => {
	const headers: Record<string, string> = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
		Accept: '*/*',
		'Accept-Language': 'en-US,en;q=0.9',
		Connection: 'keep-alive'
	}
	if (url.includes('whatsapp.net') || url.includes('whatsapp.com')) {
		headers['User-Agent'] = 'WhatsApp/2.23.20.0 A'
		headers['Accept'] = 'application/json, text/plain, */*'
		headers['Origin'] = 'https://web.whatsapp.com'
		headers['Referer'] = 'https://web.whatsapp.com/'
	}
	if (url.includes('googlevideo.com')) {
		headers['Referer'] = 'https://www.youtube.com/'
		headers['Origin'] = 'https://www.youtube.com'
		headers['Range'] = 'bytes=0-'
	} else if (url.includes('ytimg.com')) {
		headers['Referer'] = 'https://www.youtube.com/'
		headers['Origin'] = 'https://www.youtube.com'
	}
	return headers
}

/**
 * HEAD request following redirects.
 * @throws Error on request failure or too many redirects
 */
export function head(url: string, redirects = 0): Promise<HeadResult> {
	return new Promise((resolve, reject) => {
		if (redirects > MAX_REDIRECTS) {
			return reject(new Error('too many redirects'))
		}

		const lib = new URL(url).protocol === 'https:' ? https : http

		const req = lib.request(
			url,
			{
				method: 'HEAD',
				headers: {
					'User-Agent': 'Mozilla/5.0',
					Accept: '*/*',
					Connection: 'keep-alive'
				}
			},
			res => {
				const status = res.statusCode as number
				const location = res.headers.location

				if (REDIRECT_CODES.has(status) && location) {
					res.resume()
					head(new URL(location, url).href, redirects + 1).then(resolve, reject)
					return
				}

				res.resume()
				resolve({
					url,
					status,
					headers: res.headers,
					contentLength: res.headers['content-length'] ? Number(res.headers['content-length']) : null
				})
			}
		)

		req.on('error', reject)
		req.end()
	})
}

/**
 * Download a file via bounded Range chunks (googlevideo throttles open-ended
 * `bytes=0-` streams to ~0.4MB/s but serves bounded ranges at full speed).
 * @throws whatever the failing request/assertion throws
 */
export async function downloadRanged(
	url: string,
	total?: number | null,
	opts: DownloadRangedOptions = {}
): Promise<Buffer> {
	let target = url
	let size = total

	if (!Number.isFinite(size) || (size as number) <= 0) {
		const meta = await head(target)
		target = meta.url
		size = meta.contentLength
	}
	if (!size) throw new Error(`unknown content length: ${target}`)

	const totalSize = size as number
	const chunkSize = opts.chunkSize ?? 4 * 1024 * 1024
	const concurrency = opts.concurrency ?? 4
	const attempts = opts.attempts ?? 3
	const count = Math.ceil(totalSize / chunkSize)
	const chunks = new Array<Buffer | undefined>(count)
	let cursor = 0

	const fetchChunk = async (index: number): Promise<void> => {
		const start = index * chunkSize
		const end = Math.min(start + chunkSize, totalSize) - 1
		const expected = end - start + 1

		for (let attempt = 1; ; attempt++) {
			try {
				const headers = buildHeaders(target)
				headers.Range = `bytes=${start}-${end}`
				const res = await fetch(target, {
					headers,
					signal: AbortSignal.timeout(30_000)
				})
				if (res.status !== 206) throw new Error(`range ${index} status ${res.status}`)
				const buf = Buffer.from(await res.arrayBuffer())
				if (buf.length !== expected) {
					throw new Error(`range ${index} short read ${buf.length}/${expected}`)
				}
				chunks[index] = buf
				return
			} catch (error) {
				if (attempt >= attempts) throw error
			}
		}
	}

	const worker = async (): Promise<void> => {
		while (cursor < count) {
			await fetchChunk(cursor++)
		}
	}

	await Promise.all(Array.from({ length: Math.min(concurrency, count) }, () => worker()))

	const buffer = Buffer.concat(chunks as Buffer[])
	if (buffer.length !== totalSize) {
		throw new Error(`assembled ${buffer.length}/${totalSize} bytes`)
	}
	return buffer
}

export async function readTextCapped(
	webStream: ReadableStream<Uint8Array> | null | undefined,
	capBytes: number
): Promise<{ text: string; truncated: boolean }> {
	if (!webStream) return { text: '', truncated: false }

	const reader = webStream.getReader()
	const decoder = new TextDecoder('utf-8')
	let text = ''
	let total = 0
	let truncated = false

	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			total += value.byteLength
			text += decoder.decode(value, { stream: true })
			if (total >= capBytes) {
				truncated = true
				break
			}
		}
	} finally {
		try {
			await reader.cancel()
		} catch {
			/* ignore */
		}
	}

	return { text, truncated }
}
