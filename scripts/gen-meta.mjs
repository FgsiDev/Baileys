/**
 * gen-meta.mjs - regenerate ../meta.js dari source zapo.
 *
 *   node scripts/gen-meta.mjs [path-ke-zapo]        default: ./zapo
 *
 * Mengambil source teks asli tiap fungsi pada jalur KIRIM Meta AI lalu
 * menulisnya ke meta.js apa adanya. Kalau baris di zapo berubah, jalankan
 * ulang script ini.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const ROOT = process.argv[2] || './zapo'
const OUT = join(fileURLToPath(new URL('..', import.meta.url)), 'meta.js')

const cache = new Map()
const read = file => {
	if (!cache.has(file)) cache.set(file, readFileSync(join(ROOT, file), 'utf8').split('\n'))
	return cache.get(file)
}

/** Source teks satu fungsi/method, dari baris deklarasi sampai baris penutup. */
function src(file, line) {
	const L = read(file)
	const decl = L[line - 1] ?? ''
	if (!decl.trimEnd().endsWith('{')) return decl.trim()
	const ind = decl.length - decl.trimStart().length
	const closers = [' '.repeat(ind) + '}', ' '.repeat(ind) + '},']
	for (let i = line; i < L.length; i += 1) {
		if (closers.includes(L[i])) return L.slice(line - 1, i + 1).join('\n')
	}
	throw new Error(`closing brace not found: ${file}:${line}`)
}

const range = (file, from, to) =>
	read(file)
		.slice(from - 1, to)
		.join('\n')
const one = (file, line) => read(file)[line - 1]

/** Escape supaya kode TS bisa ditaruh di dalam template literal JS. */
const esc = s => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

/** Emit blok kode dengan indentasi 8 spasi, siap tempel di dalam backtick. */
const block = s =>
	esc(s)
		.split('\n')
		.map(l => (l.length === 0 ? '' : ' '.repeat(8) + l))
		.join('\n')

const wrap = s => '`\n' + block(s) + '\n' + ' '.repeat(8) + '`'

