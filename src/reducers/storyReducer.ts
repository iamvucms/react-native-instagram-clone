import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
export const seenTypes = {
    NOTSEEN: 0,
    SEEN: 1,
}
export const storyActionTypes = {
    FETCH_STORY_LIST_REQUEST: 'FETCH_STORY_LIST_REQUEST',
    FETCH_STORY_LIST_SUCCESS: 'FETCH_STORY_LIST_SUCCESS',
    FETCH_STORY_LIST_FAILURE: 'FETCH_STORY_LIST_FAILURE',
}
export type Story = {
    userId?: string,
    uid?: number,
    type?: number,
    permission?: number,
    create_at?: firestore.Timestamp,
    source?: string,
    seen?: number,
    seenList?: string[]
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