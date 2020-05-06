import { auth, firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { WelcomePropsRouteParams } from "src/screens/Auth/Welcome";
import { userActionTypes } from "../constants";
import { navigate } from "../navigations/rootNavigation";
import { ErrorAction, SuccessAction, userAction, userPayload, UserInfo } from '../reducers/userReducer';
import { store } from '../store';
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
                let userx = rs.user
                firestore().collection('users')
                    .where('email', '==', user.email).get().then(snap => {
                        if (snap.size > 0) {
                            navigate('HomeTab') //ADD this line to fix initialRouteName not working on first time
                            const result: userPayload = {
                                user: {
                                    email: userx.email,
                                    logined: true,
                                    firebaseUser: userx,
                                    userInfo: snap.docs[0].data()
                                }
                            }
                            dispatch(LoginSuccess(result))
                        } else dispatch(LoginFailure())
                    })

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
export const LoginSuccess = (payload: userPayload): SuccessAction<userPayload> => {
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
                rs.user?.sendEmailVerification()
                firestore().collection('users').doc(userData.username)
                    .set({
                        email: userData.email,
                        fullname: userData.fullname,
                        phone: userData.phone,
                        username: userData.username,
                        birthday: {
                            date: userData.date,
                            month: userData.month,
                            year: userData.year
                        },
                        followings: [],
                        avatarURL: 'https://www.pavilionweb.com/wp-content/uploads/2017/03/man-300x300.png'
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
export const UnfollowRequest = (username: string):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('users')
                .where('username', '==', me.username).get()
            if (rq.size > 0) {
                const targetUser = rq.docs[0]
                const user: UserInfo = targetUser.data() || {}
                if (user.followings !== undefined &&
                    user.followings.indexOf(username) > -1) {
                    user.followings
                        .splice(user.followings.indexOf(username), 1)
                    const followings = [...user.followings]
                    targetUser.ref.update({
                        followings
                    })
                }
                const rq2 = await targetUser.ref.get()
                me = rq2.data() || {}
                dispatch(UnfollowSuccess(me))
            } else {
                
            }

        } catch (e) {
            console.warn(e)
            dispatch(UnfollowFailure())
        }
    }
}
export const UnfollowFailure = (): ErrorAction => {
    return {
        type: userActionTypes.UNFOLLOW_FAILURE,
        payload: {
            message: `Can't unfollow this people!`
        }
    }
}
export const UnfollowSuccess = (user: UserInfo): SuccessAction<UserInfo> => {
    return {
        type: userActionTypes.UNFOLLOW_SUCCESS,
        payload: user
    }
}
