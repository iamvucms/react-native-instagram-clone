import { postActionTypes } from '../constants'
import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
export type Post = {
    userId?: string,
    content?:string,
    uid?: number,
    isVideo?: boolean,
    likes?: string[],
    permission?: number,
    create_at?: firestore.Timestamp,
    source?: string[],
}
export type ExtraPost = Post & {
    ownUser: UserInfo
}
export type PostList = ExtraPost[]
export interface PostErrorAction {
    type: string,
    payload: {
        message: string
    }
}
export interface PostSuccessAction {
    type: string,
    payload: PostList
}
export type PostAction = PostSuccessAction | PostErrorAction
const defaultState: PostList = []
const reducer = (state: PostList = defaultState, action: PostAction): PostList => {
    switch (action.type) {
        case postActionTypes.FETCH_POST_LIST_REQUEST:
            state = [...defaultState]
            return state
        case postActionTypes.FETCH_POST_LIST_SUCCESS:
            action = <PostSuccessAction>action
            state = [...action.payload]
            return state
        case postActionTypes.FETCH_POST_LIST_FAILURE:
            action = <PostErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
        default:
            return state
    }
}
export default reducer