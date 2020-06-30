import { firestore, database } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { seenTypes, messagesActionTypes, ExtraMessage, Message, MessageAction, MessageErrorAction, MessageList, MessageSuccessAction, messagesTypes, PostingMessage, OnlineStatus } from '../reducers/messageReducer';
import { UserInfo } from '../reducers/userReducer';
import { store } from "../store";
import { Post, ExtraPost } from '../reducers/postReducer';
import { Comment } from '../reducers/commentReducer';
import { convertToFirebaseDatabasePathName, revertFirebaseDatabasePathName } from '../utils';
import { ProfileX } from '../reducers/profileXReducer';

export const TriggerMessageListenerRequest = ():
    ThunkAction<Promise<void>, {}, {}, MessageAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, MessageAction>) => {
        try {
            const dbRef = database()
            const ref = firestore()
            const myUsername = store.getState().user.user.userInfo?.username || ''
            const myUsernamePath = convertToFirebaseDatabasePathName(
                myUsername)

            dbRef.ref(`/messages/${(myUsernamePath)}/`).on('value', async snap => {
                const messageCollection: Message[][] = []
                const userIds: string[] = []
                snap.forEach(targetUser => {
                    const userId = revertFirebaseDatabasePathName(`${targetUser.key}`)
                    if (userIds.indexOf(`${targetUser.key}`) < 0)
                        userIds.push(userId)

                    const messages: Message[] = []

                    targetUser.forEach(m => {
                        messages.push({
                            ...m.val(),
                            userId,
                        })
                    })
                    messageCollection.push(messages)
                })
                const fetchMyMessagesTasks = userIds.map((userId, index) => {
                    return new Promise((resolve, reject) => {
                        dbRef.ref(`/messages/${convertToFirebaseDatabasePathName(userId)}/${(myUsernamePath)}`)
                            .once('value', snap2 => {
                                resolve()
                                snap2.forEach(m => {
                                    messageCollection[index].push({
                                        ...m.val(),
                                        userId: myUsername
                                    })
                                })
                                messageCollection[index].sort((a, b) => b.create_at - a.create_at)
                            })
                    })
                })
                const fetchUserStatusTasks = userIds.map((userId, index) => {
                    return new Promise<OnlineStatus>((resolve, reject) => {
                        dbRef.ref(`/online/${convertToFirebaseDatabasePathName(userId)}`)
                            .once('value', snap3 => {
                                resolve(snap3.val() as OnlineStatus)

                            })
                    })
                })
                Promise.all(fetchMyMessagesTasks).then(async () => {
                    const preUserInfos: ProfileX[] = store.getState().messages.map(x => x.ownUser)
                    const fetchUserInfoListTasks: Promise<ProfileX>[] = userIds
                        .map(async userId => {
                            let idx = -1
                            preUserInfos.find((x, index) => {
                                if (x.username === userId) idx = index
                                return x.username === userId
                            })
                            if (idx > -1) {
                                return preUserInfos[idx]
                            }
                            const rq = await ref.collection('users')
                                .doc(`${userId}`).get()
                            const userData: ProfileX = rq.data() || {}
                            return userData
                        })
                    const userInfos: ProfileX[] = await Promise.all(fetchUserInfoListTasks)
                    const onlineStatus: OnlineStatus[] = await Promise.all(fetchUserStatusTasks)
                    const collection: MessageList = messageCollection.map((messageGroup, index) => {
                        return {
                            messageList: messageGroup,
                            ownUser: userInfos[index],
                            online: onlineStatus[index]
                        }
                    })
                    collection.sort((a, b) =>
                        b.messageList[0].create_at - a.messageList[0].create_at)
                    dispatch(TriggerMessageListenerSuccess(collection))
                })

            })
            // 
        } catch (e) {
            console.warn(e)
            dispatch(TriggerMessageListenerFailure())
        }
    }
}
export const TriggerMessageListenerFailure = (): MessageErrorAction => {
    return {
        type: messagesActionTypes.TRIGGER_MESSAGES_LISTENER_FAILURE,
        payload: {
            message: 'Get Messages Failed!'
        }
    }
}
export const TriggerMessageListenerSuccess = (payload: MessageList): MessageSuccessAction<MessageList> => {
    return {
        type: messagesActionTypes.TRIGGER_MESSAGES_LISTENER_SUCCESS,
        payload: payload
    }
}
export const CreateMessageRequest = (message: PostingMessage, targetUsername: string):
    ThunkAction<Promise<void>, {}, {}, MessageAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, MessageAction>) => {
        try {
            const targetUsernamePath = convertToFirebaseDatabasePathName(targetUsername)
            const myUsername = store.getState().user.user.userInfo?.username || ''
            const myUsernamePath = convertToFirebaseDatabasePathName(
                myUsername)
            const dbRef = database()
            const ref = firestore()
            const uid = new Date().getTime()
            const msg = {
                ...message,
                userId: myUsername,
                uid,
            }
            dbRef.ref(`/messages/${targetUsernamePath}/${myUsernamePath}/${uid}`)
                .set(msg)
            const extraMsg = store.getState().messages.find(x => x.ownUser.username === targetUsername)
            if (extraMsg) {
                const index = store.getState().messages.findIndex(x => x === extraMsg)
                const newExtraMsg = { ...extraMsg }
                newExtraMsg.messageList = [msg, ...newExtraMsg.messageList]
                const newExtraList = [...store.getState().messages]
                newExtraList[index] = newExtraMsg
                dispatch(TriggerMessageListenerSuccess(newExtraList))
            } else {
                const rq = await ref.collection('users').doc(`${targetUsername}`).get()
                const targetUserData: ProfileX = rq.data() || {}
                dbRef.ref(`/online/${targetUsernamePath}`).once('value', snap => {
                    const newExtraMsg: ExtraMessage = {
                        messageList: [msg],
                        ownUser: targetUserData,
                        online: snap.val()
                    }
                    const newExtraList = [...store.getState().messages]
                    newExtraList.push(newExtraMsg)
                    dispatch(TriggerMessageListenerSuccess(newExtraList))
                })
            }
        } catch (e) {
            console.warn(e)
            dispatch(TriggerMessageListenerFailure())
        }
    }
}