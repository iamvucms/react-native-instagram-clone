import { Alert } from 'react-native'
import { Story } from './storyReducer'
import { Post } from './postReducer'
import { firestore } from 'firebase'
export const userActionTypes = {
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    REGISTER_REQUEST: 'REGISTER_REQUEST',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    FETCH_EXTRA_INFO_REQUEST: 'FETCH_EXTRA_INFO_REQUEST',
    FETCH_EXTRA_INFO_SUCCESS: 'FETCH_EXTRA_INFO_SUCCESS',
    FETCH_EXTRA_INFO_FAILURE: 'FETCH_EXTRA_INFO_FAILURE',
    UNFOLLOW_REQUEST: 'UNFOLLOW_REQUEST',
    UNFOLLOW_SUCCESS: 'UNFOLLOW_SUCCESS',
    UNFOLLOW_FAILURE: 'UNFOLLOW_FAILURE',
    FOLLOW_REQUEST: 'FOLLOW_REQUEST',
    FOLLOW_SUCCESS: 'FOLLOW_SUCCESS',
    FOLLOW_FAILURE: 'FOLLOW_FAILURE',
    UPDATE_NOTIFICATION_SETTING_REQUEST: 'UPDATE_NOTIFICATION_SETTING_REQUEST',
    UPDATE_NOTIFICATION_SETTING_SUCCESS: 'UPDATE_NOTIFICATION_SETTING_SUCCESS',
    UPDATE_NOTIFICATION_SETTING_FAILURE: 'UPDATE_NOTIFICATION_SETTING_FAILURE'
}
export type UserInfo = {
    email?: string,
    birthday?: {
        date: number,
        month: number,
        year: number
    },
    followings?: string[],
    fullname?: string,
    phone?: string,
    username?: string,
    avatarURL?: string,
    bio?: string
}
export type ExtraInfo = {
    posts: number,
    followers: string[],
    followings: string[],
}
export type NotificationProperties = 'directMessages'
    | 'postStoryComment' | 'followingFollowers'