// ----------------------------------------------------------------------
// Meta deskriptif. `code` diambil dari sumber, bukan ditulis manual.
// ----------------------------------------------------------------------
const FUNCTIONS = [
	{
		name: 'sendPrompt',
		file: 'src/client/coordinators/WaBotCoordinator.ts',
		line: 370,
		path: ['direct', 'mention'],
		note: 'Entry point Meta AI. Menentukan jalur dari bentuk `to`: JID @bot = direct, selain itu wajib opts.botJid = mention. `to` menang atas opts.botJid saat `to` sudah @bot supaya prompt tidak salah rute.'
	},
	{
		name: 'isBotJid',
		file: 'src/protocol/jid.ts',
		line: 116,
		path: ['direct', 'mention'],
		note: 'Penentu direct vs mention path. Server "bot" dicocokkan tail-anchored.'
	},
	{
		name: 'isJidType',
		file: 'src/protocol/jid.ts',
		line: 95,
		path: ['direct', 'mention'],
		note: 'Helper private isBotJid. Menolak JID multi-@ supaya konsisten dengan splitJid.'
	},
	{
		name: 'normalizeBotJidToFbid',
		file: 'src/client/coordinators/WaBotCoordinator.ts',
		line: 320,
		path: ['direct', 'mention'],
		note: 'Membungkus resolveBotFbidJid dengan error yang menyebut cara memperbaiki input.'
	},
	{
		name: 'resolveBotFbidJid',
		file: 'src/protocol/bot.ts',
		line: 50,
		path: ['direct', 'mention'],
		note: 'JID @bot apa adanya; PN bot dipetakan via PN_TO_FBID_BOT (META_AI_PN -> META_AI_FBID). Mention path hanya boleh menyebut FBID.'
	},
	{
		name: 'buildMessageContent',
		file: 'src/client/messaging/messages.ts',
		line: 377,
		path: ['direct', 'mention'],
		note: 'Injected dari factory sebagai buildMediaMessageContent (WaClientFactory.ts:889). Mengubah WaSendMessageContent jadi Proto.IMessage. Bukan Meta AI spesifik.'
	},
	{
		name: 'attachBotMetadata',
		file: 'src/message/kinds/bot.ts',
		line: 60,
		path: ['direct'],
		note: 'Direct path: messageContextInfo.botMetadata = personaId? + capabilityMetadata.'
	},
	{
		name: 'attachBotThread',
		file: 'src/message/kinds/bot.ts',
		line: 92,
		path: ['direct'],
		note: 'Direct path: threadId AI_THREAD + botMetadata.botThreadInfo.clientInfo.type. aiThreadId yang sama = lanjut percakapan.'
	},
	{
		name: 'applyContextInfo',
		file: 'src/message/context-info.ts',
		line: 83,
		path: ['mention'],
		note: 'Mention path: merge mentionedJid + raw.botMessageSharingInfo ke submessage pembawa body; promote conversation ke extendedTextMessage.'
	},
	{
		name: 'buildContextInfoProto',
		file: 'src/message/context-info.ts',
		line: 35,
		path: ['mention'],
		note: 'Bangun Proto.IContextInfo; Object.assign raw di akhir membawa botMessageSharingInfo.'
	},
	{
		name: 'hasAnyKey',
		file: 'src/message/context-info.ts',
		line: 278,
		path: ['mention'],
		note: 'Guard: context kosong tidak perlu_objects._rewrite.'
	},
	{
		name: 'pickContextInfoTarget',
		file: 'src/message/context-info.ts',
		line: 165,
		path: ['mention'],
		note: 'Submessage object pertama yang menerima contextInfo.'
	},
	{
		name: 'sendMessage',
		file: 'src/client/coordinators/WaMessageDispatchCoordinator.ts',
		line: 459,
		path: ['direct', 'mention'],
		excerpt: [
			[583, 611],
			[1377, 1400]
		],
		note: 'Titik keluar Meta AI (method sepanjang 224 baris; hanya dua blok Meta AI yang dikutip). Blok 583-611 menambah messageSecret lalu menyimpannya, blok 1377-1400 menyisipkan sidecar bot ke group sender-key message.'
	},
	{
		name: 'ensureMessageSecret',
		file: 'src/message/crypto/use-case-secret.ts',
		line: 41,
		path: ['direct', 'mention'],
		note: 'Generate messageSecret 32 byte bila belum ada. Induk turunan bot msg secret.'
	},
	{
		name: 'assertMessageSecret',
		file: 'src/message/crypto/use-case-secret.ts',
		line: 23,
		path: ['mention', 'shared'],
		note: 'Validasi 32 byte, view zero-copy, selain itu throw.'
	},
	{
		name: 'randomBytesAsync',
		file: 'src/crypto/core/random.ts',
		line: 37,
		path: ['direct', 'mention'],
		note: 'randomBytes yang dipromisify: sumber messageSecret dan seed padding.'
	},
	{
		name: 'needsSecretPersistence',
		file: 'src/message/encode/content.ts',
		line: 328,
		path: ['direct', 'mention'],
		note: 'True untuk pesan ber-botMetadata, dicek di level atas dan setelah unwrap karena prompt grup ter-wrap di botInvokeMessage.'
	},
	{
		name: 'unwrapMessage',
		file: 'src/message/encode/content.ts',
		line: 205,
		path: ['direct', 'mention'],
		note: 'Turun rekursif lewat wrapper, termasuk botInvokeMessage dan botForwardedMessage.'
	},
	{
		name: 'messageSecretStore.set',
		file: 'src/store/contracts/message-secret.store.ts',
		line: 12,
		path: ['direct', 'mention'],
		note: 'Menyimpan messageSecret prompt + senderJid ke cache TTL (default memory).'
	},
	{
		name: 'resolveOutgoingSecretSenderJid',
		file: 'src/client/coordinators/WaMessageDispatchCoordinator.ts',
		line: 1492,
		path: ['direct', 'mention'],
		note: 'Sender JID yang dicatat bersama secret: prefer meLid, fallback meJid.'
	},
	{
		name: 'toUserJid',
		file: 'src/protocol/jid.ts',
		line: 236,
		path: ['direct', 'mention'],
		note: 'Buang segmen ":device" saat mencatat sender secret prompt.'
	},
	{
		name: 'buildBotSidecarParticipant',
		file: 'src/client/coordinators/WaMessageDispatchCoordinator.ts',
		line: 1254,
		path: ['mention'],
		note: 'Mention path: salinan prompt terenkripsi Signal dikirim langsung ke JID bot sebagai participant tambahan. Semua kegagalan return null agar group send tetap jalan.'
	},
	{
		name: 'extractInvokedBotJid',
		file: 'src/message/kinds/bot.ts',
		line: 119,
		path: ['mention'],
		note: 'JID @bot pertama dari mentionedJid - penentu apakah sidecar perlu dibuat.'
	},
	{
		name: 'parseSignalAddressFromJid',
		file: 'src/protocol/jid.ts',
		line: 155,
		path: ['mention'],
		note: 'Alamat { user, server, device } untuk mengenkripsi sidecar ke bot.'
	},
	{
		name: 'genBotMsgSecret',
		file: 'src/message/kinds/bot.ts',
		line: 9,
		path: ['mention'],
		note: 'HKDF(parentMessageSecret, "Bot Message", 32). Bot menurunkan key respons streaming-nya dari seed yang sama.'
	},
	{
		name: 'hkdf',
		file: 'src/crypto/core/hkdf.ts',
		line: 9,
		path: ['mention'],
		note: 'Wrapper sinkron di atas node:crypto hkdfSync. Dipakai sekali untuk bot msg secret.'
	},
	{
		name: 'toBytesView',
		file: 'src/util/bytes.ts',
		line: 250,
		path: ['mention'],
		note: 'Normalisasi ke Uint8Array tanpa copy kalau inputnya sudah benar.'
	},
	{
		name: 'buildBotInvokeProtoCopy',
		file: 'src/message/kinds/bot.ts',
		line: 138,
		path: ['mention'],
		note: 'Salinan sidecar: buang messageSecret, ganti botMessageSecret. Meniru updateBotInvokeMsgProtoCopyForCapi di wa-web minus rewrite pushname.'
	},
	{
		name: 'writeRandomPadMax16',
		file: 'src/message/encode/padding.ts',
		line: 9,
		path: ['mention'],
		note: 'Padding acak 1-16 byte untuk plaintext sidecar, seed diambil per-batch.'
	},
	{
		name: 'toError',
		file: 'src/util/primitives.ts',
		line: 10,
		path: ['mention'],
		note: 'Normalisasi error untuk log debug lalu return null, bukan melempar.'
	},
	{
		name: 'createBotCoordinator',
		file: 'src/client/coordinators/WaBotCoordinator.ts',
		line: 329,
		path: ['direct', 'mention'],
		note: 'Factory coordinator; hanya blok sendPrompt yang Meta AI.'
	}
]

