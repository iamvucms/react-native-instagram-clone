import { firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { commentActionTypes, LIMIT_COMMENTS_PER_LOADING } from "../constants";
import { CommentAction, CommentErrorAction, CommentExtraList, CommentList, CommentListWithScroll, CommentSuccessAction, ExtraComment } from '../reducers/commentReducer';
import { UserInfo } from '../reducers/userReducer';
import { store } from "../store";

export const FetchCommentListRequest = (postId: number):
    ThunkAction<Promise<void>, {}, {}, CommentAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, CommentAction>) => {
        try {
            const ref = firestore()
            const rq = await ref.collection('posts')
                .where('uid', '==', postId).limit(1).get()
            if (rq.docs.length > 0) {
                const destinationPost = rq.docs[0]
                const ownIds: string[] = []
                let collection: CommentList = []
                const rqAll = await destinationPost.ref.collection('comments').get()
                let i = 0
                while (collection.length < LIMIT_COMMENTS_PER_LOADING
                    && collection.length < rqAll.size) {
                    const rq2 = await destinationPost.ref.collection('comments')
                        .orderBy('create_at', 'asc')
                        .limit(LIMIT_COMMENTS_PER_LOADING - collection.length)
                        .get()
                    i += LIMIT_COMMENTS_PER_LOADING - collection.length
                    rq2.docs.map(x => {
                        const data: ExtraComment = { ...x.data() }
                        x.ref.collection('replies')
                            .orderBy('create_at', 'asc').get().then(rq3 => {
                                let replies = rq3.docs.map(x2 => {
                                    if (ownIds.indexOf(x2.data().userId) < 0)
                                        ownIds.push(x2.data().userId)
                                    return x2.data()
                                })
                                data.replies = replies
                            })
                        if (ownIds.indexOf(x.data().userId) < 0)
                            ownIds.push(x.data().userId)
                        collection.push(data)
                    })
                }
                let ownInfos: UserInfo[] = []
                while (ownIds.length > 0) {
                    const rs = await firestore().collection('users')
                        .where('username', 'in', ownIds.splice(0, 10))
                        .get()
                    const temp: UserInfo[] = rs.docs.map(doc => {
                        return doc.data()
                    })
                    ownInfos = ownInfos.concat(temp)
                }
                collection = collection.map(comment => {
                    comment.ownUser = ownInfos.filter(x => x.username === comment.userId)[0]
                    comment.replies = comment.replies?.map(x => {
                        x.ownUser = ownInfos.filter(x2 => x2.username === x.userId)[0]
                        return x
                    })
                    return comment
                })
                const post = {
                    ...destinationPost.data(), ownUser: store.getState()
                        .postList.filter(x => x.uid
                            === destinationPost.data().uid)[0].ownUser
                }
                const payload: CommentExtraList = {
                    post,
                    comments: collection
                }
                dispatch(FetchCommentListSuccess(payload))
            } else dispatch(FetchCommentListFailure())
        } catch (e) {
            console.warn(e)
            dispatch(FetchCommentListFailure())
        }
    }
}
export const FetchCommentListFailure = (): CommentErrorAction => {
    return {
        type: commentActionTypes.FETCH_COMMENTS_FAILURE,
        payload: {
            message: 'Get Comments Failed!'
        }
    }
}
export const FetchCommentListSuccess = (payload: CommentExtraList):
    CommentSuccessAction<CommentExtraList> => {
    return {
        type: commentActionTypes.FETCH_COMMENTS_SUCCESS,
        payload: payload
    }
}
/**
 * LOAD MORE COMMENTS ACTIONS
 */
export const LoadMoreCommentListRequest = (postId: number):
    ThunkAction<Promise<void>, {}, {}, CommentAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, CommentAction>) => {
        try {
            const loadedCommentIds = store.getState()
                .comment.comments.map(x => x.uid)
            const ref = firestore()
            const rq = await ref.collection('posts')
                .where('uid', '==', postId).limit(1).get()
            if (rq.docs.length > 0) {

                const destinationPost = rq.docs[0]
                const ownIds: string[] = []
                let collection: CommentList = []
                const rqAll = await destinationPost.ref.collection('comments').get()
                while (collection.length < LIMIT_COMMENTS_PER_LOADING
                    && loadedCommentIds.length + collection.length < rqAll.size) {
                    const rq2 = await destinationPost.ref.collection('comments')
                        .orderBy('create_at', 'asc')
                        .limit(LIMIT_COMMENTS_PER_LOADING + loadedCommentIds.length)
                        .get()
                    rq2.docs.map(x => {
                        if (loadedCommentIds.indexOf(x.data().uid) < 0
                            && collection.length < LIMIT_COMMENTS_PER_LOADING) {
                            const data: ExtraComment = { ...x.data() }
                            // x.ref.collection('replies')
                            //     .orderBy('create_at', 'asc').get().then(rq3 => {
                            //         let replies = rq3.docs.map(x2 => {
                            //             if (ownIds.indexOf(x2.data().userId) < 0)
                            //                 ownIds.push(x2.data().userId)
                            //             return x2.data()
                            //         })
                            //         data.replies = replies
                            //     })
                            if (ownIds.indexOf(x.data().userId) < 0)
                                ownIds.push(x.data().userId)
                            collection.push(data)
                        }
                    })
                }
                let ownInfos: UserInfo[] = []
                while (ownIds.length > 0) {
                    const rs = await firestore().collection('users')
                        .where('username', 'in', ownIds.splice(0, 10))
                        .get()
                    const temp: UserInfo[] = rs.docs.map(doc => {
                        return doc.data()
                    })
                    ownInfos = ownInfos.concat(temp)
                }
                collection = collection.map(comment => {
                    comment.ownUser = ownInfos.filter(x => x.username === comment.userId)[0]
                    comment.replies = comment.replies?.map(x => {
                        x.ownUser = ownInfos.filter(x2 => x2.username === x.userId)[0]
                        return x
                    })
                    return comment
                })
                const payload: CommentListWithScroll = {
                    comments: collection,
                    scrollDown: false
                }
                dispatch(LoadMoreCommentListSuccess(payload))
            } else { dispatch(LoadMoreCommentListFailure()) }
        } catch (e) {
            console.warn(e)
            dispatch(LoadMoreCommentListFailure())
        }
    }
}
export const ResetCommentList = () => {
    return {
        type: commentActionTypes.FETCH_COMMENTS_REQUEST,
    }
}
export const LoadMoreCommentListFailure = (): CommentErrorAction => {
    return {
        type: commentActionTypes.LOAD_MORE_COMMENTS_FAILURE,
        payload: {
            message: 'Get Comments Failed!'
        }
    }
}
export const LoadMoreCommentListSuccess = (payload: CommentListWithScroll):
    CommentSuccessAction<CommentListWithScroll> => {
    return {
        type: commentActionTypes.LOAD_MORE_COMMENTS_SUCCESS,
        payload: payload
    }
}
/**
 * TOGGLE LIKE REPLY ACTION
 */
