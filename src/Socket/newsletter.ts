import type {
	NewsletterCreateResponse,
	SocketConfig,
	WAMediaUpload,
	NewsletterMetadata,
	NewsletterUpdate,
	NewsletterViewRole,
	NewsletterAdminCapabilities,
	NewsletterAdminInfo,
	NewsletterPollVoterOptions,
	NewsletterReactionSender,
	NewsletterDirectoryOptions,
	NewsletterDirectorySearchOptions,
	NewsletterDirectoryCategoriesOptions,
	NewsletterPollVoteOptions,
	NewsletterInsightsOptions,
	NewsletterFollowersOptions,
	NewsletterQuestionResponseState,
	NewsletterRecommendedOptions,
	NewsletterSimilarOptions
} from '../Types'
import { QueryIds, XWAPaths } from '../Types'
import { generateProfilePicture } from '../Utils/messages-media'
import { getBinaryNodeChild, getBinaryNodeChildren, S_WHATSAPP_NET } from '../WABinary'
import { makeGroupsSocket } from './groups'
import { executeWMexQuery as genericExecuteWMexQuery } from './mex'
import { proto } from '../../WAProto/index.js'
import { createHash } from 'node:crypto'

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
	if (typeof result !== 'object' || result === null) {
		return null
	}

	if ('id' in result && typeof (result as { id?: unknown }).id === 'string') {
		return result as NewsletterMetadata
	}

	if (
		'result' in result &&
		typeof (result as { result?: unknown }).result === 'object' &&
		(result as { result?: unknown }).result !== null &&
		'id' in (result as { result: object }).result
	) {
		return (
			result as {
				result: NewsletterMetadata
			}
		).result
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

			return newsletterUpdate(jid, {
				picture: img.toString('base64')
			})
		},

		newsletterRemovePicture: (jid: string) => {
			return newsletterUpdate(jid, {
				picture: ''
			})
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

		newsletterFetchMessages: async (
			type: 'jid' | 'key',
			key: string,
			count: number,
			after?: number,
			before?: number
		) => {
			const attrs: Record<string, string> = {
				count: count.toString(),
				type,
				[type === 'jid' ? 'jid' : 'key']: key
			}

			if (after) {
				attrs.after = after.toString()
			}

			if (before) {
				attrs.before = before.toString()
			}

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

			if (!messagesNode) {
				return []
			}

			const newsletterJid = messagesNode.attrs.jid || (type === 'jid' ? key : undefined)

			const messages: proto.WebMessageInfo[] = []

			for (const child of getBinaryNodeChildren(messagesNode, 'message')) {
				const plaintext = getBinaryNodeChild(child, 'plaintext')

				if (!plaintext?.content) {
					continue
				}

				try {
					const content = plaintext.content

					let buf: Buffer

					if (typeof content === 'string') {
						buf = Buffer.from(content, 'binary')
					} else if (content instanceof Uint8Array || Buffer.isBuffer(content)) {
						buf = Buffer.from(content)
					} else {
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
					})

					messages.push(full)
				} catch {
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
				content: [
					{
						tag: 'live_updates',
						attrs: {},
						content: []
					}
				]
			})

			const node = getBinaryNodeChild(result, 'live_updates')

			const duration = node?.attrs?.duration

			return duration ? { duration } : null
		},

		newsletterAdminCount: async (jid: string) => {
			const res = await executeWMexQuery<{
				admin_count: number
			}>(
				{
					newsletter_id: jid
				},
				QueryIds.ADMIN_COUNT,
				XWAPaths.xwa2_newsletter_admin_count
			)

			return res.admin_count
		},

		newsletterChangeOwner: async (jid: string, newOwnerJid: string) => {
			return executeWMexQuery(
				{
					newsletter_id: jid,
					user_id: newOwnerJid
				},
				QueryIds.CHANGE_OWNER,
				XWAPaths.xwa2_newsletter_change_owner
			)
		},

		newsletterDemote: async (jid: string, userJid: string) => {
			return executeWMexQuery(
				{
					newsletter_id: jid,
					user_id: userJid
				},
				QueryIds.DEMOTE,
				XWAPaths.xwa2_newsletter_demote
			)
		},

		newsletterDelete: async (jid: string) => {
			return executeWMexQuery(
				{
					newsletter_id: jid
				},
				QueryIds.DELETE,
				XWAPaths.xwa2_newsletter_delete_v2
			)
		},

		newsletterAdminCapabilities: async (jid: string): Promise<NewsletterAdminCapabilities> => {
			const response = await executeWMexQuery<{
				capabilities?: NewsletterAdminCapabilities
			}>(
				{
					newsletter_id: jid
				},
				QueryIds.ADMIN_CAPABILITIES,
				XWAPaths.xwa2_newsletter_admin_capabilities
			)

			return response?.capabilities ?? {}
		},

		newsletterAdminInfo: async (jid: string): Promise<NewsletterAdminInfo> => {
			return executeWMexQuery<NewsletterAdminInfo>(
				{
					newsletter_id: jid
				},
				QueryIds.ADMIN_INFO,
				XWAPaths.admin_profile
			)
		},

		newsletterDehydrated: async (type: 'GUEST' | 'ADMIN' | 'SUBSCRIBER', key: string, options: any = {}) => {
			const { viewRole = 'GUEST', fetchPinnedMessages = false, fetchWamoSub = false } = options
			const variables = {
				input: {
					key,
					type: type.toUpperCase(),
					view_role: viewRole
				},
				fetch_wamo_sub: fetchWamoSub,
				fetch_pinned_messages: fetchPinnedMessages
			}
			const result = await executeWMexQuery(variables, QueryIds.DEHYDRATED, XWAPaths.xwa2_newsletter_metadata)
			return parseNewsletterMetadata(result)
		},

		newsletterPollVoters: async (jid: string, serverId: string | number, options: NewsletterPollVoterOptions = {}) => {
			return executeWMexQuery(
				{
					input: {
						newsletter_id: jid,
						server_id: String(serverId),
						limit: options.limit ?? 100,
						vote_hash: options.voteHash
					}
				},
				QueryIds.POLL_VOTERS,
				XWAPaths.voter_list
			)
		},

		newsletterReactionSenders: async (jid: string, serverId: string | number): Promise<NewsletterReactionSender[]> => {
			return executeWMexQuery<NewsletterReactionSender[]>(
				{
					input: {
						id: jid,
						server_id: String(serverId)
					}
				},
				QueryIds.REACTION_SENDER_LIST,
				XWAPaths.xwa2_newsletters_reaction_sender_list
			)
		},

		newsletterPinMessages: async (jid: string, serverIds: string | number | Array<string | number>) => {
			const messageIds = (Array.isArray(serverIds) ? serverIds : [serverIds]).map(id => String(id))

			return executeWMexQuery(
				{
					newsletter_id: jid,
					input: {
						message_ids: messageIds
					}
				},
				QueryIds.PIN_MESSAGES,
				XWAPaths.xwa2_newsletter_pin_messages
			)
		},

		newsletterUnpinMessages: async (jid: string, serverIds: string | number | Array<string | number>) => {
			const messageIds = (Array.isArray(serverIds) ? serverIds : [serverIds]).map(id => String(id))

			return executeWMexQuery(
				{
					newsletter_id: jid,
					input: {
						message_ids: messageIds
					}
				},
				QueryIds.UNPIN_MESSAGES,
				XWAPaths.xwa2_newsletter_unpin_messages
			)
		},

		newsletterLabelAiContent: async (jid: string, serverId: string | number, messageType = 'MESSAGE') => {
			return executeWMexQuery(
				{
					newsletter_id: jid,
					server_id: String(serverId),
					message_type: messageType
				},
				QueryIds.LABEL_AI_CONTENT,
				XWAPaths.xwa2_newsletter_label_ai_content
			)
		},

		newsletterLabelPaidPartnership: async (jid: string, serverId: string | number, messageType = 'MESSAGE') => {
			return executeWMexQuery(
				{
					newsletter_id: jid,
					server_id: String(serverId),
					message_type: messageType
				},
				QueryIds.PAID_PARTNERSHIP_LABEL,
				XWAPaths.xwa2_newsletter_label_paid_partnership
			)
		},

		newsletterCreateAdminInvite: async (jid: string, userJid: string) => {
			return executeWMexQuery(
				{
					newsletter_id: jid,
					user_id: userJid
				},
				QueryIds.CREATE_ADMIN_INVITE,
				XWAPaths.xwa2_newsletter_admin_invite_create
			)
		},

		newsletterRevokeAdminInvite: async (jid: string, userJid: string) => {
			return executeWMexQuery(
				{
					newsletter_id: jid,
					user_id: userJid
				},
				QueryIds.REVOKE_ADMIN_INVITE,
				XWAPaths.xwa2_newsletter_admin_invite_revoke
			)
		},

		newsletterAcceptAdminInvite: async (jid: string) => {
			return executeWMexQuery(
				{
					newsletter_id: jid
				},
				QueryIds.ACCEPT_ADMIN_INVITE,
				XWAPaths.xwa2_newsletter_admin_invite_accept
			)
		},

		newsletterDirectoryList: async (options: NewsletterDirectoryOptions = {}) => {
			return executeWMexQuery(
				{
					fetch_status_metadata: options.fetchStatusMetadata ?? false,
					input: {
						view: options.view ?? 'RECOMMENDED',
						filters: {
							country_codes: options.countryCodes ?? [],
							categories: options.categories ?? []
						},
						limit: options.limit ?? 20,
						start_cursor: options.cursorToken
					}
				},
				QueryIds.DIRECTORY_LIST,
				XWAPaths.xwa2_newsletters_directory_list
			)
		},

		newsletterDirectorySearch: async (searchText: string, options: NewsletterDirectorySearchOptions = {}) => {
			return executeWMexQuery(
				{
					fetch_status_metadata: options.fetchStatusMetadata ?? false,
					input: {
						search_text: searchText,
						categories: options.categories ?? [],
						limit: options.limit ?? 20,
						start_cursor: options.cursorToken
					}
				},
				QueryIds.DIRECTORY_SEARCH,
				XWAPaths.xwa2_newsletters_directory_search
			)
		},

		newsletterDirectoryCategories: async (options: NewsletterDirectoryCategoriesOptions = {}) => {
			return executeWMexQuery(
				{
					fetch_status_metadata: options.fetchStatusMetadata ?? false,
					input: {
						categories: options.categories ?? [],
						country_code: options.countryCode || undefined,
						per_category_limit: options.perCategoryLimit ?? 10
					}
				},
				QueryIds.DIRECTORY_CATEGORIES,
				XWAPaths.xwa2_newsletters_directory_category_preview
			)
		},

		newsletterSendPollVote: async (
			jid: string,
			parentServerId: string | number,
			options: NewsletterPollVoteOptions
		) => {
			const names = Array.isArray(options) ? options : [options]

			const votes = names.map(name => ({
				tag: 'vote' as const,
				attrs: {},
				content: createHash('sha256').update(String(name), 'utf-8').digest()
			}))

			const messageId = generateMessageTag()

			await query({
				tag: 'message',
				attrs: {
					to: jid,
					id: messageId,
					type: 'poll',
					server_id: String(parentServerId)
				},
				content: [
					{
						tag: 'meta',
						attrs: {
							polltype: 'vote'
						}
					},
					{
						tag: 'votes',
						attrs: {},
						content: votes
					}
				]
			})

			return {
				id: messageId
			}
		},

		newsletterInsights: async (jid: string, options: NewsletterInsightsOptions = {}) => {
			return executeWMexQuery(
				{
					input: {
						newsletter_id: jid,
						metrics: options.metrics ?? ['NET_FOLLOWS', 'UNFOLLOWS']
					}
				},
				QueryIds.INSIGHTS,
				XWAPaths.xwa2_newsletter_admin_insights
			)
		},

		newsletterFollowers: async (jid: string, options: NewsletterFollowersOptions = {}) => {
			return executeWMexQuery(
				{
					input: {
						newsletter_id: jid,
						count: options.count ?? 100
					}
				},
				QueryIds.FOLLOWERS,
				XWAPaths.xwa2_newsletter_followers
			)
		},

		newsletterPendingAdminInvites: async (jid: string) => {
			return executeWMexQuery(
				{
					newsletter_id: jid
				},
				QueryIds.PENDING_ADMIN_INVITES,
				XWAPaths.pending_admin_invites
			)
		},

		newsletterQuestionResponseState: async (
			jid: string,
			serverId: string | number,
			responseServerId: string | number,
			state: NewsletterQuestionResponseState
		) => {
			return executeWMexQuery(
				{
					newsletter_id: jid,
					server_id: String(serverId),
					response_server_id: String(responseServerId),
					state
				},
				QueryIds.QUESTION_RESPONSE_STATE,
				XWAPaths.xwa2_newsletter_question_response_state_update
			)
		},

		newsletterRecommended: async (options: NewsletterRecommendedOptions = {}) => {
			return executeWMexQuery(
				{
					fetch_status_metadata: options.fetchStatusMetadata ?? false,
					input: {
						limit: options.limit ?? 20,
						country_codes: options.countryCodes ?? []
					}
				},
				QueryIds.RECOMMENDED,
				XWAPaths.xwa2_newsletters_recommended
			)
		},

		newsletterSimilar: async (jid: string, options: NewsletterSimilarOptions = {}) => {
			return executeWMexQuery(
				{
					fetch_status_metadata: options.fetchStatusMetadata ?? false,
					input: {
						newsletter_id: jid,
						limit: options.limit ?? 20,
						country_codes: options.countryCodes ?? []
					}
				},
				QueryIds.SIMILAR,
				XWAPaths.xwa2_newsletters_similar
			)
		}
	}
}

export type NewsletterSocket = ReturnType<typeof makeNewsletterSocket>
