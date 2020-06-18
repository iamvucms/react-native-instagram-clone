import { auth, firestore, storage } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { DEFAULT_PHOTO_URI } from '../constants';
import { navigate } from "../navigations/rootNavigation";
import { defaultUserState, ErrorAction, ExtraInfoPayload, NotificationProperties, NotificationSetting, PostStoryCommentOptions, PrivacyCommentOptions, PrivacyProperties, PrivacySetting, SuccessAction, userAction, userActionTypes, UserInfo, userPayload, UserSetting, HashTag, SearchItem } from '../reducers/userReducer';
import { WelcomePropsRouteParams } from '../screens/Auth/Welcome';
import { store } from '../store';
import { generateUsernameKeywords, uriToBlob, Timestamp } from '../utils';
import { Alert } from 'react-native';
import { CreateNotificationRequest } from './notificationActions';
import { notificationTypes } from '../reducers/notificationReducer';
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
                    .where('email', '==', user.email).get().then(rq => {
                        if (rq.size > 0) {
                            navigate('HomeTab') //ADD this line to fix initialRouteName not working on first time
                            const {
                                avatarURL,
                                bio,
                                birthday,
                                email,
                                followings,
                                fullname,
                                gender,
                                phone,
                                searchRecent,
                                username,
                                website,
                                requestedList,
                                notificationSetting,
                                privacySetting,
                                postNotificationList,
                                storyNotificationList,
                                unSuggestList
                            } = rq.docs[0].data()
                            const result: userPayload = {
                                user: {
                                    logined: true,
                                    firebaseUser: userx,
                                    userInfo: {
                                        avatarURL,
                                        bio,
                                        birthday,
                                        email,
                                        followings,
                                        fullname,
                                        gender,
                                        phone,
                                        searchRecent: searchRecent || [],
                                        username,
                                        website,
                                        storyNotificationList,
                                        postNotificationList,
                                        requestedList,
                                        unSuggestList
                                    }
                                },
                                setting: {
                                    notification: notificationSetting || defaultUserState.setting?.notification,
                                    privacy: privacySetting || defaultUserState.setting?.privacy
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
                        followings: [userData.username],
                        requestedList: [],
                        searchRecent: [],
                        storyNotificationList: [],
                        postNotificationList: [],
                        website: '',
                        avatarURL: DEFAULT_PHOTO_URI,
                        privacySetting: {
                            ...defaultUserState.setting?.privacy
                        },
                        notificationSetting: {
                            ...defaultUserState.setting?.notification
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
                    dispatch(CreateNotificationRequest({
                        isUndo: true,
                        postId: 0,
                        replyId: 0,
                        commentId: 0,
                        userId: [username],
                        from: me.username,
                        create_at: Timestamp(),
                        type: notificationTypes.FOLLOW_ME
                    }))
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
            const tagPhotos = await ref.collection('posts')
                .where('tagUsername', 'array-contains', me.username).get()
            const payload: ExtraInfoPayload = {
                currentStory: [],
                extraInfo: {
                    unSuggestList: [],
                    requestedList: [],
                    followers: [],
                    followings: [],
                    posts: rq.size || 0
                },
                photos: rq.docs.map(x => x.data()),
                tagPhotos: tagPhotos.docs.map(x => x.data()),
            }
            const rq2 = await ref.collection('users')
                .where('username', '==', me.username).limit(1).get()
            if (rq2.size > 0) {
                payload.extraInfo.followings = rq2.docs[0].data().followings || []
                payload.extraInfo.unSuggestList = rq2.docs[0].data().unSuggestList || []
                payload.extraInfo.requestedList = rq2.docs[0].data().requestedList || []
                const rq3 = await ref.collection('users')
                    .where('followings', 'array-contains', me.username).get()
                payload.extraInfo.followers = rq3.docs.map(x => x.data().username)
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
//update extra info
export const UpdateExtraInfoRequest = (data: ExtraInfoPayload):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            dispatch(FetchExtraInfoSuccess(data))
        } catch (e) {
            console.warn(e)
            dispatch(FetchExtraInfoFailure())
        }
    }
}
//
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
            const targetUser = await ref.collection('users').doc(username).get()
            if (rq.size > 0) {
                const myUser = rq.docs[0]
                const userData: UserInfo = myUser.data() || {}
                const currentFollowings = userData.followings || []
                const index = currentFollowings.indexOf(username)
                const targetUserData: {
                    privacySetting?: {
                        accountPrivacy: {
                            private: boolean
                        }
                    }
                } = targetUser.data() || {}
                if (index < 0) {
                    if (targetUserData.privacySetting?.accountPrivacy.private) {
                        dispatch(ToggleSendFollowRequest(username))
                    } else currentFollowings.push(username)
                } else {
                    currentFollowings.splice(index, 1)
                }
                myUser.ref.update({
                    followings: currentFollowings
                })

                //add notification
                if (index < 0 && !!!targetUserData.privacySetting?.accountPrivacy.private) {
                    dispatch(CreateNotificationRequest({
                        postId: 0,
                        replyId: 0,
                        commentId: 0,
                        userId: [username],
                        from: me.username,
                        create_at: Timestamp(),
                        type: notificationTypes.FOLLOW_ME
                    }))
                } else if (index > -1 && !!!targetUserData.privacySetting?.accountPrivacy.private) {
                    dispatch(CreateNotificationRequest({
                        isUndo: true,
                        postId: 0,
                        replyId: 0,
                        commentId: 0,
                        userId: [username],
                        from: me.username,
                        create_at: Timestamp(),
                        type: notificationTypes.FOLLOW_ME
                    }))
                }

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
//SEND FOLLOW REQUEST
export const ToggleSendFollowRequest = (username: string):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        try {
            let me: UserInfo = { ...store.getState().user.user.userInfo }
            const ref = firestore()
            const rq = await ref.collection('users')
                .where('username', '==', me.username).get()
            if (rq.size > 0) {
                const targetUser = await ref.collection('users').doc(username).get()
                const targetUserData = targetUser.data() || {}
                const requestedList = targetUserData.requestedList || []
                const index = requestedList.indexOf(me.username)
                if (index < 0) {
                    requestedList.push(me.username)
                } else {
                    requestedList.splice(index, 1)
                }
                targetUser.ref.update({
                    requestedList
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
//FETCH SETTING ACTION
export const FetchSettingRequest = ():
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        const me = store.getState().user.user.userInfo
        const rq = await firestore().collection('users')
            .doc(me?.username).get()
        if (rq.exists) {
            const {
                notificationSetting,
                privacySetting,
            } = rq.data() || {}
            const result: UserSetting = {
                notification: notificationSetting || defaultUserState.setting?.notification,
                privacy: privacySetting || defaultUserState.setting?.privacy
            }
            dispatch(FetchSettingSuccess(result))
        } else dispatch(FetchSettingFailure())
    }
}
export const FetchSettingFailure = (): ErrorAction => {
    return {
        type: userActionTypes.FETCH_SETTING_FAILURE,
        payload: {
            message: 'FetchSetting Failed!'
        }
    }
}
export const FetchSettingSuccess = (payload: UserSetting): SuccessAction<UserSetting> => {
    return {
        type: userActionTypes.FETCH_SETTING_SUCCESS,
        payload: payload
    }
}
//CONFIRM REQUEST ACTION
export const ConfirmFollowRequest = (username: string):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        const me = store.getState().user.user.userInfo
        const ref = firestore()
        const rq = await ref.collection('users')
            .doc(me?.username).get()
        const targetUser = await ref.collection('users').doc(username).get()
        if (rq.exists && targetUser.exists) {
            const targetUserData: UserInfo = targetUser.data() || {}
            const currentTargetUserFollowings = targetUserData.followings || []
            if (currentTargetUserFollowings.indexOf(me?.username || '') < 0) {
                currentTargetUserFollowings.push(me?.username || '')
                targetUser.ref.update({
                    followings: currentTargetUserFollowings
                })
            }
            const myUserData: UserInfo = rq.data() || {}
            const currentRequest = myUserData.requestedList || []
            const index = currentRequest.indexOf(username)
            if (index > -1) {
                currentRequest.splice(index, 1)
                rq.ref.update({
                    requestedList: currentRequest
                })
            }
            dispatch(FetchExtraInfoRequest())
        } else {
            Alert.alert('Error', 'Please check your network!')
        }
    }
}
export const DeclineFollowRequest = (username: string):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        const me = store.getState().user.user.userInfo
        const ref = firestore()
        const rq = await ref.collection('users')
            .doc(me?.username).get()
        const targetUser = await ref.collection('users').doc(username).get()
        if (rq.exists && targetUser.exists) {
            const targetUserData: UserInfo = targetUser.data() || {}
            const currentTargetUserFollowings = targetUserData.followings || []
            const index = currentTargetUserFollowings.indexOf(me?.username || '')
            if (index > -1) {
                currentTargetUserFollowings.splice(index, 1)
                targetUser.ref.update({
                    followings: currentTargetUserFollowings
                })
            }
            const myUserData: UserInfo = rq.data() || {}
            const currentRequest = myUserData.requestedList || []
            const index2 = currentRequest.indexOf(username)
            if (index2 > -1) {
                currentRequest.splice(index2, 1)
                rq.ref.update({
                    requestedList: currentRequest
                })
            }
            dispatch(FetchExtraInfoRequest())
        } else {
            Alert.alert('Error', 'Please check your network!')
        }
    }
}
//ADD UNSUGGESTION LIST 
export const UnSuggestionRequest = (username: string):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        const me = store.getState().user.user.userInfo
        const ref = firestore()
        const rq = await ref.collection('users')
            .doc(me?.username).get()
        if (rq.exists) {
            const myUserData: UserInfo = rq.data() || {}
            const currentUnSuggestList = myUserData.unSuggestList || []
            const index = currentUnSuggestList.indexOf(username)
            if (index < 0) {
                currentUnSuggestList.push(username)
                rq.ref.update({
                    unSuggestList: currentUnSuggestList
                })
            }
            dispatch(FetchExtraInfoRequest())
        } else {
            Alert.alert('Error', 'Please check your network!')
        }
    }
}
// change search recent list
export const FetchRecentSearchRequest = ():
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, SuccessAction<SearchItem[]>>) => {
        const me = store.getState().user.user.userInfo
        const ref = firestore()
        const rq = await ref.collection('users')
            .doc(me?.username).get()
        if (rq.exists) {
            const myUserData: UserInfo = rq.data() || {}
            const recentSearchList: SearchItem[] = myUserData.searchRecent || []
            dispatch({
                type: userActionTypes.FETCH_RECENT_SEARCH_SUCCESS,
                payload: recentSearchList
            })
        } else {
            Alert.alert('Error', 'Please check your network!')
        }
    }
}
export const PushRecentSearchRequest = (searchItem: SearchItem):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        const me = store.getState().user.user.userInfo
        const ref = firestore()
        const rq = await ref.collection('users')
            .doc(me?.username).get()
        if (rq.exists) {
            const myUserData: UserInfo = rq.data() || {}
            const recentSearchList: SearchItem[] = myUserData.searchRecent || []
            const temp = [...recentSearchList]
            const check = temp.every((item, index) => {
                if ((item.username === searchItem.username && searchItem.type === 1
                    && item.type === 1)
                    || (item.hashtag === searchItem.hashtag && searchItem.type === 2
                        && item.type === 2)
                    || (item.address === searchItem.address && searchItem.type === 3
                        && item.type === 3)
                ) {
                    recentSearchList.splice(index, 1)
                    recentSearchList.push(searchItem)
                    return false
                }
                return true
            })
            if (check) {
                recentSearchList.push(searchItem)
            }
            rq.ref.update({
                searchRecent: recentSearchList
            })
            dispatch(FetchRecentSearchRequest())
        } else {
            Alert.alert('Error', 'Please check your network!')
        }
    }
}
export const RemoveRecentSearchRequest = (searchItem: SearchItem):
    ThunkAction<Promise<void>, {}, {}, userAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, userAction>) => {
        const me = store.getState().user.user.userInfo
        const ref = firestore()
        const rq = await ref.collection('users')
            .doc(me?.username).get()
        if (rq.exists) {
            const myUserData: UserInfo = rq.data() || {}
            const recentSearchList: SearchItem[] = myUserData.searchRecent || []
            const temp = [...recentSearchList]
            temp.every((item, index) => {
                if ((item.username === searchItem.username && searchItem.type === 1
                    && item.type === 1)
                    || (item.hashtag === searchItem.hashtag && searchItem.type === 2
                        && item.type === 2)
                    || (item.address === searchItem.address && searchItem.type === 3
                        && item.type === 3)
                ) {
                    recentSearchList.splice(index, 1)
                    return false
                }
                return true
            })
            rq.ref.update({
                searchRecent: recentSearchList
            })
            dispatch(FetchRecentSearchRequest())
        } else {
            Alert.alert('Error', 'Please check your network!')
        }
    }
}