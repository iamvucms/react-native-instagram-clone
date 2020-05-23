import { auth, firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { WelcomePropsRouteParams } from "src/screens/Auth/Welcome";
import { navigate } from "../navigations/rootNavigation";
import { ErrorAction, ExtraInfoPayload, NotificationSetting, PostStoryCommentOptions, SuccessAction, userAction, userActionTypes, UserInfo, userPayload, NotificationProperties } from '../reducers/userReducer';
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
                        bio: '',
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
/**
 * FETCH EXTRA INFO ACTION
 */
export const FetchExtraInfoRequest = ():
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('posts')
                .where('userId', '==', me.username).get()
            const payload: ExtraInfoPayload = {
                currentStory: [],
                extraInfo: {
                    followers: [],
                    followings: [],
                    posts: rq.size || 0
                },
                photos: rq.docs.map(x => x.data())
            }
            const rq2 = await ref.collection('users')
                .where('username', '==', me.username).limit(1).get()
            if (rq2.size > 0) {
                payload.extraInfo.followings = rq2.docs[0].data().followings
                const rq3 = await ref.collection('users')
                    .where('followings', 'array-contains', me.username).get()
                payload.extraInfo.followers = rq3.docs.map(x => x.data().username)
                const rq4 = await ref.collection('stories')
                    .where('userId', '==', me.username)
                    .where('create_at', '>=',
                        new Date(new Date().getTime() - 24 * 3600 * 1000))
                    .orderBy('create_at', 'asc').get()
                payload.currentStory = rq4.docs.map(x => x.data())
                dispatch(FetchExtraInfoSuccess(payload))

            } else dispatch(FetchExtraInfoFailure())
        } catch (e) {
            console.warn(e)
            dispatch(FetchExtraInfoFailure())
        }
    }
}
export const FetchExtraInfoFailure = (): ErrorAction => {
    return {
        type: userActionTypes.FETCH_EXTRA_INFO_FAILURE,
        payload: {
            message: `Can't get information`
        }
    }
}
export const FetchExtraInfoSuccess = (extraInfo: ExtraInfoPayload):
    SuccessAction<ExtraInfoPayload> => {
    return {
        type: userActionTypes.FETCH_EXTRA_INFO_SUCCESS,
        payload: extraInfo
    }
}
export const FollowUsersRequest = (phoneList: string[]):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('users')
                .where('username', '==', me.username).get()
            if (rq.size > 0) {
                const targetUser = rq.docs[0]
                let userList: string[] = []
                phoneList.map(async (phone, index) => {
                    const rq2 = await ref.collection('users')
                        .where('phone', '==', phone).get()
                    if (rq2.docs.length > 0) {
                        const user = rq2.docs[0].data()
                        if (user.username) {
                            userList.push(user.username)
                        }
                    }
                    if (index === phoneList.length - 1) {
                        userList.map(async (username, index2) => {
                            const user: UserInfo = targetUser.data() || {}
                            if (user.followings !== undefined &&
                                user.followings.indexOf(username) < 0 &&
                                username !== me.username) {
                                user.followings
                                    .push(username)
                                const followings = [...user.followings]
                                await targetUser.ref.update({
                                    followings
                                })
                            }
                            if (index2 === userList.length - 1) {
                                const rq2 = await targetUser.ref.get()
                                me = rq2.data() || {}
                                dispatch(FollowUsersSuccess(me))
                            }
                        })

                    }
                })
            } else {

            }

        } catch (e) {
            console.warn(e)
            dispatch(FollowUsersFailure())
        }
    }
}
export const FollowUsersSuccess = (payload: UserInfo):
    SuccessAction<UserInfo> => {
    return {
        type: userActionTypes.FOLLOW_SUCCESS,
        payload,
    }
}
export const FollowUsersFailure = ():
    ErrorAction => {
    return {
        type: userActionTypes.FOLLOW_FAILURE,
        payload: {
            message: `Error! Can't send following request`
        }
    }
}
//UPDATE NOTIFICATION ACTIONS
export const UpdateNotificationSettingsRequest = (setting: NotificationSetting):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            if (Object.keys(setting).length === 0) throw new Error;
            const targetSetting = Object.keys(setting)[0]
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('users').doc(me.username).get()
            const targetUser = rq.ref
            type TempIntersection = UserInfo & { notificationSetting?: NotificationSetting }

            const user: TempIntersection = rq.data() || {}
            if (user.notificationSetting) {
                for (let [key, value] of Object.entries(user.notificationSetting)) {
                    if (setting.hasOwnProperty(key)) {
                        value = <PostStoryCommentOptions>value
                        setting[<NotificationProperties>key] = {
                            ...value,
                            ...Object.values(setting)[0]
                        }
                        break;
                    }
                }
            }
            await targetUser.update({
                notificationSetting: {
                    ...(user.notificationSetting || {}),
                    ...setting
                }
            })
            const rq2 = await targetUser.get()
            const result: TempIntersection = rq.data() || {}
            dispatch(UpdateNotificationSettingSuccess({
                ...(user.notificationSetting || {}),
                ...setting
            }))
        } catch (e) {
            dispatch(UpdateNotificationSettingFailure())
        }
    }
}
export const UpdateNotificationSettingSuccess = (payload: NotificationSetting):
    SuccessAction<NotificationSetting> => {
    return {
        type: userActionTypes.UPDATE_NOTIFICATION_SETTING_SUCCESS,
        payload,
    }
}
export const UpdateNotificationSettingFailure = ():
    ErrorAction => {
    return {
        type: userActionTypes.UPDATE_NOTIFICATION_SETTING_FAILURE,
        payload: {
            message: `Error! Can't update setting`
        }
    }
}