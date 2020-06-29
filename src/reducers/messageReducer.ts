import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
import { Post, ExtraPost } from './postReducer'
import { Comment } from './commentReducer'
import { Story } from './storyReducer'
import { ProfileX } from './profileXReducer'
export const seenTypes = {
    NOTSEEN: 0,
    SEEN: 1,
}
export const messagesTypes = {
    TEXT: 1,
    IMAGE: 2,
    SUPER_IMAGE: 3,
    POST: 4,
    ADDRESS: 5
}
export const messagesActionTypes = {
    TRIGGER_MESSAGES_LISTENER_REQUEST: 'TRIGGER_MESSAGES_LISTENER_REQUEST',
    TRIGGER_MESSAGES_LISTENER_SUCCESS: 'TRIGGER_MESSAGES_LISTENER_SUCCESS',
    TRIGGER_MESSAGES_LISTENER_FAILURE: 'TRIGGER_MESSAGES_LISTENER_FAILURE',
}
export type Message = {
    userId: string,
    uid: number,
    type: 1 | 2 | 3 | 4 | 5,
    text?: string,
    superImageId?: number,
    postId?: number,
    address_id?: number,
    seenAt?: number,
    seen: 0 | 1,
    create_at: number,
}
export type ExtraMessage = {
    messageList: Message[],
    ownUser: ProfileX
}
export type PostingMessage = {
    userId: string,
    uid: number,
    type: 1 | 2 | 3 | 4 | 5,
    text?: string,
    superImageId?: number,
    postId?: number,
    address_id?: number,
    seen: 0,
    create_at: number,
}
export type MessageList = ExtraMessage[]
export interface MessageErrorAction {
    type: string,
    payload: {
        message: string
    }
}
export interface MessageSuccessAction<T> {
    type: string,
    payload: T
}
export type MessageAction = MessageSuccessAction<MessageList>
    | MessageErrorAction

const defaultState: MessageList = []

const reducer = (state: MessageList = defaultState, action: MessageAction): MessageList => {
    switch (action.type) {
        case messagesActionTypes.TRIGGER_MESSAGES_LISTENER_REQUEST:
            state = [...defaultState]
            return state
        case messagesActionTypes.TRIGGER_MESSAGES_LISTENER_SUCCESS:
            action = <MessageSuccessAction<MessageList>>action
            state = [...action.payload]
            return state
        case messagesActionTypes.TRIGGER_MESSAGES_LISTENER_FAILURE:
            action = <MessageErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
        default:
            return state
    }
}
export default reducer