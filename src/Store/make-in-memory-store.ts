import type KeyedDB from '@adiwajshing/keyed-db'
import type { Comparable } from '@adiwajshing/keyed-db/lib/Types'
import type { Logger } from 'pino'
import type makeMDSocket from '../Socket'
import type {
	BaileysEventEmitter,
	Chat,
	ConnectionState,
	Contact,
	GroupMetadata,
	PresenceData,
	WAMessage,
	WAMessageCursor,
	WAMessageKey
} from '../Types'
import type { Label } from '../Types/Label'
import type { LabelAssociation, MessageLabelAssociation } from '../Types/LabelAssociation'

import { proto } from '../../WAProto'
import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import { md5, toNumber, updateMessageWithReaction, updateMessageWithReceipt } from '../Utils'
import { jidDecode, jidNormalizedUser } from '../WABinary'
import { LabelAssociationType } from '../Types/LabelAssociation'
import makeOrderedDictionary from './make-ordered-dictionary'
import { ObjectRepository } from './object-repository'
import KeyedDBImpl from '@adiwajshing/keyed-db'

type WASocket = ReturnType<typeof makeMDSocket>
type AnyFn = (...args: any[]) => any

/* =====================
 * Keys
 * ===================== */

export const waChatKey = (pin = true): Comparable<Chat, string> => ({
	key: c =>
		(pin ? (c.pinned ? '1' : '0') : '') +
		(c.archived ? '0' : '1') +
		(c.conversationTimestamp ? c.conversationTimestamp.toString(16).padStart(8, '0') : '') +
		c.id,
	compare: (a, b) => b.localeCompare(a)
})

export const waMessageID = (m: WAMessage) => m.key.id || ''

export const waLabelAssociationKey: Comparable<LabelAssociation, string> = {
	key: la => (la.type === LabelAssociationType.Chat ? la.chatId + la.labelId : la.chatId + la.messageId + la.labelId),
	compare: (a, b) => b.localeCompare(a)
}

const makeMessageDict = () => makeOrderedDictionary<WAMessage>(waMessageID)

/* =====================
 * Store
 * ===================== */

