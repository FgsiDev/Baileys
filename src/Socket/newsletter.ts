import type { NewsletterCreateResponse, SocketConfig, WAMediaUpload } from '../Types'
import type { NewsletterMetadata, NewsletterUpdate } from '../Types'
import { QueryIds, XWAPaths } from '../Types'
import { generateProfilePicture } from '../Utils/messages-media'
import { getBinaryNodeChild, getBinaryNodeChildren, S_WHATSAPP_NET } from '../WABinary'
import { makeGroupsSocket } from './groups'
import { executeWMexQuery as genericExecuteWMexQuery } from './mex'
import { proto } from '../../WAProto/index.js'

const parseNewsletterCreateResponse = (response: NewsletterCreateResponse): NewsletterMetadata => {
	const { id, thread_metadata: thread, viewer_metadata: viewer } = response
	return {
		id,
		owner: undefined,
		name: thread.name.text,
		creation_time: parseInt(thread.creation_time, 10),
		description: thread.description.text,
		invite: thread.invite,
		subscribers: parseInt(thread.subscribers_count, 10),
		verification: thread.verification,
		picture: {
			id: thread.picture?.id,
			directPath: thread.picture?.direct_path
		},
		mute_state: viewer.mute
	}
}

const parseNewsletterMetadata = (result: unknown): NewsletterMetadata | null => {
	if (typeof result !== 'object' || result === null) return null

	if ('id' in result && typeof (result as any).id === 'string') {
		return result as NewsletterMetadata
	}

	if (
		'result' in result &&
		typeof (result as any).result === 'object' &&
		(result as any).result !== null &&
		'id' in (result as any).result
	) {
		return (result as any).result as NewsletterMetadata
	}

	return null
}

