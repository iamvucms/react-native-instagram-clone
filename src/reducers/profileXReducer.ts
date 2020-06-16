import { firestore } from 'firebase'
import { DirectMessagesOptions, EmailandSMSNotificationsOptions, FollowingFollower, FromInstagramOptions, LiveIGTVOptions, PostStoryCommentOptions, PrivacyCommentOptions, PrivacyStoryOptions, PrivacyTagsOptions, SearchItem } from './userReducer'
import { Post } from './postReducer'
export const userXActionTypes = {
    FETCH_PROFILEX_SUCCESS: 'FETCH_PROFILEX_SUCCESS',
    FETCH_PROFILEX_FAILURE: 'FETCH_PROFILEX_FAILURE'
}
export interface ProfileX {
    isBlock?: boolean,
    email?: string,
    birthday?: {
        date: number,
        month: number,
        year: number
    },
    posts?: Post[],
    tagPhotos?: Post[],
    followings?: string[],
    followers?: string[],
    searchRecent?: SearchItem[],
    fullname?: string,
    phone?: string,
    username?: string,
    avatarURL?: string,
    bio?: string,
    website?: string,
    gender?: 0 | 1 | 2,
    requestedList?: string[],
    unSuggestList?: string[]
    keyword?: string[],
    notificationSetting?: {
        notificationAccounts?: {
            posts?: string[],
            story?: string[]
        },
        pauseAll?: {
            active: boolean,
            from?: firestore.Timestamp,
            duration?: number
        },
        postStoryComment?: PostStoryCommentOptions,
        followingFollowers?: FollowingFollower,
        directMessages?: DirectMessagesOptions,
        liveIGTV?: LiveIGTVOptions,
        fromInstagram?: FromInstagramOptions,
        emailAndSMSNotifications?: EmailandSMSNotificationsOptions
    }
    privacySetting?: {
        comments?: PrivacyCommentOptions,
        tags?: PrivacyTagsOptions
        activityStatus?: {
            show?: boolean
        },
        accountPrivacy?: {
            private?: boolean
        },
        blockedAccounts?: {
            blockedAccounts?: string[]
        },
        restrictedAccounts?: {
            restrictedAccounts?: string[]
        },
        mutedAccouts?: {
            posts?: string[],
            story?: string[]
        },
        closeFriends?: {
            closeFriends?: string[]
        },
        story?: PrivacyStoryOptions
    },
    postNotificationList?: string[]
    storyNotificationList?: string[]
}
export interface ErrorAction {
    type: string,
    payload: {
        message: string
    }
}
export interface SuccessAction<T> {
    type: string,
    payload: T
}
export type userXAction = SuccessAction<ProfileX> | ErrorAction
export const defaultUserState: ProfileX = {

}
const reducer = (state: ProfileX = defaultUserState, action: userXAction): ProfileX => {
    switch (action.type) {
        case userXActionTypes.FETCH_PROFILEX_SUCCESS:
            action = <SuccessAction<ProfileX>>action
            state = { ...action.payload }
            return state
        default:
            return state
    }
}
export default reducer