const KONST = [
	{
		name: 'WA_BOT_KNOWN_JIDS',
		file: 'src/protocol/bot.ts',
		from: 37,
		to: 44,
		note: 'JID bot yang diketahui tanpa IQ. META_AI_PN wajib di-resolve ke META_AI_FBID.'
	},
	{
		name: 'WA_BOT_HKDF_INFO',
		file: 'src/protocol/bot.ts',
		from: 69,
		to: 69,
		note: 'Info string HKDF untuk menurunkan bot msg secret.'
	},
	{
		name: 'WA_BOT_MSG_SECRET_BYTES',
		file: 'src/protocol/bot.ts',
		from: 70,
		to: 70,
		note: 'Panjang key turunan sidecar.'
	},
	{
		name: 'WA_BLOKS_VERSIONING_ID',
		file: 'src/protocol/bot.ts',
		from: 74,
		to: 75,
		note: 'Harus cocok dengan bundle Bloks WA Web, kalau tidak mention invoke dibuang server.'
	},
	{
		name: 'WA_BOT_RENDERING_PIXEL_DENSITY',
		file: 'src/protocol/bot.ts',
		from: 77,
		to: 77,
		note: 'Nilai pixelDensity pada mention envelope.'
	},
	{
		name: 'WA_BOT_DEFAULT_CAPABILITIES',
		file: 'src/protocol/bot.ts',
		from: 80,
		to: 97,
		note: 'Capability rich-response default; bot dapat menolak prompt kosong capability.'
	},
	{
		name: 'WA_MESSAGE_SECRET_BYTES',
		file: 'src/message/crypto/use-case-secret.ts',
		from: 5,
		to: 5,
		note: 'Panjang parent message secret yang divalidasi sebelum HKDF.'
	},
	{
		name: 'WA_DEFAULTS.BOT_SERVER',
		file: 'src/protocol/defaults.ts',
		from: 14,
		to: 14,
		note: 'Server segment JID bot.'
	}
]