export const ToggleLikeCommentRequest = (commentId: number):
    ThunkAction<Promise<void>, {}, {}, CommentAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, CommentAction>) => {
        try {
            const me = store.getState().user.user.userInfo
            let commentList = [...store.getState().comment.comments]
            const ref = firestore()
            if (me?.username) {
                const username = me.username
                const rq = await ref.collectionGroup('comments')
                    .where('uid', '==', commentId).limit(1).get()
                if (rq.size > 0) {
                    const destinationComment = rq.docs[0]
                    const comment: ExtraComment = destinationComment.data()
                    if (comment.likes) {
                        if (comment.likes?.indexOf(me.username) < 0) {
                            comment.likes.push(username)
                        } else comment.likes.splice(
                            comment.likes.indexOf(username), 1)
                        await destinationComment.ref.update({
                            likes: comment.likes
                        })
                        commentList = commentList.map(xComment => {
                            if (xComment.uid === comment.uid) {
                                const newComment = { ...xComment }
                                newComment.likes = comment.likes
                                return newComment
                            }
                            return xComment
                        })

                        const payload: CommentListWithScroll = {
                            comments: commentList,
                            scrollDown: false
                        }
                        dispatch(ToggleLikeCommentSuccess(payload))
                    }

                } else dispatch(ToggleLikeCommentFailure())


            } else dispatch(ToggleLikeCommentFailure())
        } catch (e) {
            console.warn(e)
            dispatch(ToggleLikeCommentFailure())
        }
    }
}
export const ToggleLikeCommentFailure = (): CommentErrorAction => {
    return {
        type: commentActionTypes.TOGGLE_LIKE_COMMENT_FAILURE,
        payload: {
            message: 'Get Comments Failed!'
        }
    }
}
export const ToggleLikeCommentSuccess = (payload: CommentListWithScroll):
    CommentSuccessAction<CommentListWithScroll> => {
    return {
        type: commentActionTypes.TOGGLE_LIKE_COMMENT_SUCCESS,
        payload: payload
    }
}
/**
 * TOGGLE LIKE COMMMENT ACTION
 */
export const ToggleLikeReplyRequest = (replyId: number, commentId: number):
    ThunkAction<Promise<void>, {}, {}, CommentAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, CommentAction>) => {
        try {
            const me = store.getState().user.user.userInfo
            let commentList = [...store.getState().comment.comments]
            const ref = firestore()
            if (me?.username) {
                const username = me.username
                const rq = await ref.collectionGroup('replies')
                    .where('uid', '==', replyId).limit(1).get()
                if (rq.size > 0) {
                    const destinationReply = rq.docs[0]
                    const reply: ExtraComment = destinationReply.data()
                    if (reply.likes) {
                        if (reply.likes?.indexOf(me.username) < 0) {
                            reply.likes.push(username)
                        } else reply.likes.splice(
                            reply.likes.indexOf(username), 1)
                        await destinationReply.ref.update({
                            likes: reply.likes
                        })
                        commentList = commentList.map(xComment => {
                            if (xComment.uid === commentId) {
                                const newComment = { ...xComment }
                                newComment.replies = xComment.replies?.map(xReply => {
                                    xReply = { ...xReply }
                                    if (xReply.uid === reply.uid) {
                                        xReply.likes = reply.likes
                                    }
                                    return xReply
                                }) || []
                                return newComment
                            }
                            return xComment
                        })

                        const payload: CommentListWithScroll = {
                            comments: commentList,
                            scrollDown: false
                        }
                        dispatch(ToggleLikeReplySuccess(payload))
                    }

                } else dispatch(ToggleLikeReplyFailure())


            } else dispatch(ToggleLikeReplyFailure())
        } catch (e) {
            console.warn(e)
            dispatch(ToggleLikeReplyFailure())
        }
    }
}
export const ToggleLikeReplyFailure = (): CommentErrorAction => {
    return {
        type: commentActionTypes.TOGGLE_LIKE_COMMENT_FAILURE,
        payload: {
            message: 'Get Comments Failed!'
        }
    }
}
export const ToggleLikeReplySuccess = (payload: CommentListWithScroll):
    CommentSuccessAction<CommentListWithScroll> => {
    return {
        type: commentActionTypes.TOGGLE_LIKE_COMMENT_SUCCESS,
        payload: payload
    }
}