import { Alert } from 'react-native'
import { ProfileX } from './profileXReducer'
export const seenTypes = {
    NOTSEEN: 0,
    SEEN: 1,
}
export const onlineTypes = {
    ACTIVE: 1,
    OFFLINE: 0
}
export const messagesTypes = {
    TEXT: 1,
    IMAGE: 2,
    SUPER_IMAGE: 3,
    POST: 4,
    ADDRESS: 5,
    EMOJI: 6,
    REPLY_STORY: 7,
}
export const emojiTypes = {
    LOVE: 1,
    HAHA: 2,
    WOW: 3,
    SAD: 4,
    ANGRY: 5,
    LIKE: 6
}
export const messagesActionTypes = {
    TRIGGER_MESSAGES_LISTENER_REQUEST: 'TRIGGER_MESSAGES_LISTENER_REQUEST',
    TRIGGER_MESSAGES_LISTENER_SUCCESS: 'TRIGGER_MESSAGES_LISTENER_SUCCESS',
    TRIGGER_MESSAGES_LISTENER_FAILURE: 'TRIGGER_MESSAGES_LISTENER_FAILURE',
}
export type OnlineStatus = {
    status: 0 | 1,
    last_online: number
}
export type Message = {
    userId: string,
    uid: number,
    type: number,
    text?: string,
    superImageId?: number,
    sourceUri?: string,
    postId?: number,
    address_id?: string,
    width?: number,
    height?: number,
    ownEmoji?: number,
    yourEmoji?: number
    seenAt?: number,
    seen: 0 | 1,
    create_at: number,
}
export type ExtraMessage = {
    messageList: Message[],
    ownUser: ProfileX,
    online: OnlineStatus
}
export type PostingMessage = {
    uid?: number,
    type: number,
    text?: string,
    superImageId?: number,
    postId?: number,
    sourceUri?: string,
    width?: number,
    height?: number,
    address_id?: string,
    ownEmoji?: number,
    yourEmoji?: number
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