const PROTO = [
	{
		name: 'BotMetricsEntryPoint.INVOKE_META_AI_*',
		file: 'spec/proto/WAProto.proto',
		from: 67,
		to: 68,
		note: 'Entry point metrics pada contextInfo.botMessageSharingInfo.'
	},
	{
		name: 'AIThreadClientInfo.AIThreadType',
		file: 'spec/proto/WAProto.proto',
		from: 521,
		to: 526,
		note: 'Tipe thread AI; DEFAULT dipakai kalau aiThreadType tidak diisi.'
	},
	{
		name: 'Message.botInvokeMessage',
		file: 'spec/proto/WAProto.proto',
		from: 2875,
		to: 2875,
		note: 'Field 67 - wrapper mention path.'
	},
	{
		name: 'MessageContextInfo.botMetadata',
		file: 'spec/proto/WAProto.proto',
		from: 4528,
		to: 4528,
		note: 'Field 7 - tempat personaId / capabilityMetadata / botThreadInfo / botRenderingConfigMetadata.'
	},
	{
		name: 'ContextInfo.botMessageSharingInfo',
		file: 'spec/proto/WAProto.proto',
		from: 1798,
		to: 1798,
		note: 'Field 72 - penanda bahwa pesan ini meng-invoke bot.'
	},
	{
		name: 'BotMessageSharingInfo',
		file: 'spec/proto/WAProto.proto',
		from: 890,
		to: 893,
		note: 'botEntryPointOrigin + forwardScore.'
	},
	{
		name: 'BotRenderingConfigMetadata',
		file: 'spec/proto/WAProto.proto',
		from: 1104,
		to: 1107,
		note: 'bloksVersioningId + pixelDensity.'
	},
	{
		name: 'BotCapabilityMetadata',
		file: 'spec/proto/WAProto.proto',
		from: 627,
		to: 629,
		note: 'Daftar capability yang dikirim ke bot.'
	},
	{
		name: 'BotMetadata',
		file: 'spec/proto/WAProto.proto',
		from: 895,
		to: 907,
		note: 'Field yang dipakai: personaId(2), invokerJid(5), capabilityMetadata(13).'
	},
	{
		name: 'BotInvokeMessage / FutureProofMessage',
		file: 'spec/proto/WAProto.proto',
		from: 3315,
		to: 3317,
		note: 'Wrapper di dalam botInvokeMessage.message.'
	}
]

// ----------------------------------------------------------------------
// Emit
// ----------------------------------------------------------------------
const L = []
const push = s => L.push(s)