export const makeNewsletterSocket = (config: SocketConfig) => {
	const sock = makeGroupsSocket(config)
	const { query, generateMessageTag } = sock

	const executeWMexQuery = <T>(variables: Record<string, unknown>, queryId: string, dataPath: string): Promise<T> => {
		return genericExecuteWMexQuery<T>(variables, queryId, dataPath, query, generateMessageTag)
	}

	const newsletterUpdate = async (jid: string, updates: NewsletterUpdate) => {
		const variables = {
			newsletter_id: jid,
			updates: {
				...updates,
				settings: null
			}
		}
		return executeWMexQuery(variables, QueryIds.UPDATE_METADATA, 'xwa2_newsletter_update')
	}

	return {
		...sock,
		executeWMexQuery,

		newsletterCreate: async (name: string, description?: string) => {
			const variables = {
				input: {
					name,
					description: description ?? null
				}
			}

			const raw = await executeWMexQuery<NewsletterCreateResponse>(
				variables,
				QueryIds.CREATE,
				XWAPaths.xwa2_newsletter_create
			)

			return parseNewsletterCreateResponse(raw)
		},

		newsletterUpdate,

		newsletterSubscribers: async (jid: string) => {
			return executeWMexQuery({ newsletter_id: jid }, QueryIds.SUBSCRIBERS, XWAPaths.xwa2_newsletter_subscribers)
		},

		// NEW (from updated version)
		newsletterSubscribed: async () => {
			return executeWMexQuery({}, QueryIds.SUBSCRIBED, XWAPaths.xwa2_newsletter_subscribed)
		},

		newsletterMetadata: async (type: 'invite' | 'jid', key: string) => {
			const variables = {
				fetch_creation_time: true,
				fetch_full_image: true,
				fetch_viewer_metadata: true,
				input: {
					key,
					type: type.toUpperCase()
				}
			}

			const result = await executeWMexQuery<unknown>(variables, QueryIds.METADATA, XWAPaths.xwa2_newsletter_metadata)

			return parseNewsletterMetadata(result)
		},

		// UPDATED PATH (join/leave v2)
		newsletterFollow: (jid: string) => {
			return executeWMexQuery({ newsletter_id: jid }, QueryIds.FOLLOW, XWAPaths.xwa2_newsletter_join_v2)
		},

		newsletterUnfollow: (jid: string) => {
			return executeWMexQuery({ newsletter_id: jid }, QueryIds.UNFOLLOW, XWAPaths.xwa2_newsletter_leave_v2)
		},

		newsletterMute: (jid: string) => {
			return executeWMexQuery({ newsletter_id: jid }, QueryIds.MUTE, XWAPaths.xwa2_newsletter_mute_v2)
		},

		newsletterUnmute: (jid: string) => {
			return executeWMexQuery({ newsletter_id: jid }, QueryIds.UNMUTE, XWAPaths.xwa2_newsletter_unmute_v2)
		},

		newsletterUpdateName: (jid: string, name: string) => {
			return newsletterUpdate(jid, { name })
		},

		newsletterUpdateDescription: (jid: string, description: string) => {
			return newsletterUpdate(jid, { description })
		},

		newsletterUpdatePicture: async (jid: string, content: WAMediaUpload) => {
			const { img } = await generateProfilePicture(content)
			return newsletterUpdate(jid, { picture: img.toString('base64') })
		},

		newsletterRemovePicture: (jid: string) => {
			return newsletterUpdate(jid, { picture: '' })
		},

		newsletterReactMessage: async (jid: string, serverId: string, reaction?: string) => {
			await query({
				tag: 'message',
				attrs: {
					to: jid,
					...(reaction ? {} : { edit: '7' }),
					type: 'reaction',
					server_id: serverId,
					id: generateMessageTag()
				},
				content: [
					{
						tag: 'reaction',
						attrs: reaction ? { code: reaction } : {}
					}
				]
			})
		},

		// UPDATED FULL PARSE VERSION
		newsletterFetchMessages: async (
			type: 'jid' | 'key',
			key: string,
			count: number,
			after?: number,
			before?: number
		) => {
			const attrs: any = {
				count: count.toString(),
				type,
				[type === 'jid' ? 'jid' : 'key']: key
			}

			if (after) attrs.after = after.toString()
			if (before) attrs.before = before.toString()

			const result = await query({
				tag: 'iq',
				attrs: {
					id: generateMessageTag(),
					type: 'get',
					xmlns: 'newsletter',
					to: S_WHATSAPP_NET
				},
				content: [
					{
						tag: 'messages',
						attrs
					}
				]
			})

			const messagesNode = getBinaryNodeChild(result, 'messages')
			if (!messagesNode) return []

			const newsletterJid = messagesNode.attrs.jid || (type === 'jid' ? key : undefined)

			const messages: any[] = []

			for (const child of getBinaryNodeChildren(messagesNode, 'message')) {
				const plaintext = getBinaryNodeChild(child, 'plaintext')
				if (!plaintext?.content) continue

				try {
					const content = plaintext.content
					let buf: Buffer
					if (typeof content === 'string') {
						buf = Buffer.from(content, 'binary')
					} else if (content instanceof Uint8Array || Buffer.isBuffer(content)) {
						buf = Buffer.from(content)
					} else {
						// BinaryNode[] atau tipe lain yang tidak didukung
						continue
					}
					const msg = proto.Message.decode(buf).toJSON()
					const full = proto.WebMessageInfo.fromObject({
						key: {
							remoteJid: newsletterJid,
							id: child.attrs.id || child.attrs.server_id,
							server_id: child.attrs.server_id,
							fromMe: false
						},
						message: msg,
						messageTimestamp: child.attrs.t ? +child.attrs.t : undefined
					}).toJSON()

					messages.push(full)
				} catch (e) {
					// ignore decode error
				}
			}

			return messages
		},

		subscribeNewsletterUpdates: async (jid: string) => {
			const result = await query({
				tag: 'iq',
				attrs: {
					id: generateMessageTag(),
					type: 'set',
					xmlns: 'newsletter',
					to: jid
				},
				content: [{ tag: 'live_updates', attrs: {}, content: [] }]
			})

			const node = getBinaryNodeChild(result, 'live_updates')
			const duration = node?.attrs?.duration

			return duration ? { duration } : null
		},

		newsletterAdminCount: async (jid: string) => {
			const res = await executeWMexQuery<{ admin_count: number }>(
				{ newsletter_id: jid },
				QueryIds.ADMIN_COUNT,
				XWAPaths.xwa2_newsletter_admin_count
			)

			return res.admin_count
		},

		newsletterChangeOwner: async (jid: string, newOwnerJid: string) => {
			return executeWMexQuery(
				{ newsletter_id: jid, user_id: newOwnerJid },
				QueryIds.CHANGE_OWNER,
				XWAPaths.xwa2_newsletter_change_owner
			)
		},

		newsletterDemote: async (jid: string, userJid: string) => {
			return executeWMexQuery(
				{ newsletter_id: jid, user_id: userJid },
				QueryIds.DEMOTE,
				XWAPaths.xwa2_newsletter_demote
			)
		},

		newsletterDelete: async (jid: string) => {
			return executeWMexQuery({ newsletter_id: jid }, QueryIds.DELETE, XWAPaths.xwa2_newsletter_delete_v2)
		}
	}
}

export type NewsletterSocket = ReturnType<typeof makeNewsletterSocket>
