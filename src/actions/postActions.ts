import { firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { ExtraComment } from '../reducers/commentReducer';
import { notificationTypes } from '../reducers/notificationReducer';
import { ExtraPost, LIMIT_POSTS_PER_LOADING, Post, PostAction, postActionTypes, PostErrorAction, PostList, PostSuccessAction } from '../reducers/postReducer';
import { HashTag, UserInfo } from '../reducers/userReducer';
import { store } from "../store";
import { generateUsernameKeywords, Timestamp } from '../utils';
import { LoadMoreCommentListSuccess } from './commentActions';
import { CreateNotificationRequest } from './notificationActions';

export const FetchPostListRequest = ():
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            const me = store.getState().user.user
            const request = await firestore()
                .collection('users')
                .doc(me.userInfo?.username)
                .get()

            const result: UserInfo = request.data() || {}
            if (result) {
                const follwingList: string[] = result.followings || []
                const userIds: string[] = []
                let collection: Post[] = []
                while (follwingList.length > 0
                    && collection.length < LIMIT_POSTS_PER_LOADING) {
                    const rs = await firestore().collection('posts')
                        .where('userId', 'in', follwingList.splice(0, 10))
                        .orderBy('create_at', 'desc')
                        .limit(LIMIT_POSTS_PER_LOADING - collection.length)
                        .get()
                    const temp = rs.docs.map(doc => {
                        if (userIds.indexOf(doc.data().userId) < 0) userIds.push(doc.data().userId)

                        let post = { ...doc.data() }
                        const rqCmt = doc.ref.collection('comments')
                            .orderBy('create_at', 'desc').get()
                        rqCmt.then(rsx => {
                            post.comments = rsx.docs.map(docx => docx.data())
                        })
                        return post
                    })
                    collection = collection.concat(temp)
                }
                let ownInfos: UserInfo[] = []
                while (userIds.length > 0) {
                    const rs = await firestore().collection('users')
                        .where('username', 'in', userIds.splice(0, 10))
                        .get()
                    const temp = rs.docs.map(doc => {
                        return doc.data()
                    })
                    ownInfos = ownInfos.concat(temp)
                }
                const extraPostList: PostList = collection.map((post, index) => {
                    const extraPost: ExtraPost = Object.assign(post, {
                        ownUser: ownInfos.filter(x => x.username === post.userId)[0]
                    })
                    return extraPost
                })
                dispatch(FetchPostListSuccess(extraPostList))
            } else dispatch(FetchPostListFailure())
        } catch (e) {
            console.warn(e)
            dispatch(FetchPostListFailure())
        }
    }
}
export const FetchPostListFailure = (): PostErrorAction => {
    return {
        type: postActionTypes.FETCH_POST_LIST_FAILURE,
        payload: {
            message: 'Get Post List Failed!'
        }
    }
}
export const FetchPostListSuccess = (payload: PostList): PostSuccessAction<PostList> => {
    return {
        type: postActionTypes.FETCH_POST_LIST_SUCCESS,
        payload: payload
    }
}
/**
 * LOADING MORE ACTIONS 
 */