push(`/**
 * meta.js - katalog KODE ASLI jalur kirim Meta AI (bot) pada zapo-js.
 *
 * Entry point: \`client.bot.sendPrompt(to, content, options)\`
 *              -> src/client/coordinators/WaBotCoordinator.ts:370
 *
 * Isi file: source teks apa adanya dari repo zapo, bukan ringkasan. Regenerasi
 * dengan \`node scripts/gen-meta.mjs [path-ke-zapo]\`.
 *
 * Dua jalur yang dipetakan:
 *   direct  - \`to\` JID @bot, prompt dikirim langsung ke FBID JID bot
 *   mention - \`to\` grup/chat, bot di-invoke lewat mention di \`botInvokeMessage\`
 *             plus sidecar terenkripsi Signal ke bot
 *
 * Jalur balasan / decrypt chunk sengaja tidak diuraikan.
 *
 * Pakai:
 *   import { FUNCTIONS, CONSTANTS, PROTO, CALL_TREE, codeOf, find, verify } from './meta.js'
 *   codeOf('sendPrompt')   -> source teks lengkap
 *   find('sidecar')        -> entri yang relevan
 *   verify('./zapo')       -> cek semua file:line masih cocok dengan sumber
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export const REPO = 'zapo (vinikjkkj/zapo, zapo-js v1.9.0)'
`)

push(`/** Fungsi pada jalur kirim Meta AI, dengan source kode asli. */`)
push(`export const FUNCTIONS = [`)
FUNCTIONS.forEach((f, i) => {
	const code = f.excerpt
		? f.excerpt
				.map(([a, b]) => {
					const seg = range(f.file, a, b)
					return `// --- ${f.file}:${a}-${b} ---\n${seg}`
				})
				.join('\n\n')
		: src(f.file, f.line)
	push(`    {`)
	push(`        name: '${f.name}',`)
	push(`        file: '${f.file}',`)
	push(`        line: ${f.line},`)
	push(`        path: ${JSON.stringify(f.path)},`)
	push(`        note:`)
	push(`            '${f.note.replace(/'/g, "\\'")}',`)
	push(`        code: ${wrap(code)}`)
	push(`    }${i === FUNCTIONS.length - 1 ? '' : ','}`)
})
push(`]`)
push(``)

push(`/** Konstanta protokol yang dipakai jalur kirim Meta AI. */`)
push(`export const CONSTANTS = [`)
KONST.forEach((c, i) => {
	push(`    {`)
	push(`        name: '${c.name}',`)
	push(`        file: '${c.file}',`)
	push(`        line: ${c.from},`)
	push(`        note: '${c.note.replace(/'/g, "\\'")}',`)
	push(`        code: ${wrap(range(c.file, c.from, c.to))}`)
	push(`    }${i === KONST.length - 1 ? '' : ','}`)
})
push(`]`)
push(``)

push(`/** Potongan WAProto.proto yang membentuk envelope Meta AI. */`)
push(`export const PROTO = [`)
PROTO.forEach((c, i) => {
	push(`    {`)
	push(`        name: '${c.name}',`)
	push(`        file: '${c.file}',`)
	push(`        line: ${c.from},`)
	push(`        note: '${c.note.replace(/'/g, "\\'")}',`)
	push(`        code: ${wrap(range(c.file, c.from, c.to))}`)
	push(`    }${i === PROTO.length - 1 ? '' : ','}`)
})
push(`]`)
push(``)

push(`/** Bentuk options sendPrompt (src/client/coordinators/WaBotCoordinator.ts:93). */
export const OPTIONS = {
    file: 'src/client/coordinators/WaBotCoordinator.ts',
    line: 93,
    type: 'WaBotPromptOptions extends WaSendMessageOptions',
    shape: {
        botJid: 'bot yang di-invoke. Wajib saat to bukan JID @bot; diabaikan saat to sudah @bot.',
        personaId: 'hanya direct path.',
        capabilities: 'default WA_BOT_DEFAULT_CAPABILITIES.',
        extraMentionedJids: 'hanya mention path, tidak termasuk MentionedJid bot itu sendiri.',
        aiThreadId: 'hanya direct path; id sama = lanjut percakapan.',
        aiThreadType: 'default AIThreadType.DEFAULT.',
        '...WaSendMessageOptions': 'quote / forward / mentions / expiration diteruskan ke sendMessage.'
    }
}`)
push(``)

