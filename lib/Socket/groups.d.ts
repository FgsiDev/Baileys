export function makeGroupsSocket(config: any): {
    groupQuery: (jid: any, type: any, content: any) => Promise<any>;
    groupMetadata: (jid: any) => Promise<{
        desc: any;
        descId: any;
        descOwner: string | undefined;
        descOwnerLid: string | undefined;
        descTime: number | undefined;
        linkedParent: any;
        restrict: boolean;
        announce: boolean;
        isCommunity: boolean;
        isCommunityAnnounce: boolean;
        joinApprovalMode: boolean;
        memberAddMode: boolean;
        participants: any;
        ephemeralDuration: number | undefined;
        ownerLid?: string | undefined;
        subjectTime: number | undefined;
        size: any;
        creation: number | undefined;
        owner: string;
        subjectOwnerLid?: string | undefined;
        id: any;
        addressingMode: any;
        subject: any;
        subjectOwner: string;
    }>;
    groupCreate: (subject: any, participants: any) => Promise<{
        desc: any;
        descId: any;
        descOwner: string | undefined;
        descOwnerLid: string | undefined;
        descTime: number | undefined;
        linkedParent: any;
        restrict: boolean;
        announce: boolean;
        isCommunity: boolean;
        isCommunityAnnounce: boolean;
        joinApprovalMode: boolean;
        memberAddMode: boolean;
        participants: any;
        ephemeralDuration: number | undefined;
        ownerLid?: string | undefined;
        subjectTime: number | undefined;
        size: any;
        creation: number | undefined;
        owner: string;
        subjectOwnerLid?: string | undefined;
        id: any;
        addressingMode: any;
        subject: any;
        subjectOwner: string;
    }>;
    groupLeave: (id: any) => Promise<void>;
    groupUpdateSubject: (jid: any, subject: any) => Promise<void>;
    groupRequestParticipantsList: (jid: any) => Promise<any>;
    groupRequestParticipantsUpdate: (jid: any, participants: any, action: any) => Promise<any>;
    groupParticipantsUpdate: (jid: any, participants: any, action: any) => Promise<any>;
    groupUpdateDescription: (jid: any, description: any) => Promise<void>;
    groupInviteCode: (jid: any) => Promise<any>;
    groupRevokeInvite: (jid: any) => Promise<any>;
    groupAcceptInvite: (code: any) => Promise<any>;
    /**
     * revoke a v4 invite for someone
     * @param groupJid group jid
     * @param invitedJid jid of person you invited
     * @returns true if successful
     */
    groupRevokeInviteV4: (groupJid: any, invitedJid: any) => Promise<boolean>;
    /**
     * accept a GroupInviteMessage
     * @param key the key of the invite message, or optionally only provide the jid of the person who sent the invite
     * @param inviteMessage the message to accept
     */
    groupAcceptInviteV4: (...args: any[]) => Promise<any>;
    groupGetInviteInfo: (code: any) => Promise<{
        desc: any;
        descId: any;
        descOwner: string | undefined;
        descOwnerLid: string | undefined;
        descTime: number | undefined;
        linkedParent: any;
        restrict: boolean;
        announce: boolean;
        isCommunity: boolean;
        isCommunityAnnounce: boolean;
        joinApprovalMode: boolean;
        memberAddMode: boolean;
        participants: any;
        ephemeralDuration: number | undefined;
        ownerLid?: string | undefined;
        subjectTime: number | undefined;
        size: any;
        creation: number | undefined;
        owner: string;
        subjectOwnerLid?: string | undefined;
        id: any;
        addressingMode: any;
        subject: any;
        subjectOwner: string;
    }>;
    groupToggleEphemeral: (jid: any, ephemeralExpiration: any) => Promise<void>;
    groupSettingUpdate: (jid: any, setting: any) => Promise<void>;
    groupMemberAddMode: (jid: any, mode: any) => Promise<void>;
    groupJoinApprovalMode: (jid: any, mode: any) => Promise<void>;
    groupFetchAllParticipating: () => Promise<{}>;
    fileName: string;
    getBotListV2: () => Promise<{
        jid: any;
        personaId: any;
    }[]>;
    processingMutex: {
        mutex(code: any): Promise<void>;
    };
    fetchPrivacySettings: (force?: boolean) => Promise<any>;
    upsertMessage: (...args: any[]) => Promise<any>;
    appPatch: (patchCreate: any) => Promise<void>;
    sendPresenceUpdate: (type: any, toJid: any) => Promise<void>;
    presenceSubscribe: (toJid: any, tcToken: any) => any;
    profilePictureUrl: (jid: any, type: string | undefined, timeoutMs: any) => Promise<any>;
    onWhatsApp: (...jids: any[]) => Promise<any>;
    fetchBlocklist: () => Promise<any>;
    fetchStatus: (...jids: any[]) => Promise<any>;
    fetchDisappearingDuration: (...jids: any[]) => Promise<any>;
    fetchLidByJids: (...jids: any[]) => Promise<any>;
    updateProfilePicture: (jid: any, content: any) => Promise<void>;
    removeProfilePicture: (jid: any) => Promise<void>;
    updateProfileStatus: (status: any) => Promise<void>;
    updateProfileName: (name: any) => Promise<void>;
    updateBlockStatus: (jid: any, action: any) => Promise<void>;
    updateCallPrivacy: (value: any) => Promise<void>;
    updateMessagesPrivacy: (value: any) => Promise<void>;
    updateLastSeenPrivacy: (value: any) => Promise<void>;
    updateOnlinePrivacy: (value: any) => Promise<void>;
    updateProfilePicturePrivacy: (value: any) => Promise<void>;
    updateStatusPrivacy: (value: any) => Promise<void>;
    updateReadReceiptsPrivacy: (value: any) => Promise<void>;
    updateGroupsAddPrivacy: (value: any) => Promise<void>;
    updateDefaultDisappearingMode: (duration: any) => Promise<void>;
    getBusinessProfile: (jid: any) => Promise<{
        wid: any;
        address: any;
        description: any;
        website: any[];
        email: any;
        category: any;
        business_hours: {
            timezone: any;
            business_config: any;
        };
    } | undefined>;
    resyncAppState: (...args: any[]) => Promise<any>;
    chatModify: (mod: any, jid: any) => Promise<void>;
    cleanDirtyBits: (type: any, fromTimestamp: any) => Promise<void>;
    addLabel: (jid: any, labels: any) => Promise<void>;
    addChatLabel: (jid: any, labelId: any) => Promise<void>;
    removeChatLabel: (jid: any, labelId: any) => Promise<void>;
    addMessageLabel: (jid: any, messageId: any, labelId: any) => Promise<void>;
    removeMessageLabel: (jid: any, messageId: any, labelId: any) => Promise<void>;
    star: (jid: any, messages: any, star: any) => Promise<void>;
    executeUSyncQuery: (usyncQuery: any) => Promise<any>;
    ws: import("./Client").WebSocketClient;
    ev: {
        process(handler: any): () => void;
        emit(event: any, evData: any): any;
        isBuffering(): boolean;
        buffer: () => void;
        flush: (force?: boolean) => boolean;
        createBufferedFunction(work: any): (...args: any[]) => Promise<any>;
        on: (...args: any[]) => any;
        off: (...args: any[]) => any;
        removeAllListeners: (...args: any[]) => any;
    };
};
export function extractGroupMetadata(result: any): {
    desc: any;
    descId: any;
    descOwner: string | undefined;
    descOwnerLid: string | undefined;
    descTime: number | undefined;
    linkedParent: any;
    restrict: boolean;
    announce: boolean;
    isCommunity: boolean;
    isCommunityAnnounce: boolean;
    joinApprovalMode: boolean;
    memberAddMode: boolean;
    participants: any;
    ephemeralDuration: number | undefined;
    ownerLid?: string | undefined;
    subjectTime: number | undefined;
    size: any;
    creation: number | undefined;
    owner: string;
    subjectOwnerLid?: string | undefined;
    id: any;
    addressingMode: any;
    subject: any;
    subjectOwner: string;
};