export const LoadMorePostListRequest = ():
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            const me = store.getState().user.user
            const request = await firestore()
                .collection('users')
                .doc(me.userInfo?.username)
                .get()
            const result = request.data()
            const loadedUids = store.getState().postList
                .map(post => post.uid).filter(id => id !== undefined)

            if (result) {
                const follwingList: string[] = result.followings
                const userIds: string[] = []
                let collection: Post[] = []
                while (follwingList.length > 0
                    && collection.length < LIMIT_POSTS_PER_LOADING) {
                    const rs = await firestore().collection('posts')
                        .where('userId', 'in', follwingList.splice(0, 10))
                        .orderBy('create_at', 'desc')
                        .limit(LIMIT_POSTS_PER_LOADING + loadedUids.length)
                        .get()
                    rs.docs.map(doc => {
                        if (loadedUids.indexOf(doc.data().uid) < 0
                            && collection.length < LIMIT_POSTS_PER_LOADING) {
                            if (userIds.indexOf(doc.data().userId) < 0)
                                userIds.push(doc.data().userId)
                            let post = { ...doc.data() }
                            doc.ref.collection('comments')
                                .orderBy('create_at', 'desc').get().then(rqCmt => {
                                    post.comments = rqCmt.docs.map(docx => docx.data())
                                    if (collection.length < LIMIT_POSTS_PER_LOADING)
                                        collection.push(post)
                                })
                        }
                    })
                }

                let ownInfos: UserInfo[] = []
                while (userIds.length > 0) {
                    const usernames = userIds.splice(0, 10)
                    const rs = await firestore().collection('users')
                        .where('username', 'in', usernames)
                        .get()
                    const temp = rs.docs.map(doc => {
                        return doc.data()
                    })
                    ownInfos = ownInfos.concat(temp)
                }
                const extraPostList: PostList = collection.map((post, index) => {
                    const extraPost: ExtraPost = Object.assign(post, {
                        ownUser: ownInfos.filter(x => x.username === post.userId)[0]
                    })
                    return extraPost
                })
                dispatch(LoadMorePostListSuccess(extraPostList))
            } else dispatch(LoadMorePostListFailure())
        } catch (e) {
            dispatch(LoadMorePostListFailure())
        }
    }
}
export const LoadMorePostListFailure = (): PostErrorAction => {
    return {
        type: postActionTypes.LOAD_MORE_POST_LIST_FAILURE,
        payload: {
            message: 'Can not load more posts!'
        }
    }
}
export const LoadMorePostListSuccess = (payload: PostList): PostSuccessAction<PostList> => {
    return {
        type: postActionTypes.LOAD_MORE_POST_LIST_SUCCESS,
        payload: payload
    }
}
/**
 * POST COMMENTS ACTIONS
 */
export const PostCommentRequest = (postId: number,
    content: string,
    postData?: ExtraPost,
    setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>):
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            const me = store.getState().user.user
            let postList = [...store.getState().postList]
            const ref = firestore()
            const rq = await ref.collection('posts').where('uid', '==', postId).get()
            if (rq.size > 0) {
                const targetPost = rq.docs[0]
                let commentList = targetPost.data().commentList || []
                if (commentList.length > 0 && commentList.indexOf(me.userInfo?.username) < 0) {
                    commentList.push(me.userInfo?.username)
                } else commentList = [me.userInfo?.username]
                targetPost.ref.update({
                    commentList
                })

                const uid = new Date().getTime()
                targetPost.ref.collection('comments').doc(`${uid}`).set({
                    uid: uid,
                    content,
                    likes: [],
                    userId: me.userInfo?.username,
                    create_at: new Date()
                })
                //ADD NOTIFICATION
                if (targetPost.data().userId !== me.userInfo?.username) {
                    const notificationList = targetPost.data().notificationUsers || []
                    const myIndex = notificationList.indexOf(me.userInfo?.username || '')
                    if (myIndex > -1) notificationList.splice(myIndex, 1)
                    dispatch(CreateNotificationRequest({
                        postId,
                        replyId: 0,
                        commentId: uid,
                        userId: notificationList,
                        from: me.userInfo?.username,
                        create_at: Timestamp(),
                        type: notificationTypes.COMMENT_MY_POST
                    }))
                }
                const rq2 = await targetPost.ref.collection('comments')
                    .orderBy('create_at', 'desc').get()
                if (postData && setPost) {
                    const post = { ...postData }
                    post.comments = rq2.docs.map(x => x.data())
                    setPost(post)
                } else {
                    postList = postList.map((post) => {
                        if (post.uid === postId) {
                            post = { ...post }
                            post.comments = rq2.docs.map(x => x.data())
                        }
                        return post
                    })
                    const comment: ExtraComment = rq2.docs[0].data()
                    comment.ownUser = me.userInfo
                    const payload = {
                        comments: [comment],
                        scrollDown: true
                    }
                    dispatch(LoadMoreCommentListSuccess(payload))
                    dispatch(PostCommentSuccess(postList))
                }

            } else {
                dispatch(PostCommentFailure())
            }
        } catch (e) {
            console.warn(e)
            dispatch(PostCommentFailure())
        }
    }
}
export const PostCommentFailure = (): PostErrorAction => {
    return {
        type: postActionTypes.COMMENT_POST_FAILURE,
        payload: {
            message: 'Can not load more posts!'
        }
    }
}
export const PostCommentSuccess = (payload: PostList): PostSuccessAction<PostList> => {
    return {
        type: postActionTypes.COMMENT_POST_SUCCESS,
        payload: payload
    }
}

