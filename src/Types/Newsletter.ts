export enum XWAPaths {
	xwa2_newsletter_create = 'xwa2_newsletter_create',
	xwa2_newsletter_subscribers = 'xwa2_newsletter_subscribers',
	xwa2_newsletter_subscribed = 'xwa2_newsletter_subscribed',
	xwa2_newsletter_view = 'xwa2_newsletter_view',
	xwa2_newsletter_metadata = 'xwa2_newsletter',
	xwa2_newsletter_admin_count = 'xwa2_newsletter_admin',
	xwa2_newsletter_mute_v2 = 'xwa2_newsletter_mute_v2',
	xwa2_newsletter_unmute_v2 = 'xwa2_newsletter_unmute_v2',
	xwa2_newsletter_follow = 'xwa2_newsletter_follow',
	xwa2_newsletter_unfollow = 'xwa2_newsletter_unfollow',
	xwa2_newsletter_join_v2 = 'xwa2_newsletter_join_v2',
	xwa2_newsletter_leave_v2 = 'xwa2_newsletter_leave_v2',
	xwa2_newsletter_change_owner = 'xwa2_newsletter_change_owner',
	xwa2_newsletter_demote = 'xwa2_newsletter_demote',
	xwa2_newsletter_delete_v2 = 'xwa2_newsletter_delete_v2',
	xwa2_fetch_account_reachout_timelock = 'xwa2_fetch_account_reachout_timelock',
	xwa2_message_capping_info = 'xwa2_message_capping_info',

	xwa2_newsletter_admin_capabilities = 'xwa2_newsletter_admin',
	admin_profile = 'admin_profile',
	voter_list = 'voter_list',
	xwa2_newsletters_reaction_sender_list = 'xwa2_newsletters_reaction_sender_list',
	xwa2_newsletter_pin_messages = 'xwa2_newsletter_pin_messages',
	xwa2_newsletter_unpin_messages = 'xwa2_newsletter_unpin_messages',
	xwa2_newsletter_label_ai_content = 'xwa2_newsletter_label_ai_content',
	xwa2_newsletter_label_paid_partnership = 'xwa2_newsletter_label_paid_partnership',
	xwa2_newsletter_admin_invite_create = 'xwa2_newsletter_admin_invite_create',
	xwa2_newsletter_admin_invite_revoke = 'xwa2_newsletter_admin_invite_revoke',
	xwa2_newsletter_admin_invite_accept = 'xwa2_newsletter_admin_invite_accept',
	xwa2_newsletters_recommended = 'xwa2_newsletters_recommended',
	xwa2_newsletters_similar = 'xwa2_newsletters_similar',
	xwa2_username_get = 'xwa2_username_get',
	xwa2_username_set = 'xwa2_username_set',
	xwa2_username_pin_set = 'xwa2_username_pin_set',
	xwa2_update_text_status = 'xwa2_update_text_status',
	xwa2_text_status_list = 'xwa2_text_status_list',
	xwa2_users_updates_since = 'xwa2_users_updates_since',
	xwa2_newsletter_link_preview = 'xwa2_newsletter_link_preview',
	xwa2_newsletter_admin_insights = 'xwa2_newsletter_admin_insights',
	xwa2_newsletter_followers = 'xwa2_newsletter_followers',
	pending_admin_invites = 'pending_admin_invites',
	xwa2_newsletter_question_response_state_update = 'xwa2_newsletter_question_response_state_update',
	xwa2_username_check = 'xwa2_username_check',
	xwa2_newsletters_directory_list = 'xwa2_newsletters_directory_list',
	xwa2_newsletters_directory_search = 'xwa2_newsletters_directory_search',
	xwa2_newsletters_directory_category_preview = 'xwa2_newsletters_directory_category_preview'
}

export enum QueryIds {
	CREATE = '8823471724422422',
	UPDATE_METADATA = '24250201037901610',
	METADATA = '6563316087068696',
	SUBSCRIBERS = '9783111038412085',
	SUBSCRIBED = '6388546374527196',
	FOLLOW = '24404358912487870',
	UNFOLLOW = '9767147403369991',
	MUTE = '29766401636284406',
	UNMUTE = '9864994326891137',
	ADMIN_COUNT = '7130823597031706',
	CHANGE_OWNER = '7341777602580933',
	DEMOTE = '6551828931592903',
	DELETE = '30062808666639665',
	REACHOUT_TIMELOCK = '23983697327930364',
	MESSAGE_CAPPING_INFO = '24503548349331633',

