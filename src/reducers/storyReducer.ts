import { storyActionTypes } from '../constants'
import { Alert } from 'react-native'
import { firestore } from 'firebase'
import { UserInfo } from './userReducer'
export type Story = {
    userId?: string,
    uid?: string,
    type?: number,
    permission?: number,
    create_at?: firestore.Timestamp,
    source?: string,
    seen?: number
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