/**
 * TOGGLE LIKE POST ACTIONS
 */
export const ToggleLikePostRequest = (postId: number,
    postData?: ExtraPost,
    setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>):
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            const me = store.getState().user.user
            let postList = [...store.getState().postList]
            const ref = firestore()
            const rq = await ref.collection('posts').where('uid', '==', postId).get()
            if (rq.docs.length > 0) {
                const targetPost: Post = rq.docs[0].data() || {}
                const index = (targetPost.likes || []).indexOf(
                    me.userInfo?.username || '')
                if (index > -1) {
                    targetPost.likes?.splice(index, 1)
                } else targetPost.likes?.push(me.userInfo?.username || '')
                rq.docs[0].ref.update({
                    likes: targetPost.likes
                })
                if (postData && setPost) {
                    const post = { ...postData, likes: targetPost.likes }
                    setPost(post)
                } else {
                    postList = postList.map((post) => {
                        if (post.uid === postId) {
                            post = { ...post, likes: targetPost.likes }
                        }
                        return post
                    })
                    dispatch(ToggleLikePostSuccess(postList))
                }
                if (targetPost.userId !== me.userInfo?.username
                ) {
                    const notificationList = targetPost.notificationUsers || []
                    const myIndex = notificationList.indexOf(me.userInfo?.username || '')
                    if (myIndex > -1) notificationList.splice(myIndex, 1)
                    if (notificationList.length > 0) {
                        if (index < 0)
                            dispatch(CreateNotificationRequest({
                                postId,
                                commentId: 0,
                                replyId: 0,
                                userId: notificationList,
                                from: me.userInfo?.username,
                                create_at: Timestamp(),
                                type: notificationTypes.LIKE_MY_POST
                            }))
                        else dispatch(CreateNotificationRequest({
                            isUndo: true,
                            postId,
                            commentId: 0,
                            replyId: 0,
                            userId: notificationList,
                            from: me.userInfo?.username,
                            create_at: Timestamp(),
                            type: notificationTypes.LIKE_MY_POST
                        }))
                    }
                }
            } else {
                dispatch(ToggleLikePostFailure())
            }
        } catch (e) {
            dispatch(ToggleLikePostFailure())
        }
    }
}
export const ToggleLikePostFailure = (): PostErrorAction => {
    return {
        type: postActionTypes.TOGGLE_LIKE_POST_FAILURE,
        payload: {
            message: 'Can not load more posts!'
        }
    }
}
export const ToggleLikePostSuccess = (payload: PostList): PostSuccessAction<PostList> => {
    return {
        type: postActionTypes.TOGGLE_LIKE_POST_SUCCESS,
        payload: payload
    }
}
//CREATE POST ACTION
export const CreatePostRequest = (postData: Post):
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            const me = store.getState().user.user.userInfo
            const ref = firestore()
            const rq = await ref.collection('users')
                .where('username', '==', me?.username).get()
            const uid = new Date().getTime()
            if (rq.size > 0) {
                const poster: UserInfo = rq.docs[0].data()
                ref.collection('posts').doc(`${uid}`).set({
                    ...postData,
                    uid
                })
                dispatch(FetchPostListRequest())
            } else {
                dispatch(CreatePostFailure())
            }
            const regex = /\#\w+/gm
            const str = postData.content || ''
            let m
            let hashTagList: string[] = []
            while ((m = regex.exec(str)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++
                }
                m.forEach((match, groupIndex) => {
                    hashTagList.push(match)
                })
            }
            hashTagList = Array.from(new Set(hashTagList))
            hashTagList.map(async hashtag => {
                const rq = await ref.collection('hashtags')
                    .where('name', '==', hashtag).get()
                if (rq.size > 0) {
                    const targetHashtag = rq.docs[0]
                    const data: HashTag = targetHashtag.data() || {}
                    const sources = (data.sources || [])
                    sources.push(uid)
                    targetHashtag.ref.update({
                        sources
                    })
                } else {
                    const keyword = generateUsernameKeywords(hashtag)
                    keyword.splice(0, 1)
                    const fetchRelatedTags: Promise<string[]>[] = keyword.map(async character => {
                        const rq = await ref.collection('hashtags').
                            where('keyword', 'array-contains', character).get()
                        const data: HashTag[] = rq.docs.map(x => x.data() || {})
                        return data.map(x => x.name || '')
                    })
                    Promise.all(fetchRelatedTags).then(rs => {
                        let relatedTags: string[] = []
                        rs.map(lv1 => {
                            lv1.map(x => relatedTags.push(x))
                        })
                        relatedTags = Array.from(new Set(relatedTags))
                        const hashtagUid = new Date().getTime()
                        ref.collection('hashtags').doc(hashtag).set({
                            name: hashtag,
                            followers: [],
                            keyword,
                            relatedTags,
                            sources: [uid],
                            uid: hashtagUid
                        })
                    })
                }
            })
        } catch (e) {
            dispatch(CreatePostFailure())
        }
    }
}
export const CreatePostFailure = (): PostErrorAction => {
    return {
        type: postActionTypes.CREATE_POST_FAILURE,
        payload: {
            message: 'Can not post this post!'
        }
    }
}
// export const CreatePostSuccess = (payload: PostList): PostSuccessAction<PostList> => {
//     return {
//         type: postActionTypes.CREATE_POST_SUCCESS,
//         payload: payload
//     }
// }
//UPDATE POST ACTION
export const UpdatePostRequest = (uid: number, updatedData: ExtraPost):
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            const me = store.getState().user.user.userInfo
            let postList = [...store.getState().postList]
            const ref = firestore()
            const rq = await ref.collection('users')
                .where('username', '==', me?.username).get()
            const rq2 = await ref.collection('posts').doc(`${uid}`).get()
            const posts = postList.filter(p => p.uid === uid)
            if (rq.size > 0 && rq2.exists && posts.length > 0) {
                let onlinePost: ExtraPost = rq2.data() || {}
                const targetPost = { ...posts[0] }
                rq2.ref.update({
                    ...onlinePost, ...updatedData
                }).then(() => {
                    dispatch(UpdatePostSuccess({
                        ownUser: targetPost.ownUser
                        , ...onlinePost, ...updatedData
                    }))
                })
                    .catch((err) => {
                        dispatch(UpdatePostFailure())
                    })

            } else {
                dispatch(UpdatePostFailure())
            }
        } catch (e) {
            dispatch(UpdatePostFailure())
        }
    }
}
export const UpdatePostFailure = (): PostErrorAction => {
    return {
        type: postActionTypes.UPDATE_POST_FAILURE,
        payload: {
            message: 'Can not update post now!'
        }
    }
}
export const UpdatePostSuccess = (payload: ExtraPost): PostSuccessAction<ExtraPost> => {
    return {
        type: postActionTypes.UPDATE_POST_SUCCESS,
        payload: payload
    }
}