const tree = [
	'sendPrompt  [WaBotCoordinator.ts:370]',
	'  isBotJid -> isJidType  [protocol/jid.ts:116, :95]',
	'  normalizeBotJidToFbid -> resolveBotFbidJid -> isBotJid',
	'  buildMessageContent  [injected -> client/messaging/messages.ts:377]',
	'  --- DIRECT PATH (to = <user>@bot) ---',
	'  randomUUID  [node:crypto]',
	'  attachBotMetadata  [message/kinds/bot.ts:60]',
	'  attachBotThread  [message/kinds/bot.ts:92]',
	'  sendMessage(fbidBotJid, enriched, opts)  [WaMessageDispatchCoordinator.ts:459]',
	'    ensureMessageSecret -> randomBytesAsync  [use-case-secret.ts:41, random.ts:37]',
	'    assertMessageSecret -> toBytesView  [use-case-secret.ts:23, bytes.ts:250]',
	'    needsSecretPersistence -> unwrapMessage  [content.ts:328, :205]',
	'    messageSecretStore.set  [message-secret.store.ts:12]',
	'    resolveOutgoingSecretSenderJid -> toUserJid  [:1492, jid.ts:236]',
	'  --- MENTION PATH (to = grup/chat, opts.botJid wajib) ---',
	'  applyContextInfo  [context-info.ts:83]',
	'    buildContextInfoProto  [context-info.ts:35]',
	'    hasAnyKey  [context-info.ts:278]',
	'    pickContextInfoTarget  [context-info.ts:165]',
	'  bungkus -> Message { messageContextInfo: { threadId: [], botMetadata: {',
	'      botRenderingConfigMetadata: { bloksVersioningId, pixelDensity } } },',
	'    botInvokeMessage: { message: inner } }',
	'  sendMessage(to, wrapped, opts)  [WaMessageDispatchCoordinator.ts:459]',
	'    buildBotSidecarParticipant  [:1254]',
	'      extractInvokedBotJid  [bot.ts:119]',
	'      parseSignalAddressFromJid  [jid.ts:155]',
	'      genBotMsgSecret  [bot.ts:9]',
	'        assertMessageSecret -> toBytesView',
	'        hkdf -> hkdfSync(node:crypto)  [hkdf.ts:9]',
	'      buildBotInvokeProtoCopy  [bot.ts:138]',
	'      writeRandomPadMax16 -> randomBytesAsync  [padding.ts:9]',
	'      proto.Message.encode  [generated]',
	'      encryptMessagesBatch  [signal/session/SignalProtocol.ts:250]',
	'      toError  [util/primitives.ts:10]  (catch -> log debug, return null)',
	'    botParticipants: [botSidecar] disisipkan ke group sender-key node  [:1399]'
]
push(`/** Pohon panggilan dari sendPrompt ke akar, dipisah per jalur. */
export const CALL_TREE = ${JSON.stringify(tree, null, 4).replace(/^/gm, '    ').trimStart()}`)
push(``)

const flow = {
	directPath: [
		'to = <user>@bot -> isBotJid(to) true; opts.botJid diabaikan supaya tidak salah rute.',
		'normalizeBotJidToFbid(to) -> FBID JID (META_AI_PN dipetakan ke META_AI_FBID).',
		'buildMessageContent(content) -> Proto.IMessage dasar.',
		'aiThreadId = opts.aiThreadId ?? randomUUID().',
		'attachBotMetadata -> botMetadata = personaId? + capabilityMetadata (default WA_BOT_DEFAULT_CAPABILITIES).',
		'attachBotThread -> threadId AI_THREAD + botThreadInfo.clientInfo.type.',
		'sendMessage(fbidBotJid, enriched). Dispatcher menambah messageSecret 32 byte dan menyimpannya karena needsSecretPersistence() true untuk pesan ber-botMetadata.',
		'aiThreadId sama pada prompt berikutnya = percakapan berlanjut.'
	],
	mentionPath: [
		'to = grup/chat -> opts.botJid wajib, di-resolve ke FBID.',
		'applyContextInfo(baseMessage, { mentionedJids: [fbidBotJid, ...extraMentionedJids], raw: { botMessageSharingInfo: { botEntryPointOrigin: INVOKE_META_AI_GROUP, forwardScore: 0 } } }).',
		'Bungkus jadi Message { messageContextInfo: { threadId: [], botMetadata: { botRenderingConfigMetadata: { bloksVersioningId, pixelDensity } } }, botInvokeMessage: { message: inner } }.',
		'personaId / invokerJid / capabilities / botThreadInfo SENGAJA TIDAK dipasang - Meta AI membuang request kalau field itu ada di mention path. aiThreadId dan aiThreadType juga diabaikan.',
		'sendMessage(to, wrapped). Dispatcher melihat mention bot, membuat sidecar terenkripsi Signal ke JID bot, lalu tetap mengirim ke grup.',
		'bloksVersioningId harus cocok dengan bundle WA Web, kalau tidak mention invoke dibuang server.'
	],
	sidecar: [
		'Tujuan: memberi bot salinan prompt terenkripsi Signal di luar envelope grup.',
		'Syarat: extractInvokedBotJid menemukan @bot pada mentionedJid submessage pembawa body.',
		'Key diturunkan dari messageSecret prompt yang sama, sehingga bot bisa menurunkan key respons streaming-nya.',
		'Semua error ditelan (return null) - group send tidak boleh gagal gara-gara sidecar.'
	]
}
push(`/** Ringkasan naratif jalur kirim. */
export const FLOW = ${JSON.stringify(flow, null, 4).replace(/^/gm, '    ').trimStart()}`)
push(``)

