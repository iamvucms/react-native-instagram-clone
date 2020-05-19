import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
import { ExtraPost } from './postReducer'
export const LIMIT_COMMENTS_PER_LOADING = 5
export const commentActionTypes = {
    FETCH_COMMENTS_REQUEST: 'FETCH_COMMENTS_REQUEST',
    FETCH_COMMENTS_SUCCESS: 'FETCH_COMMENTS_SUCCESS',
    FETCH_COMMENTS_FAILURE: 'FETCH_COMMENTS_FAILURE',
    LOAD_MORE_COMMENTS_REQUEST: 'LOAD_MORE_COMMENTS_REQUEST',
    LOAD_MORE_COMMENTS_SUCCESS: 'LOAD_MORE_COMMENTS_SUCCESS',
    LOAD_MORE_COMMENTS_FAILURE: 'LOAD_MORE_COMMENTS_FAILURE',
    TOGGLE_LIKE_COMMENT_REQUEST: 'TOGGLE_LIKE_COMMENT_REQUEST',
    TOGGLE_LIKE_COMMENT_SUCCESS: 'TOGGLE_LIKE_COMMENT_SUCCESS',
    TOGGLE_LIKE_COMMENT_FAILURE: 'TOGGLE_LIKE_COMMENT_FAILURE',
    TOGGLE_LIKE_REPLY_REQUEST: 'TOGGLE_LIKE_REPLY_REQUEST',
    TOGGLE_LIKE_REPLY_SUCCESS: 'TOGGLE_LIKE_REPLY_SUCCESS',
    TOGGLE_LIKE_REPLY_FAILURE: 'TOGGLE_LIKE_REPLY_FAILURE',
    REPLY_COMMENT_REQUEST: 'REPLY_COMMENT_REQUEST',
    REPLY_COMMENT_SUCCESS: 'REPLY_COMMENT_SUCCESS',
    REPLY_COMMENT_FAILURE: 'REPLY_COMMENT_FAILURE',
}
export type Comment = {
    content?: string,
    uid?: number,
    userId?: string,
    likes?: string[],
    create_at?: firestore.Timestamp,
    replies?: ExtraComment[]
}
export type ExtraComment = Comment & {
    ownUser?: UserInfo
}
export type CommentList = ExtraComment[]
export interface CommentErrorAction {
    type: string,
    payload: {
        message: string
    }
}
export type CommentExtraList = {
    comments: CommentList,
    post: ExtraPost,
    scrollDown?: boolean
}
export interface CommentSuccessAction<T> {
    type: string,
    payload: T
}
export type CommentListWithScroll = {
    comments: CommentList,
    scrollDown: boolean
}
export type CommentAction = CommentSuccessAction<CommentExtraList>
    | CommentErrorAction | CommentSuccessAction<CommentListWithScroll>
const defaultState: CommentExtraList = {
    comments: [],
    post: {},
    scrollDown: false
}
const reducer = (state: CommentExtraList = defaultState, action: CommentAction): CommentExtraList => {
    switch (action.type) {
        case commentActionTypes.FETCH_COMMENTS_REQUEST:
            state = { ...defaultState }
            return state
        case commentActionTypes.FETCH_COMMENTS_SUCCESS:
            action = <CommentSuccessAction<CommentExtraList>>action
            state = { ...action.payload }
            return state
        case commentActionTypes.FETCH_COMMENTS_FAILURE:
            action = <CommentErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
        case commentActionTypes.LOAD_MORE_COMMENTS_REQUEST:
            state = { ...defaultState }
            return state
        case commentActionTypes.LOAD_MORE_COMMENTS_SUCCESS:
            action = <CommentSuccessAction<CommentListWithScroll>>action
            state = {
                ...state, comments: [...state.comments,
                ...action.payload.comments],
                scrollDown: action.payload.scrollDown || false
            }
            return state
        case commentActionTypes.LOAD_MORE_COMMENTS_FAILURE:
            action = <CommentErrorAction>action
            const message2 = action.payload.message
            Alert.alert('Error', message2)
            return state
        case commentActionTypes.TOGGLE_LIKE_COMMENT_REQUEST:
            state = state
            return state
        case commentActionTypes.TOGGLE_LIKE_COMMENT_SUCCESS:
            action = <CommentSuccessAction<CommentListWithScroll>>action
            state = {
                ...state, comments: [...action.payload.comments]
            }
            return state
        case commentActionTypes.TOGGLE_LIKE_COMMENT_FAILURE:
            action = <CommentErrorAction>action
            const message3 = action.payload.message
            Alert.alert('Error', message3)
            return state
        case commentActionTypes.TOGGLE_LIKE_REPLY_REQUEST:
            state = state
            return state
        case commentActionTypes.TOGGLE_LIKE_REPLY_SUCCESS:
            action = <CommentSuccessAction<CommentListWithScroll>>action
            state = {
                ...state, comments: [...action.payload.comments]
            }
            return state
        case commentActionTypes.TOGGLE_LIKE_REPLY_FAILURE:
            action = <CommentErrorAction>action
            const message4 = action.payload.message
            Alert.alert('Error', message4)
            return state
        case commentActionTypes.REPLY_COMMENT_REQUEST:
            state = state
            return state
        case commentActionTypes.REPLY_COMMENT_SUCCESS:
            action = <CommentSuccessAction<CommentListWithScroll>>action
            state = {
                ...state, comments: [...action.payload.comments]
            }
            return state
        case commentActionTypes.REPLY_COMMENT_FAILURE:
            action = <CommentErrorAction>action
            const message5 = action.payload.message
            Alert.alert('Error', message5)
            return state
        default:
            return state
    }
}
export default reducer