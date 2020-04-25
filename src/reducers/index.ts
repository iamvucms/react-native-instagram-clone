import { combineReducers } from 'redux'
import {
    useSelector as useReduxSelector,
    TypedUseSelectorHook,
} from 'react-redux'
import userReducer, { userPayload } from './userReducer'
import storyReducer, { StoryList } from './storyReducer'
import postReducer, { PostList } from './postReducer'
export type AppState = {
    user: userPayload,
    storyList: StoryList,
    postList: PostList
}
const rootReducer = combineReducers<AppState>({
    user: userReducer,
    storyList: storyReducer,
    postList: postReducer
})
export const useSelector:
    TypedUseSelectorHook<ReturnType<typeof rootReducer>> = useReduxSelector
export default rootReducer