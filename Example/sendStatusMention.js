>> const {
	// STORIES_JID,
	generateWAMessage,
	generateWAMessageFromContent
} = require('baileys')

const sendStatusMention = async (content, jids) => {
	jids = jids.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')
	const media = await generateWAMessage(
		STORIES_JID,
		content,
		{ upload: conn.waUploadToServer }
	)
	
	const additionalNodes = [{
		tag: 'meta',
		attrs: {},
		content: [{
			tag: 'mentioned_users',
			attrs: {},
			content: jids.map(jid => ({
				tag: 'to',
				attrs: { jid },
				content: undefined
			}))
		}]
	}]
	
	await conn.relayMessage(
		STORIES_JID,
		media.message,
		{
			messageId: media.key.id,
			statusJidList: [conn.user.jid, ...jids],
			additionalNodes
		}
	)
	
	await Promise.all(jids.map(async (jid) => {
		const msg = await generateWAMessageFromContent(
			jid,
			{
				statusMentionMessage: {
					message: {
						protocolMessage: {
							key: media.key,
							type: 25
						}
					}
				}
			},
			{}
		)
		
		await conn.relayMessage(
			jid,
			msg.message,
			{
				additionalNodes: [{
					tag: 'meta',
					attrs: { is_status_mention: 'true' },
					content: undefined
				}]
			}
		)
	}))
	
	return media
}

// example
return sendStatusMention(
	{
		image: { url: "https://files.catbox.moe/g4if44.jpg" },
		caption: 'does this work?'
	},
	['+55 21 99540-0244', '+55 83 9662-4241']
)