import { userActionTypes } from '../constants'
import { Alert } from 'react-native'
import { Action } from 'redux'

type Photo = {
    id: number,
    src: string
}
type Info = {
    email: string,
    name: string,
    token: string
}
interface userInfo {
    user: {} | Info
    photos: [] | Photo[]
}
interface ErrorAction {
    type: typeof userActionTypes.LOGIN_FAILURE,
    payload: {
        message: string
    }
}
interface SuccessAction {
    type: typeof userActionTypes.LOGIN_SUCCESS,
    payload: Info
}
export type userAction = SuccessAction | ErrorAction
const defaultState: userInfo = {
    user: {},
    photos: []
}
const reducer = (state: userInfo = defaultState, action: userAction): userInfo => {
    switch (action.type) {
        case userActionTypes.LOGIN_REQUEST:
            state = { ...state, user: {} }
            return state
            break;
        case userActionTypes.LOGIN_SUCCESS:
            action = action as SuccessAction
            state = { ...state, user: { ...action.payload } }
            return state
            break;
        case userActionTypes.LOGIN_FAILURE:
            action = action as ErrorAction
            const { message } = action.payload
            Alert.alert('Error', message)
            return state
            break;
        default:
            return state
    }
}
export default reducer