import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
import { Comment } from './commentReducer'
import { ProcessedImage } from '../screens/Home/Account/GalleryChooser'
import { MapBoxAddress } from '../utils'
export const LIMIT_POSTS_PER_LOADING = 2
export const postActionTypes = {
    FETCH_POST_LIST_REQUEST: 'FETCH_POST_LIST_REQUEST',
    FETCH_POST_LIST_SUCCESS: 'FETCH_POST_LIST_SUCCESS',
    FETCH_POST_LIST_FAILURE: 'FETCH_POST_LIST_FAILURE',
    LOAD_MORE_POST_LIST_REQUEST: 'LOAD_MORE_POST_LIST_REQUEST',
    LOAD_MORE_POST_LIST_SUCCESS: 'LOAD_MORE_POST_LIST_SUCCESS',
    LOAD_MORE_POST_LIST_FAILURE: 'LOAD_MORE_POST_LIST_FAILURE',
    COMMENT_POST_REQUEST: 'COMMENT_POST_REQUEST',
    COMMENT_POST_SUCCESS: 'COMMENT_POST_SUCCESS',
    COMMENT_POST_FAILURE: 'COMMENT_POST_FAILURE',
    TOGGLE_LIKE_POST_REQUEST: 'TOGGLE_LIKE_POST_REQUEST',
    TOGGLE_LIKE_POST_SUCCESS: 'TOGGLE_LIKE_POST_SUCCESS',
    TOGGLE_LIKE_POST_FAILURE: 'TOGGLE_LIKE_POST_FAILURE',
    CREATE_POST_FAILURE: 'UPDATE_POST_FAILURE',
    UPDATE_POST_REQUEST: 'UPDATE_POST_REQUEST',
    UPDATE_POST_SUCCESS: 'UPDATE_POST_SUCCESS',
    UPDATE_POST_FAILURE: 'UPDATE_POST_FAILURE',
}
export type PostImage = {
    uri: string,
    width: number,
    height: number,
    extension: string,
    fullSize: boolean,
    tags: {
        x: number,
        y: number,
        width: number,
        height: number,
        username: string
    }[]
}
export type Post = {
    userId?: string,
    content?: string,
    uid?: number,
    isVideo?: boolean,
    likes?: string[],
    commentList?: string[],
    permission?: number,
    create_at?: firestore.Timestamp,
    source?: PostImage[],
    comments?: Comment[],
    tags?: string[],
    labels?: string[],
    tagUsername?: string[],
    notificationUsers?: string[],
    altText?: string,
    address?: MapBoxAddress,
    hashtags?: string[]
}
export type ExtraPost = Post & {
    ownUser?: UserInfo
}
export type PostList = ExtraPost[]
export interface PostErrorAction {
    type: string,
    payload: {
        message: string
    }
}
export interface PostSuccessAction<T> {
    type: string,
    payload: T
}
export type PostAction = PostSuccessAction<PostList>
    | PostSuccessAction<ExtraPost>
    | PostErrorAction
    | PostSuccessAction<Post>
const defaultState: PostList = []
const reducer = (state: PostList = defaultState, action: PostAction): PostList => {
    switch (action.type) {
        case postActionTypes.FETCH_POST_LIST_REQUEST:
            state = [...defaultState]
            return state
        case postActionTypes.FETCH_POST_LIST_SUCCESS:
            action = <PostSuccessAction<PostList>>action
            state = [...action.payload]
            return state
        case postActionTypes.FETCH_POST_LIST_FAILURE:
            action = <PostErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
        case postActionTypes.LOAD_MORE_POST_LIST_REQUEST:
            state = [...defaultState]
            return state
        case postActionTypes.LOAD_MORE_POST_LIST_SUCCESS:
            action = <PostSuccessAction<PostList>>action
            const newPostList = state.concat(action.payload)
            state = [...newPostList]
            return state
        case postActionTypes.LOAD_MORE_POST_LIST_FAILURE:
            action = <PostErrorAction>action
            const message2 = action.payload.message
            Alert.alert('Error', message2)
            return state
        case postActionTypes.COMMENT_POST_REQUEST:
            return state
        case postActionTypes.COMMENT_POST_SUCCESS:
            action = <PostSuccessAction<PostList>>action
            state = [...action.payload]
            return state
        case postActionTypes.COMMENT_POST_FAILURE:
            action = <PostErrorAction>action
            const message3 = action.payload.message
            Alert.alert('Error', message3)
            return state
        case postActionTypes.TOGGLE_LIKE_POST_REQUEST:
            return state
        case postActionTypes.TOGGLE_LIKE_POST_SUCCESS:
            action = <PostSuccessAction<PostList>>action
            state = [...action.payload]
            return state
        case postActionTypes.TOGGLE_LIKE_POST_FAILURE:
            action = <PostErrorAction>action
            const message4 = action.payload.message
            Alert.alert('Error', message4)
            return state
        case postActionTypes.UPDATE_POST_REQUEST:
            return state
        case postActionTypes.UPDATE_POST_SUCCESS:
            action = <PostSuccessAction<ExtraPost>>action
            const updatedPost = action.payload
            const postList = state.map(post => {
                if (post.uid === updatedPost.uid) {
                    return { ...updatedPost }
                }
                return post
            })
            state = [...postList]
            return state
        case postActionTypes.UPDATE_POST_FAILURE:
            action = <PostErrorAction>action
            Alert.alert('Error', action.payload.message)
            return state
        default:
            return state
    }
}
export default reducer