	ADMIN_CAPABILITIES = '9801384413216421',
	ADMIN_INFO = '26278439461859188',
	DEHYDRATED = '26944199458535748',
	POLL_VOTERS = '9407762219322536',
	REACTION_SENDER_LIST = '29575462448733991',
	PIN_MESSAGES = '27165709459706559',
	UNPIN_MESSAGES = '28007176042216937',
	LABEL_AI_CONTENT = '27909718265289596',
	PAID_PARTNERSHIP_LABEL = '26102375079404865',
	CREATE_ADMIN_INVITE = '9387141988078609',
	REVOKE_ADMIN_INVITE = '9656078347839416',
	ACCEPT_ADMIN_INVITE = '9580828702035549',
	RECOMMENDED = '25806748772361516',
	SIMILAR = '26217043484590756',
	USERNAME_GET = '25347099718279209',
	USERNAME_SET = '25757341163897635',
	USERNAME_PIN_SET = '9749436995157074',
	UPDATE_TEXT_STATUS = '9152604461510864',
	TEXT_STATUS_LIST = '24072923595647473',
	ABOUT_STATUS = '24535500086059408',
	PLAINTEXT_LINK_PREVIEW = '9101130456653613',
	INSIGHTS = '9853618868050977',
	FOLLOWERS = '27472091235714801',
	PENDING_ADMIN_INVITES = '9783111038412085',
	QUESTION_RESPONSE_STATE = '24636260219323456',
	USERNAME_CHECK = '26122779627399568',
	DIRECTORY_LIST = '26125047313831973',
	DIRECTORY_SEARCH = '26301059626252132',
	DIRECTORY_CATEGORIES = '35266481849605779'
}

export type NewsletterUpdate = {
	name?: string
	description?: string
	picture?: string
}

export interface NewsletterCreateResponse {
	id: string
	state: {
		type: string
	}
	thread_metadata: {
		creation_time: string
		description: {
			id: string
			text: string
			update_time: string
		}
		handle: string | null
		invite: string
		name: {
			id: string
			text: string
			update_time: string
		}
		picture: {
			direct_path: string
			id: string
			type: string
		}
		preview: {
			direct_path: string
			id: string
			type: string
		}
		subscribers_count: string
		verification: 'VERIFIED' | 'UNVERIFIED'
	}
	viewer_metadata: {
		mute: 'ON' | 'OFF'
		role: NewsletterViewRole
	}
}

export type NewsletterViewRole = 'ADMIN' | 'GUEST' | 'OWNER' | 'SUBSCRIBER'

export interface NewsletterMetadata {
	id: string
	owner?: string
	name: string
	description?: string
	invite?: string
	creation_time?: number
	subscribers?: number
	picture?: {
		url?: string
		directPath?: string
		mediaKey?: string
		id?: string
	}
	verification?: 'VERIFIED' | 'UNVERIFIED'
	reaction_codes?: {
		code: string
		count: number
	}[]
	mute_state?: 'ON' | 'OFF'
	thread_metadata?: {
		creation_time?: number
		name?: string
		description?: string
	}
}

export interface NewsletterAdminCapabilities {
	can_create_admin_invite?: boolean
	can_revoke_admin_invite?: boolean
	can_accept_admin_invite?: boolean
	can_change_owner?: boolean
	can_demote?: boolean
	can_delete?: boolean
	can_pin_messages?: boolean
	can_unpin_messages?: boolean
	can_label_ai_content?: boolean
	can_label_paid_partnership?: boolean
	[key: string]: unknown
}

export interface NewsletterAdminInfo {
	id?: string
	jid?: string
	role?: NewsletterViewRole
	is_admin?: boolean
	is_owner?: boolean
	[key: string]: unknown
}

export interface NewsletterPollVoterOptions {
	limit?: number
	voteHash?: string
}

export interface NewsletterReactionSender {
	user_jid?: string
	jid?: string
	name?: string
	[key: string]: unknown
}

export interface NewsletterDirectoryOptions {
	fetchStatusMetadata?: boolean
	view?: string
	countryCodes?: string[]
	categories?: string[]
	limit?: number
	cursorToken?: string
}

export interface NewsletterDirectorySearchOptions {
	fetchStatusMetadata?: boolean
	categories?: string[]
	limit?: number
	cursorToken?: string
}

export interface NewsletterDirectoryCategoriesOptions {
	fetchStatusMetadata?: boolean
	categories?: string[]
	countryCode?: string
	perCategoryLimit?: number
}

export interface NewsletterInsightsOptions {
	metrics?: string[]
}

export interface NewsletterFollowersOptions {
	count?: number
}

export interface NewsletterRecommendedOptions {
	fetchStatusMetadata?: boolean
	limit?: number
	countryCodes?: string[]
}

export interface NewsletterSimilarOptions {
	fetchStatusMetadata?: boolean
	limit?: number
	countryCodes?: string[]
}

export type NewsletterPollVoteOptions = string | string[]

export type NewsletterQuestionResponseState = string
