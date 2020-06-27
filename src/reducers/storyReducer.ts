import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
import { MapBoxAddress } from '../utils'
import { PostImage } from './postReducer'
import { StoryProcessedImage } from '../screens/Others/StoryProcessor'
export const seenTypes = {
    NOTSEEN: 0,
    SEEN: 1,
}
export const storyActionTypes = {
    FETCH_STORY_LIST_REQUEST: 'FETCH_STORY_LIST_REQUEST',
    FETCH_STORY_LIST_SUCCESS: 'FETCH_STORY_LIST_SUCCESS',
    FETCH_STORY_LIST_FAILURE: 'FETCH_STORY_LIST_FAILURE',
}
export const storyPermissions = {
    ALL: 1,
    CLOSE_FRIENDS: 2
}
export type Story = {
    userId?: string,
    uid?: number,
    permission?: number,
    create_at?: firestore.Timestamp,
    source?: number,
    superImage?: StoryProcessedImage,
    seen?: 0 | 1,
    seenList?: string[],
    reactions?: string[],
    hashtags?: string[],
    address?: MapBoxAddress[],
    mention?: string[],
    messagesList?: string[]
}
export type ExtraStory = {
    storyList: Story[],
    ownUser: UserInfo
}
export type StoryList = ExtraStory[]
export interface StoryErrorAction {
    type: string,
    payload: {
        message: string
    }
}
export interface StorySuccessAction {
    type: string,
    payload: StoryList
}
export type StoryAction = StorySuccessAction | StoryErrorAction
const defaultState: StoryList = []
const reducer = (state: StoryList = defaultState, action: StoryAction): StoryList => {
    switch (action.type) {
        case storyActionTypes.FETCH_STORY_LIST_REQUEST:
            state = [...defaultState]
            return state
        case storyActionTypes.FETCH_STORY_LIST_SUCCESS:
            action = <StorySuccessAction>action
            state = [...action.payload]
            return state
        case storyActionTypes.FETCH_STORY_LIST_FAILURE:
            action = <StoryErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
        default:
            return state
    }
}
export default reducer