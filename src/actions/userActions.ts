import { auth, firestore, storage } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { navigate, dispatch } from "../navigations/rootNavigation";
import { ErrorAction, PrivacyProperties, ExtraInfoPayload, NotificationSetting, PostStoryCommentOptions, SuccessAction, userAction, userActionTypes, UserInfo, userPayload, NotificationProperties, PrivacySetting, PrivacyCommentOptions } from '../reducers/userReducer';
import { store } from '../store';
import { WelcomePropsRouteParams } from '../screens/Auth/Welcome';
import { generateUsernameKeywords, uriToBlob } from '../utils';
import { DEFAULT_PHOTO_URI } from '../constants';
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
                        keyword: generateUsernameKeywords(userData.username),
                        phone: userData.phone,
                        username: userData.username,
                        birthday: {
                            date: userData.date,
                            month: userData.month,
                            year: userData.year
                        },
                        bio: '',
                        gender: 2,
                        followings: [],
                        website: '',
                        avatarURL: DEFAULT_PHOTO_URI
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
                    skipRecommmendFollowBackList: [],
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
                payload.extraInfo.skipRecommmendFollowBackList
                    = rq2.docs[0].data().skipRecommmendFollowBackList || []
                const rq5 = await ref.collection('stories')
                    .where('userId', '==', me.username)
                    .where('create_at', '>=',
                        new Date(new Date().getTime() - 24 * 3600 * 1000))
                    .orderBy('create_at', 'asc').get()
                payload.currentStory = rq5.docs.map(x => x.data())
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
export const FollowContactsRequest = (phoneList: string[]):
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
                                dispatch(FollowUserSuccess(me))
                            }
                        })

                    }
                })
            } else {
                dispatch(FollowUserFailure())
            }

        } catch (e) {
            console.warn(e)
            dispatch(FollowUserFailure())
        }
    }
}
export const ToggleFollowUserRequest = (username: string, refreshExtraInfo: boolean = false):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('users')
                .where('username', '==', me.username).get()
            if (rq.size > 0) {
                const targetUser = rq.docs[0]
                const userData: UserInfo = targetUser.data() || {}
                const currentFollowings = userData.followings || []
                if (currentFollowings.indexOf(username) < 0) {
                    currentFollowings.push(username)
                } else {
                    currentFollowings.splice(currentFollowings.indexOf(username), 1)
                }
                targetUser.ref.update({
                    followings: currentFollowings
                })
                dispatch(FollowUserSuccess(userData))
                if (refreshExtraInfo) {
                    dispatch(FetchExtraInfoRequest())
                }
            } else {
                dispatch(FollowUserFailure())
            }

        } catch (e) {
            console.warn(e)
            dispatch(FollowUserFailure())
        }
    }
}
export const FollowUserSuccess = (payload: UserInfo):
    SuccessAction<UserInfo> => {
    return {
        type: userActionTypes.FOLLOW_SUCCESS,
        payload,
    }
}
export const FollowUserFailure = ():
    ErrorAction => {
    return {
        type: userActionTypes.FOLLOW_FAILURE,
        payload: {
            message: `Error! Can't send following request`
        }
    }
}
//UPDATE USER INFO ACTIONS 
export const UpdateUserInfoRequest = (updateUserData: UserInfo):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('users')
                .where('username', '==', me.username).get()
            if (rq.size > 0) {
                const userData: UserInfo = rq.docs[0].data()
                const userRef = rq.docs[0].ref
                const userInfo = {
                    ...userData,
                    ...updateUserData
                }
                const { email,
                    avatarURL,
                    bio,
                    birthday,
                    followings,
                    fullname,
                    gender,
                    phone,
                    username,
                    website
                } = userInfo
                const filterdUserInfo: UserInfo = {
                    email,
                    avatarURL,
                    bio,
                    birthday,
                    followings,
                    fullname,
                    gender,
                    phone,
                    username,
                    website
                }
                if (userInfo.username !== me.username) {
                    ref.collection('users')
                        .doc(userInfo.username)
                        .set(userInfo)
                    ref.collection('users').doc(me.username).delete()
                } else userRef.update(userInfo)

                dispatch(UpdateUserInfoSuccess(filterdUserInfo))
            } else {
                dispatch(UpdateUserInfoFailure())
            }

        } catch (e) {
            console.warn(e)
            dispatch(UpdateUserInfoFailure())
        }
    }
}
export const UpdateUserInfoFailure = (): ErrorAction => {
    return {
        type: userActionTypes.UPDATE_USER_INFO_FAILURE,
        payload: {
            message: `Can't update now, try again!`
        }
    }
}
export const UpdateUserInfoSuccess = (user: UserInfo): SuccessAction<UserInfo> => {
    return {
        type: userActionTypes.UPDATE_USER_INFO_SUCCESS,
        payload: user
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
//UPDATE PRIVACY SETTING ACTIONS
export const UpdatePrivacySettingsRequest = (setting: PrivacySetting):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            if (Object.keys(setting).length === 0) throw new Error;
            const targetSetting = Object.keys(setting)[0]
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('users').doc(me.username).get()
            const targetUser = rq.ref
            type TempIntersection = UserInfo & { privacySetting?: PrivacySetting }

            const user: TempIntersection = rq.data() || {}
            if (user.privacySetting) {
                for (let [key, value] of Object.entries(user.privacySetting)) {
                    if (setting.hasOwnProperty(key)) {
                        value = <PrivacyCommentOptions>value
                        setting[<PrivacyProperties>key] = {
                            ...value,
                            ...Object.values(setting)[0]
                        }
                        break;
                    }
                }
            }
            await targetUser.update({
                privacySetting: {
                    ...(user.privacySetting || {}),
                    ...setting
                }
            })
            const rq2 = await targetUser.get()
            const result: TempIntersection = rq.data() || {}
            dispatch(UpdatePrivacySettingSuccess({
                ...(user.privacySetting || {}),
                ...setting
            }))
        } catch (e) {
            console.warn(e)
            dispatch(UpdatePrivacySettingFailure())
        }
    }
}
export const UpdatePrivacySettingSuccess = (payload: PrivacySetting):
    SuccessAction<PrivacySetting> => {
    return {
        type: userActionTypes.UPDATE_PRIVACY_SETTING_SUCCESS,
        payload,
    }
}
export const UpdatePrivacySettingFailure = ():
    ErrorAction => {
    return {
        type: userActionTypes.UPDATE_PRIVACY_SETTING_FAILURE,
        payload: {
            message: `Error! Can't update setting`
        }
    }
}
export const UploadAvatarRequest = (uri: string, extension: string):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            const me = store.getState().user.user.userInfo
            const blob = await uriToBlob(uri)
            const result = await storage().ref()
                .child(`avatar/${me?.username}.${extension}`)
                .put(blob as Blob, {
                    contentType: `image/${extension}`
                })
            const downloadUri = await result.ref.getDownloadURL()
            dispatch(UpdateUserInfoRequest({
                avatarURL: downloadUri
            }))
        } catch (e) {

        }
    }
}
export const RemoveFollowerRequest = (username: string):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            const me = store.getState().user.user.userInfo
            const ref = firestore()
            const myUsername = me?.username || ""
            const rq = await ref.collection('users')
                .doc(username).get()
            const targetUser: UserInfo = rq.data() || {}
            const targetFollowings = targetUser.followings || []
            const index = targetFollowings.indexOf(myUsername)
            if (index > -1) {
                targetFollowings.splice(index, 1)
                rq.ref.update({
                    followings: [...targetFollowings]
                })
                dispatch(FetchExtraInfoRequest())
            }
        } catch (e) {

        }
    }
}