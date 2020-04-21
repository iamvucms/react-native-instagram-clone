import { userActionTypes } from "../constants";
import { userAction, SuccessAction, ErrorAction, userPayload } from '../reducers/userReducer'
import { WelcomePropsRouteParams } from "src/screens/Auth/Welcome";
import { AsyncStorage } from "react-native";
import { auth, firestore } from 'firebase'
import { ThunkAction, ThunkDispatch } from "redux-thunk";
export interface userLoginWithEmail {
    email: string,
    password: string
}
export type RegisterParams = WelcomePropsRouteParams & { username: string }
export const LoginRequest = (user: userLoginWithEmail):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        return auth().signInWithEmailAndPassword(user.email, user.password).then(rs => {
            if (rs.user) {
                AsyncStorage.setItem('user_data', JSON.stringify(rs.user))
                const result: userPayload = {
                    user: {
                        email: rs.user.email,
                        logined: true,
                        firebaseUser: rs.user
                    }
                }
                dispatch(LoginSuccess(result))
            } else dispatch(LoginFailure())
        }).catch(e => {
            dispatch(LoginFailure())
        })
    }
}
export const LoginFailure = (): ErrorAction => {
    return {
        type: userActionTypes.LOGIN_FAILURE,
        payload: {
            message: 'Login Failed!'
        }
    }
}
export const LoginSuccess = (payload: userPayload): SuccessAction => {
    return {
        type: userActionTypes.LOGIN_SUCCESS,
        payload: payload
    }
}
export const RegisterRequest = (userData: RegisterParams):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        return auth()
            .createUserWithEmailAndPassword(userData.email, userData.password)
            .then(rs => {
                firestore().collection('users')
                    .add({
                        email: userData.email,
                        fullname: userData.fullname,
                        phone: userData.phone,
                        username: userData.username,
                        birthday: {
                            date: userData.date,
                            month: userData.month,
                            year: userData.year
                        }
                    })
                dispatch(LoginRequest({
                    email: userData.email,
                    password: userData.password,
                }))
            }).catch(e => {
                dispatch(RegisterFailure(`${e}`))
            })
    }
}
export const RegisterFailure = (e: string): ErrorAction => {
    return {
        payload: {
            message: e
        },
        type: userActionTypes.REGISTER_FAILURE
    }
}