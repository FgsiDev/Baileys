import { proto } from '../../WAProto'
import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import { LabelAssociationType } from '../Types/LabelAssociation'
import { md5, toNumber, updateMessageWithReaction, updateMessageWithReceipt } from '../Utils'
import { jidDecode, jidNormalizedUser } from '../WABinary'
import makeOrderedDictionary from './make-ordered-dictionary'
import { ObjectRepository } from './object-repository'
import KeyedDB from '@adiwajshing/keyed-db'

/* =====================
 * Keys
 * ===================== */

export const waChatKey = (pin = true) => ({
	key: c =>
		(pin ? (c.pinned ? '1' : '0') : '') +
		(c.archived ? '0' : '1') +
		(c.conversationTimestamp ? c.conversationTimestamp.toString(16).padStart(8, '0') : '') +
		c.id,
	compare: (a, b) => b.localeCompare(a)
})

export const waMessageID = m => m?.key?.id ?? ''

export const waLabelAssociationKey = {
	key: la => (la.type === LabelAssociationType.Chat ? la.chatId + la.labelId : la.chatId + la.messageId + la.labelId),
	compare: (a, b) => b.localeCompare(a)
}

const makeMessageDict = () => makeOrderedDictionary(waMessageID)

/* =====================
 * Store
 * ===================== */

export default function makeInMemoryStore(config = {}) {
	const {
		socket,
		chatKey = waChatKey(true),
		labelAssociationKey = waLabelAssociationKey,
		logger = DEFAULT_CONNECTION_CONFIG.logger.child({
			stream: 'in-mem-store'
		})
	} = config

	/* =====================
	 * State
	 * ===================== */

	const chats = new KeyedDB(chatKey, c => c.id)
	const messages = Object.create(null)
	const contacts = Object.create(null)
	const groupMetadata = Object.create(null)
	const presences = Object.create(null)
	const labels = new ObjectRepository()
	const labelAssociations = new KeyedDB(labelAssociationKey, labelAssociationKey.key)
	const state = { connection: 'close' }

	/* =====================
	 * Utils
	 * ===================== */

	const safe =
		fn =>
		(...args) => {
			try {
				return fn(...args)
			} catch (err) {
				logger.error({ err }, 'store error')
			}
		}

	const getMsgList = jid => {
		jid = jidNormalizedUser(jid)
		if (!messages[jid]) messages[jid] = makeMessageDict()
		return messages[jid]
	}

	const upsertContacts = list => {
		for (const c of list) {
			contacts[c.id] = { ...(contacts[c.id] || {}), ...c }
		}
	}

	const upsertLabels = list => {
		for (const l of list) {
			labels.upsertById(l.id, l)
		}
	}

	/* =====================
	 * Bind Events (ALL)
	 * ===================== */

	const bind = ev => {
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
					getMsgList(msg.key.remoteJid).upsert(msg, 'prepend')
				}
			})
		)

		ev.on('contacts.upsert', safe(upsertContacts))

		ev.on(
			'contacts.update',
			safe(async updates => {
				for (const u of updates) {
					let contact = contacts[u.id]

					if (!contact) {
						for (const id of Object.keys(contacts)) {
							const { user } = jidDecode(id)
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
					chats.update(u.id, chat => {
						const upd = { ...u }
						if (upd.unreadCount > 0) {
							upd.unreadCount = (chat.unreadCount || 0) + upd.unreadCount
						}
						Object.assign(chat, upd)
					})
				}
			})
		)

		ev.on(
			'chats.delete',
			safe(ids => {
				for (const id of ids) chats.deleteById(id)
			})
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
					const jid = jidNormalizedUser(msg.key.remoteJid)
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
					getMsgList(key.remoteJid).updateAssign(key.id, { ...update })
				}
			})
		)

		ev.on(
			'messages.delete',
			safe(item => {
				if (item.all) return messages[item.jid]?.clear()

				const list = messages[item.keys?.[0]?.remoteJid]
				if (!list) return

				const ids = new Set(item.keys.map(k => k.id))
				list.forEach(m => ids.has(m.key.id) && (m.isDelete = true))
			})
		)

		ev.on(
			'groups.update',
			safe(updates => {
				for (const u of updates) {
					Object.assign((groupMetadata[u.id] ||= {}), u)
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
					const msg = messages[key.remoteJid]?.get(key.id)
					if (msg) updateMessageWithReceipt(msg, receipt)
				}
			})
		)

		ev.on(
			'messages.reaction',
			safe(reactions => {
				for (const { key, reaction } of reactions) {
					const msg = messages[key.remoteJid]?.get(key.id)
					if (msg) updateMessageWithReaction(msg, reaction)
				}
			})
		)
	}

	/* =====================
	 * Public API (FULL)
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

		loadMessages(jid, count, cursor) {
			const list = messages[jid]
			if (!list) return []

			if (!cursor) return list.array.slice(-count)

			const idx = list.array.findIndex(m => m.key.id === cursor.id)
			return idx >= 0 ? list.array.slice(Math.max(0, idx - count), idx) : []
		},

		loadMessage: (jid, id) => messages[jid]?.get(id),

		mostRecentMessage: jid => messages[jid]?.array.at(-1),

		fetchImageUrl: async (jid, sock) => {
			const c = contacts[jid]
			if (!c) return sock?.profilePictureUrl(jid)
			if (typeof c.imgUrl === 'undefined') {
				c.imgUrl = await sock?.profilePictureUrl(jid)
			}
			return c.imgUrl
		},

		fetchGroupMetadata: async (jid, sock) => {
			if (!groupMetadata[jid]) {
				const meta = await sock?.groupMetadata(jid)
				if (meta) groupMetadata[jid] = meta
			}
			return groupMetadata[jid]
		},

		getLabels: () => labels,

		getChatLabels: chatId => labelAssociations.filter(l => l.chatId === chatId).all(),

		getMessageLabels: msgId =>
			labelAssociations
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

		fromJSON: json => {
			chats.upsert(...json.chats)
			upsertContacts(Object.values(json.contacts))
			upsertLabels(Object.values(json.labels || {}))
			labelAssociations.upsert(...(json.labelAssociations || []))

			for (const jid in json.messages) {
				const list = getMsgList(jid)
				for (const m of json.messages[jid]) {
					list.upsert(proto.WebMessageInfo.fromObject(m), 'append')
				}
			}
		},

		writeToFile: path => {
			const { writeFileSync } = require('fs')
			writeFileSync(path, JSON.stringify(this.toJSON(), null, 2))
		},

		readFromFile: path => {
			const { readFileSync, existsSync } = require('fs')
			if (!existsSync(path)) return
			this.fromJSON(JSON.parse(readFileSync(path, 'utf8')))
		}
	}
}