export default function makeInMemoryStore(
	config: {
		socket?: WASocket
		chatKey?: Comparable<Chat, string>
		labelAssociationKey?: Comparable<LabelAssociation, string>
		logger?: Logger
	} = {}
) {
	const {
		socket,
		chatKey = waChatKey(true),
		labelAssociationKey = waLabelAssociationKey,
		logger = DEFAULT_CONNECTION_CONFIG.logger.child({
			stream: 'in-mem-store'
		})
	} = config

	const chats = new (KeyedDBImpl as any)(chatKey, (c: Chat) => c.id) as KeyedDB<Chat, string>
	const messages: Record<string, ReturnType<typeof makeMessageDict>> = {}
	const contacts: Record<string, Contact> = {}
	const groupMetadata: Record<string, GroupMetadata> = {}
	const presences: Record<string, Record<string, PresenceData>> = {}
	const labels = new ObjectRepository<Label>()
	const labelAssociations = new (KeyedDBImpl as any)(labelAssociationKey, labelAssociationKey.key) as KeyedDB<
		LabelAssociation,
		string
	>
	const state: ConnectionState = { connection: 'close' }

	/* =====================
	 * Utils
	 * ===================== */

	const safe =
		(fn: AnyFn) =>
		(...args: any[]) => {
			try {
				return fn(...args)
			} catch (err) {
				logger.error({ err }, 'store error')
			}
		}

	const getMsgList = (jid: string) => {
		jid = jidNormalizedUser(jid)
		if (!messages[jid]) messages[jid] = makeMessageDict()
		return messages[jid]
	}

	const upsertContacts = (list: Contact[]) => {
		for (const c of list) {
			contacts[c.id] = { ...(contacts[c.id] || {}), ...c }
		}
	}

	const upsertLabels = (list: Label[]) => {
		for (const l of list) labels.upsertById(l.id, l)
	}

	const writeToFile = (path: string) => {
		const { writeFileSync } = require('fs')
		writeFileSync(path, JSON.stringify(toJSON(), null, 2))
	}

	const readFromFile = (path: string) => {
		const { readFileSync, existsSync } = require('fs')
		if (!existsSync(path)) return
		fromJSON(JSON.parse(readFileSync(path, 'utf8')))
	}

	/* =====================
	 * Bind Events (LENGKAP)
	 * ===================== */

	const bind = (ev: BaileysEventEmitter) => {
		ev.on(
			'connection.update',
			safe(u => Object.assign(state, u))
		)

		ev.on(
			'messaging-history.set',
			safe(({ chats: c, contacts: ct, messages: m, isLatest, syncType }) => {
				if (syncType === proto.HistorySync.HistorySyncType.ON_DEMAND) return

				if (isLatest) {
					chats.clear()
					Object.keys(messages).forEach(j => delete messages[j])
				}

				chats.insertIfAbsent(...c)
				upsertContacts(ct)

				for (const msg of m) {
					getMsgList(msg.key.remoteJid!).upsert(msg, 'prepend')
				}
			})
		)

		ev.on('contacts.upsert', safe(upsertContacts))

		ev.on(
			'contacts.update',
			safe(async updates => {
				for (const u of updates) {
					let contact = contacts[u.id!]
					if (!contact) {
						for (const id of Object.keys(contacts)) {
							const { user } = jidDecode(id)!
							const hash = (await md5(Buffer.from(user + 'WA_ADD_NOTIF'))).toString('base64').slice(0, 3)
							if (hash === u.id) {
								contact = contacts[id]
								break
							}
						}
					}

					if (!contact) continue

					if (u.imgUrl === 'changed') {
						contact.imgUrl = await socket?.profilePictureUrl(contact.id)
					} else if (u.imgUrl === 'removed') {
						delete contact.imgUrl
					}

					Object.assign(contact, u)
				}
			})
		)

		ev.on('chats.upsert', safe(chats.upsert.bind(chats)))

		ev.on(
			'chats.update',
			safe(updates => {
				for (const u of updates) {
					chats.update(u.id!, chat => {
						const upd = { ...u }
						if (upd.unreadCount! > 0) {
							upd.unreadCount = (chat.unreadCount || 0) + upd.unreadCount!
						}
						Object.assign(chat, upd)
					})
				}
			})
		)

		ev.on(
			'chats.delete',
			safe(ids => ids.forEach((id: string) => chats.deleteById(id)))
		)

		ev.on(
			'labels.edit',
			safe(l => {
				if (l.deleted) labels.deleteById(l.id)
				else if (labels.count() < 20) labels.upsertById(l.id, l)
			})
		)

		ev.on(
			'labels.association',
			safe(({ type, association }) => {
				type === 'add' ? labelAssociations.upsert(association) : labelAssociations.delete(association)
			})
		)

		ev.on(
			'presence.update',
			safe(({ id, presences: p }) => {
				presences[id] = { ...(presences[id] || {}), ...p }
			})
		)

		ev.on(
			'messages.upsert',
			safe(({ messages: m, type }) => {
				if (!['append', 'notify'].includes(type)) return
				for (const msg of m) {
					const jid = jidNormalizedUser(msg.key.remoteJid!)
					getMsgList(jid).upsert(msg, 'append')

					if (type === 'notify' && !chats.get(jid)) {
						chats.upsert({
							id: jid,
							unreadCount: 1,
							conversationTimestamp: toNumber(msg.messageTimestamp)
						})
					}
				}
			})
		)

		ev.on(
			'messages.update',
			safe(updates => {
				for (const { key, update } of updates) {
					getMsgList(key.remoteJid!).updateAssign(key.id!, update)
				}
			})
		)

		ev.on(
			'messages.delete',
			safe(item => {
				if ('all' in item) return messages[item.jid]?.clear()

				const list = messages[item.keys[0].remoteJid!]
				if (!list) return

				const ids = new Set(item.keys.map(k => k.id))
				list.filter(m => !ids.has(m.key.id))
			})
		)

		ev.on(
			'groups.update',
			safe(updates => {
				for (const u of updates) {
					Object.assign((groupMetadata[u.id!] ||= {} as GroupMetadata), u)
				}
			})
		)

		ev.on(
			'group-participants.update',
			safe(({ id, participants, action }) => {
				const meta = groupMetadata[id]
				if (!meta) return

				if (action === 'add') {
					meta.participants.push(
						...participants.map(id => ({
							id,
							isAdmin: false,
							isSuperAdmin: false
						}))
					)
				}

				if (action === 'remove') {
					meta.participants = meta.participants.filter(p => !participants.includes(p.id))
				}

				if (action === 'promote' || action === 'demote') {
					meta.participants.forEach(p => {
						if (participants.includes(p.id)) {
							p.isAdmin = action === 'promote'
						}
					})
				}
			})
		)

		ev.on(
			'message-receipt.update',
			safe(updates => {
				for (const { key, receipt } of updates) {
					const msg = messages[key.remoteJid!]?.get(key.id!)
					if (msg) updateMessageWithReceipt(msg, receipt)
				}
			})
		)

		ev.on(
			'messages.reaction',
			safe(reactions => {
				for (const { key, reaction } of reactions) {
					const msg = messages[key.remoteJid!]?.get(key.id!)
					if (msg) updateMessageWithReaction(msg, reaction)
				}
			})
		)
	}

	/* =====================
	 * Public API (UTUH)
	 * ===================== */

	return {
		chats,
		contacts,
		messages,
		groupMetadata,
		presences,
		labels,
		labelAssociations,
		state,
		bind,
		loadMessages: (jid: string, count: number, cursor?: WAMessageCursor) => {
			const list = messages[jid]
			if (!list) return []
			if (!cursor) return list.array.slice(-count)
			const cursorKey =
				cursor && 'before' in cursor ? cursor.before : cursor && 'after' in cursor ? cursor.after : undefined

			const cursorId = cursorKey?.id
			const idx = list.array.findIndex(m => m.key.id === cursorId)
			return idx >= 0 ? list.array.slice(Math.max(0, idx - count), idx) : []
		},
		loadMessage: (jid: string, id: string) => messages[jid]?.get(id),
		mostRecentMessage: (jid: string) => messages[jid]?.array.at(-1),
		fetchImageUrl: async (jid: string, sock?: WASocket) => {
			const c = contacts[jid]
			if (!c) return sock?.profilePictureUrl(jid)
			if (typeof c.imgUrl === 'undefined') {
				c.imgUrl = await sock?.profilePictureUrl(jid)
			}
			return c.imgUrl
		},
		fetchGroupMetadata: async (jid: string, sock?: WASocket) => {
			if (!groupMetadata[jid]) {
				const meta = await sock?.groupMetadata(jid)
				if (meta) groupMetadata[jid] = meta
			}
			return groupMetadata[jid]
		},
		getLabels: () => labels,
		getChatLabels: (chatId: string) => labelAssociations.filter((l: LabelAssociation) => l.chatId === chatId).all(),
		getMessageLabels: (msgId: string) =>
			labelAssociations
				.filter((l): l is MessageLabelAssociation => 'type' in l && l.type === LabelAssociationType.Message)
				.filter(l => l.messageId === msgId)
				.all()
				.map(l => l.labelId),
		toJSON: () => ({
			chats,
			contacts,
			messages,
			labels,
			labelAssociations
		}),
		fromJSON: (json: any) => {
			chats.upsert(...json.chats)
			upsertContacts(Object.values(json.contacts))
			upsertLabels(Object.values(json.labels || {}))
			labelAssociations.upsert(...(json.labelAssociations || []))

			for (const jid in json.messages) {
				const list = getMsgList(jid)
				for (const m of json.messages[jid]) {
					list.upsert(proto.WebMessageInfo.fromObject(m) as unknown as WAMessage, 'append')
				}
			}
		},
		writeToFile,
		readFromFile
	}
}
