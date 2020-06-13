import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
import { Post } from './postReducer'
import { Comment } from './commentReducer'
import { Story } from './storyReducer'
export const seenTypes = {
    NOTSEEN: 0,
    SEEN: 1,
}
export const notificationTypes = {
    LIKE_MY_POST: 1,
    COMMENT_MY_POST: 2,
    REPLY_MY_COMMENT: 3,
    LIKE_MY_COMMENT: 4,
    LIKE_MY_REPLY: 5,
    FOLLOW_ME: 6,
    SOMEONE_POSTS: 7,
    SOMEONE_LIKE_SOMEONE_POST: 8,
    SOMEONE_COMMENT_SOMEONE_POST: 9
}
export const notificationActionTypes = {
    FETCH_NOTIFICATIONS_REQUEST: 'FETCH_NOTIFICATIONS_REQUEST',
    FETCH_NOTIFICATIONS_SUCCESS: 'FETCH_NOTIFICATIONS_SUCCESS',
    FETCH_NOTIFICATIONS_FAILURE: 'FETCH_NOTIFICATIONS_FAILURE',
}
export type Notification = {
    userId?: string,
    uid?: number,
    type?: number,
    froms?: string[],
    postId?: number,
    commentId?: number,
    replyId?: number,
    storyId?: number,
    create_at?: firestore.Timestamp,
    seen?: number,
}
export type ExtraNotification = Notification & {
    postInfo?: Post,
    commentInfo?: Comment,
    storyInfo?: Story,
    previewFroms?: UserInfo[],
    replyInfo?: Comment
}
export type PostingNotification = {
    isUndo?: boolean,
    userId?: string,
    type?: number,
    from?: string,
    postId?: number,
    commentId?: number,
    replyId?: number,
    storyId?: number,
    create_at?: firestore.Timestamp,
}
export type NotificationList = ExtraNotification[]
export interface NotificationErrorAction {
    type: string,
    payload: {
        message: string
    }
}
export interface NotificationSuccessAction<T> {
    type: string,
    payload: T
}
export type NotificationAction = NotificationSuccessAction<NotificationList>
    | NotificationErrorAction

const defaultState: NotificationList = []

const reducer = (state: NotificationList = defaultState, action: NotificationAction): NotificationList => {
    switch (action.type) {
        case notificationActionTypes.FETCH_NOTIFICATIONS_REQUEST:
            state = [...defaultState]
            return state
        case notificationActionTypes.FETCH_NOTIFICATIONS_SUCCESS:
            action = <NotificationSuccessAction<NotificationList>>action
            state = [...action.payload]
            return state
        case notificationActionTypes.FETCH_NOTIFICATIONS_FAILURE:
            action = <NotificationErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
        default:
            return state
    }
}
export default reducer