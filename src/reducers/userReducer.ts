import { userActionTypes } from '../constants'
import { Alert } from 'react-native'
import { Story } from './storyReducer'
import { Post } from './postReducer'
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
export interface userPayload {
    user: {
        email?: string | null,
        logined?: boolean,
        firebaseUser?: firebase.UserInfo,
        userInfo?: UserInfo
    },
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
const defaultState: userPayload = {
    user: {},
    photos: [],
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
        default:
            return state
    }
}
export default reducer