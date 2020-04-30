import { commentActionTypes } from '../constants'
import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
import { ExtraPost } from './postReducer'
export type Comment = {
    content?: string,
    uid?: number,
    userId?: string,
    likes?: string[],
    create_at?: firestore.Timestamp,
    replies?: Comment[]
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
    post: ExtraPost
}
export interface CommentSuccessAction<T> {
    type: string,
    payload: T
}
export type CommentAction = CommentSuccessAction<CommentExtraList>
    | CommentErrorAction
const defaultState: CommentExtraList = {
    comments: [],
    post: {}
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
        default:
            return state
    }
}
export default reducer