push(`export const META = {
    repo: REPO,
    scope: 'kode asli jalur kirim Meta AI (direct + mention); jalur reply/decrypt tidak diuraikan',
    entryPoint: {
        symbol: 'client.bot.sendPrompt',
        file: 'src/client/coordinators/WaBotCoordinator.ts',
        line: 370
    },
    wiring: {
        file: 'src/client/WaClientFactory.ts',
        line: 886,
        note: 'createBotCoordinator; buildMessageContent (889), sendMessage -> messageDispatch.sendMessage (891)'
    },
    tests: {
        file: 'src/client/coordinators/__tests__/bot-coordinator.test.ts',
        line: 154,
        note: 'test sendPrompt direct/mention di baris 154, 193, 219, 268, 292, 311, 329, 340'
    },
    options: OPTIONS
}
`)
push(`/** Source teks asli sebuah entri FUNCTIONS. */
export function codeOf(name) {
    const hit = FUNCTIONS.find(f => f.name === name)
    if (!hit) throw new Error('tidak ada fungsi bernama: ' + name)
    return hit.code
}

/** Cari entri berdasarkan nama fungsi atau isi note (case-insensitive). */
export function find(needle) {
    const q = String(needle).toLowerCase()
    return FUNCTIONS.filter(
        f => f.name.toLowerCase().includes(q) || f.note.toLowerCase().includes(q)
    )
}

/** Semua entri pada satu jalur: 'direct' | 'mention' | 'shared'. */
export function byPath(path) {
    return FUNCTIONS.filter(f => f.path.includes(path))
}

/** Cek semua file:line terhadap sumber di repoRoot. */
export function verify(repoRoot) {
    const problems = []
    let checked = 0
    const check = (file, line, name) => {
        const abs = join(repoRoot, file)
        if (!existsSync(abs)) {
            problems.push({ file, line, name, actual: 'file tidak ada' })
            return
        }
        checked += 1
        const text = readFileSync(abs, 'utf8').split('\\n')[line - 1] ?? ''
        const bare = name.split(/[. (]/)[0]
        if (!text.includes(bare)) problems.push({ file, line, name, actual: text.trim().slice(0, 80) })
    }
    for (const f of FUNCTIONS) check(f.file, f.line, f.name)
    for (const c of [...CONSTANTS, ...PROTO]) check(c.file, c.line, c.name)
    return { checked, problems }
}

export default { REPO, META, FUNCTIONS, CONSTANTS, PROTO, OPTIONS, CALL_TREE, FLOW, codeOf, find, byPath, verify }
`)

writeFileSync(OUT, L.join('\n'))
console.log('tulis ' + OUT)
console.log(`  ${FUNCTIONS.length} fungsi, ${KONST.length} konstanta, ${PROTO.length} potongan proto`)
