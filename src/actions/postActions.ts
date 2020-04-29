import { firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { postActionTypes, LIMIT_PER_LOADING } from "../constants";
import {
    ExtraPost, Post, PostAction,
    PostErrorAction, PostList, PostSuccessAction
} from '../reducers/postReducer';
import { store } from "../store";
import { UserInfo } from '../reducers/userReducer';
import { SetStateAction } from 'react';

export const FetchPostListRequest = ():
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            const me = store.getState().user.user
            const request = await firestore()
                .collection('users')
                .doc(me.userInfo?.username)
                .get()
            const result = request.data()
            if (result) {
                const follwingList: string[] = result.followings
                const userIds: string[] = []
                let collection: Post[] = []
                while (follwingList.length > 0
                    && collection.length < LIMIT_PER_LOADING) {
                    const rs = await firestore().collection('posts')
                        .where('userId', 'in', follwingList.splice(0, 10))
                        .orderBy('create_at', 'desc')
                        .limit(LIMIT_PER_LOADING - collection.length)
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
                        ownUser: ownInfos[index]
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
                    && collection.length < LIMIT_PER_LOADING) {
                    const rs = await firestore().collection('posts')
                        .where('userId', 'in', follwingList.splice(0, 10))
                        .orderBy('create_at', 'desc')
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
                    }).filter(post => loadedUids.indexOf(post.uid) < 0)
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
                        ownUser: ownInfos[index]
                    })
                    return extraPost
                })
                dispatch(LoadMorePostListSuccess(extraPostList))
            } else dispatch(LoadMorePostListFailure())
        } catch (e) {
            console.warn(e)
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
export const PostCommentRequest = ():
    ThunkAction<Promise<void>, {}, {}, PostAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, PostAction>) => {
        try {
            // dispatch(PostCommentSuccess())
        } catch (e) {
            console.warn(e)
            dispatch(PostCommentFailure())
        }
    }
}
export const PostCommentFailure = (): PostErrorAction => {
    return {
        type: postActionTypes.LOAD_MORE_POST_LIST_FAILURE,
        payload: {
            message: 'Can not load more posts!'
        }
    }
}
export const PostCommentSuccess = (payload: ExtraPost): PostSuccessAction<ExtraPost> => {
    return {
        type: postActionTypes.LOAD_MORE_POST_LIST_SUCCESS,
        payload: payload
    }
}
