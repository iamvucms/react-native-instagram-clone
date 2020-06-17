import { firestore, database } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { seenTypes, notificationActionTypes, ExtraNotification, Notification, NotificationAction, NotificationErrorAction, NotificationList, NotificationSuccessAction, notificationTypes, PostingNotification } from '../reducers/notificationReducer';
import { UserInfo } from '../reducers/userReducer';
import { store } from "../store";
import { Post, ExtraPost } from '../reducers/postReducer';
import { Comment } from '../reducers/commentReducer';
import { convertToFirebaseDatabasePathName } from '../utils';

export const FetchNotificationListRequest = ():
    ThunkAction<Promise<void>, {}, {}, NotificationAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, NotificationAction>) => {
        try {
            const me = store.getState().user.user.userInfo
            const ref = firestore()
            const rq = await ref.collection('notifications')
                .where('userId', 'array-contains', me?.username || '')
                .orderBy('create_at', 'desc')
                .get()
            const notificationTasks: Promise<ExtraNotification>[] = rq.docs
                .map(async doc => {
                    const notification: ExtraNotification = doc.data() || {}
                    const fromUsernames = [...(notification.froms || [])]
                    fromUsernames.reverse()
                    const previewFromTasks: Promise<UserInfo>[] = fromUsernames
                        .splice(0, 2)
                        .map(async usr => {
                            const rq2 = await ref.collection('users')
                                .doc(usr).get()
                            const data: UserInfo = rq2.data() || {}
                            return {
                                username: data.username,
                                avatarURL: data.avatarURL,
                                fullname: data.fullname
                            }
                        })
                    const previewUserInfos = await Promise.all(previewFromTasks)
                    notification.previewFroms = previewUserInfos
                    const post = await ref.collection('posts')
                        .doc(`${notification.postId}`).get()
                    const postData: ExtraPost = post.data() || {}
                    postData.ownUser = (await ref.collection('users').doc(`${postData.userId}`).get()).data() || {}
                    notification.postInfo = postData
                    if (notification.type === notificationTypes.LIKE_MY_COMMENT
                        || notification.type === notificationTypes.COMMENT_MY_POST) {
                        const rq2 = await ref.collectionGroup('comments')
                            .where('uid', '==', notification.commentId).get()
                        const comment = rq2.docs[0].data() || {}
                        notification.commentInfo = comment
                    }
                    if (notification.type === notificationTypes.LIKE_MY_REPLY
                        || notification.type === notificationTypes.REPLY_MY_COMMENT) {
                        const rq3 = await ref.collectionGroup('replies')
                            .where('uid', '==', notification.replyId).get()
                        const reply: Comment = rq3.docs[0].data() || {}
                        notification.replyInfo = reply
                    }
                    return notification
                })
            const notifications = await Promise.all(notificationTasks)
            dispatch(FetchNotificationListSuccess(notifications))
        } catch (e) {
            console.warn(e)
            dispatch(FetchNotificationListFailure())
        }
    }
}
export const FetchNotificationListFailure = (): NotificationErrorAction => {
    return {
        type: notificationActionTypes.FETCH_NOTIFICATIONS_FAILURE,
        payload: {
            message: 'Get Notifications Failed!'
        }
    }
}
export const FetchNotificationListSuccess = (payload: NotificationList): NotificationSuccessAction<NotificationList> => {
    return {
        type: notificationActionTypes.FETCH_NOTIFICATIONS_SUCCESS,
        payload: payload
    }
}
export const CreateNotificationRequest = (notification: PostingNotification):
    ThunkAction<Promise<void>, {}, {}, NotificationAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, NotificationAction>) => {
        try {
            const dbRef = database()
            const ref = firestore()
            const uid = new Date().getTime()
            const postNotification = { ...notification }
            let query = ref.collection('notifications')
                .where('postId', '==', notification.postId)
                .where('userId', '==', notification.userId)
            if (notification.type === notificationTypes.LIKE_MY_COMMENT
                || notification.type === notificationTypes.COMMENT_MY_POST) {
                query = query.where('commentId', '==', notification.commentId)
                    .where('replyId', '==', 0)
            }
            if (notification.type === notificationTypes.LIKE_MY_REPLY
                || notification.type === notificationTypes.REPLY_MY_COMMENT) {
                query = query.where('replyId', '==', notification.replyId)
            }
            if (notification.type === notificationTypes.FOLLOW_ME) {
                query = ref.collection('notifications')
                    .where('type', '==', notificationTypes.FOLLOW_ME)
                    .where('userId', '==', notification.userId)
            }
            if (notification.type === notificationTypes.LIKE_MY_POST) {
                query = query.where('commentId', '==', 0)
                    .where('replyId', '==', 0)
            }
            const rq = await query.get()
            if (notification.type === notificationTypes.LIKE_MY_POST
                || notification.type === notificationTypes.LIKE_MY_COMMENT
                || notification.type === notificationTypes.LIKE_MY_REPLY
                || notification.type === notificationTypes.FOLLOW_ME
            ) {
                if (rq.size > 0) {
                    const targetNotification = rq.docs[0]
                    const currentFroms = targetNotification.data().froms as string[]
                        || []
                    const index = currentFroms.indexOf(notification.from || "")
                    if (index < 0) {
                        currentFroms.push(notification.from || "")
                        notification.userId?.map(usr => {
                            dbRef.ref(`/notifications/${convertToFirebaseDatabasePathName(usr)}`).set(true)
                        })
                    } else if (index > -1 && notification.isUndo) {
                        currentFroms.splice(index, 1)
                    }
                    if (currentFroms.length === 0) {
                        targetNotification.ref.delete()
                    } else {
                        targetNotification.ref.update({
                            seen: seenTypes.NOTSEEN,
                            froms: currentFroms,
                            ...((index < 0 && !notification.isUndo)
                                ? { create_at: new Date() } : {})
                        })
                    }
                } else {
                    if (!!!notification.isUndo) {
                        delete postNotification.from
                        ref.collection('notifications').doc(`${uid}`)
                            .set({
                                uid,
                                ...postNotification,
                                froms: [notification.from],
                                seen: seenTypes.NOTSEEN,
                                create_at: new Date()
                            })
                        notification.userId?.map(usr => {
                            dbRef.ref(`/notifications/${convertToFirebaseDatabasePathName(usr)}`).set(true)
                        })
                    }
                }
            } else {
                delete postNotification.from
                if (notification.isUndo) {
                    delete notification.isUndo
                    if (rq.size > 0) {
                        const targetNotification = rq.docs[0]
                        const currentFroms = targetNotification.data().froms as string[]
                            || []
                        const index = currentFroms.indexOf(notification.from || "")
                        if (index > -1) {
                            currentFroms.splice(index, 1)
                        }
                        if (currentFroms.length === 0) {
                            targetNotification.ref.delete()
                        } else {
                            targetNotification.ref.update({
                                seen: seenTypes.NOTSEEN,
                                froms: currentFroms
                            })
                        }
                    }
                } else {
                    ref.collection('notifications')
                        .doc(`${uid}`)
                        .set({
                            uid,
                            ...postNotification,
                            froms: [notification.from],
                            seen: seenTypes.NOTSEEN,
                        })
                    notification.userId?.map(usr => {
                        dbRef.ref(`/notifications/${convertToFirebaseDatabasePathName(usr)}`).set(true)
                    })
                }
            }
        } catch (e) {
            console.warn(e)
            dispatch(FetchNotificationListFailure())
        }
    }
}