export type NotificationLevel = 0 | 1 | 2
export type PostStoryCommentOptions = {
    likes?: NotificationLevel,
    likesAndCommentOnPhotoOfYou?: NotificationLevel,
    photosOfYou?: NotificationLevel,
    comments?: NotificationLevel,
    commentsAndPins?: NotificationLevel,
    firstPostsAndStories?: NotificationLevel,
}
export type DirectMessagesOptions = {
    messageRequests?: NotificationLevel,
    messages?: NotificationLevel,
    groupRequest?: NotificationLevel,
    videoChats?: NotificationLevel,
}
export type FollowingFollower = {
    followerRequest?: NotificationLevel,
    acceptedFollowRequest?: NotificationLevel,
    friendsOnInstagram?: NotificationLevel,
    mentionsInBio?: NotificationLevel,
    recommendationsForOthers?: NotificationLevel,
    recommendationsFromOthers?: NotificationLevel,
}
export type NotificationSetting = {
    pauseAll?: {
        active: boolean,
        from?: firestore.Timestamp,
        duration?: number
    },
    postStoryComment?: PostStoryCommentOptions,
    followingFollowers?: FollowingFollower,
    directMessages?: DirectMessagesOptions
}
export type UserSetting = {
    notification?: NotificationSetting
}
export interface userPayload {
    user: {
        email?: string | null,
        logined?: boolean,
        firebaseUser?: firebase.UserInfo,
        userInfo?: UserInfo
    },
    setting?: UserSetting,
    photos?: Post[],
    currentStory?: Story[],
    extraInfo?: ExtraInfo
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
export type ExtraInfoPayload = {
    photos: Post[],
    currentStory: Story[],
    extraInfo: ExtraInfo
}
export type userAction = SuccessAction<userPayload> | ErrorAction
    | SuccessAction<UserInfo> | SuccessAction<ExtraInfoPayload>
    | SuccessAction<NotificationSetting>
const defaultState: userPayload = {
    user: {},
    photos: [],
    setting: {
        notification: {
            pauseAll: {
                active: false,
            },
            postStoryComment: {
                likes: 2,
                likesAndCommentOnPhotoOfYou: 2,
                photosOfYou: 1,
                comments: 2,
                commentsAndPins: 1,
                firstPostsAndStories: 1
            },
            followingFollowers: {
                followerRequest: 1,
                acceptedFollowRequest: 1,
                friendsOnInstagram: 1,
                mentionsInBio: 1,
                recommendationsForOthers: 1,
                recommendationsFromOthers: 1
            },
            directMessages: {
                messageRequests: 1,
                messages: 1,
                groupRequest: 1,
                videoChats: 2
            }
        }
    },
    extraInfo: {
        posts: 0,
        followers: [],
        followings: []
    },
    currentStory: []
}
const reducer = (state: userPayload = defaultState, action: userAction): userPayload => {
    switch (action.type) {
        case userActionTypes.LOGIN_REQUEST:
            state = { ...state, user: {} }
            return state
        case userActionTypes.LOGIN_SUCCESS:
            action = <SuccessAction<userPayload>>action
            state = { ...state, user: { ...action.payload.user } }
            return state
        case userActionTypes.LOGIN_FAILURE:
            action = <ErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
        case userActionTypes.REGISTER_REQUEST:
            state = { ...state, user: {} }
            return state
        case userActionTypes.REGISTER_SUCCESS:
            action = <SuccessAction<userPayload>>action
            state = { ...state, user: { ...action.payload.user } }
            return state
        case userActionTypes.REGISTER_FAILURE:
            action = <ErrorAction>action
            const message2 = action.payload.message
            Alert.alert('Error', message2)
            return state
        case userActionTypes.UNFOLLOW_REQUEST:
            state = { ...state, user: {} }
            return state
        case userActionTypes.UNFOLLOW_SUCCESS:
            action = <SuccessAction<UserInfo>>action
            state = { ...state, user: { userInfo: { ...action.payload }, ...state.user } }
            return state
        case userActionTypes.UNFOLLOW_FAILURE:
            action = <ErrorAction>action
            const message3 = action.payload.message
            Alert.alert('Error', message3)
            return state
        case userActionTypes.FOLLOW_REQUEST:
            state = { ...state, user: {} }
            return state
        case userActionTypes.FOLLOW_SUCCESS:
            action = <SuccessAction<UserInfo>>action
            state = { ...state, user: { userInfo: { ...action.payload }, ...state.user } }
            return state
        case userActionTypes.FOLLOW_FAILURE:
            action = <ErrorAction>action
            Alert.alert('Error', action.payload.message)
            return state
        case userActionTypes.FETCH_EXTRA_INFO_REQUEST:
            state = { ...state }
            return state
        case userActionTypes.FETCH_EXTRA_INFO_SUCCESS:
            action = <SuccessAction<ExtraInfoPayload>>action
            state = {
                ...state, currentStory: [...action.payload.currentStory],
                extraInfo: { ...action.payload.extraInfo },
                photos: [...action.payload.photos]
            }
            return state
        case userActionTypes.FETCH_EXTRA_INFO_FAILURE:
            action = <ErrorAction>action
            const message4 = action.payload.message
            Alert.alert('Error', message4)
            return state
        case userActionTypes.UPDATE_NOTIFICATION_SETTING_REQUEST:
            state = { ...state }
            return state
        case userActionTypes.UPDATE_NOTIFICATION_SETTING_SUCCESS:
            action = <SuccessAction<NotificationSetting>>action
            state = {
                ...state,
                setting: {
                    ...state.setting,
                    notification: {
                        ...state.setting?.notification,
                        ...action.payload
                    }
                }
            }
            return state
        case userActionTypes.UPDATE_NOTIFICATION_SETTING_FAILURE:
            action = <ErrorAction>action
            Alert.alert('Error', action.payload.message)
            return state
        default:
            return state
    }
}
export default reducer