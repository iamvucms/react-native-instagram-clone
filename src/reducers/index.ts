import { combineReducers } from 'redux'
import {
    useSelector as useReduxSelector,
    TypedUseSelectorHook,
} from 'react-redux'
import userReducer, { userPayload } from './userReducer'
import storyReducer, { StoryList } from './storyReducer'
export type AppState = {
    user: userPayload,
    storyList: StoryList
}
const rootReducer = combineReducers<AppState>({
    user: userReducer,
    storyList: storyReducer
})
export const useSelector:
    TypedUseSelectorHook<ReturnType<typeof rootReducer>> = useReduxSelector
export default rootReducer