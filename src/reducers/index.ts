import { combineReducers } from 'redux'
import {
    useSelector as useReduxSelector,
    TypedUseSelectorHook,
} from 'react-redux'
import userReducer, { userPayload } from './userReducer'
export type AppState = {
    user: userPayload
}
const rootReducer = combineReducers<AppState>({
    user: userReducer,
})
export const useSelector:
    TypedUseSelectorHook<ReturnType<typeof rootReducer>> = useReduxSelector
export default rootReducer