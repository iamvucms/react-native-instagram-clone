import { userActionTypes } from '../constants'
import { Alert } from 'react-native'
type Photo = {
    id: number,
    src: string
}
export interface userPayload {
    user: {
        email?: string | null,
        logined?: boolean,
        firebaseUser?: firebase.UserInfo
    },
    photos?: [] | Photo[]
}
export interface ErrorAction {
    type: typeof userActionTypes.LOGIN_FAILURE,
    payload: {
        message: string
    }
}
export interface SuccessAction {
    type: typeof userActionTypes.LOGIN_SUCCESS,
    payload: userPayload
}
export type userAction = SuccessAction | ErrorAction
const defaultState: userPayload = {
    user: {},
    photos: []
}
const reducer = (state: userPayload = defaultState, action: userAction): userPayload => {
    switch (action.type) {
        case userActionTypes.LOGIN_REQUEST:
            state = { ...state, user: {} }
            return state
            break;
        case userActionTypes.LOGIN_SUCCESS:
            action = <SuccessAction>action
            state = { ...state, user: { ...action.payload.user } }
            return state
            break;
        case userActionTypes.LOGIN_FAILURE:
            action = <ErrorAction>action
            const message = action.payload.message
            Alert.alert('Error', message)
            return state
            break;
        case userActionTypes.REGISTER_REQUEST:
            state = { ...state, user: {} }
            return state
            break;
        case userActionTypes.REGISTER_SUCCESS:
            action = <SuccessAction>action
            state = { ...state, user: { ...action.payload.user } }
            return state
            break;
        case userActionTypes.REGISTER_FAILURE:
            action = <ErrorAction>action
            const message2 = action.payload.message
            Alert.alert('Error', message2)
            return state
            break;
        default:
            return state
    }
}
export default reducer