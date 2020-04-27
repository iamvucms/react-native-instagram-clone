import { firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { postActionTypes } from "../constants";
import {
    ExtraPost, Post, PostAction,
    PostErrorAction, PostList, PostSuccessAction
} from '../reducers/postReducer';
import { store } from "../store";
import { UserInfo } from '../reducers/userReducer';
import { SetStateAction } from 'react';

export const FetchPostListRequest = (setLoadingPostList?: React.Dispatch<SetStateAction<boolean>>):
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
                while (follwingList.length > 0) {
                    const rs = await firestore().collection('posts')
                        .where('userId', 'in', follwingList.splice(0, 10))
                        .orderBy('create_at', 'desc')
                        .get()
                    const temp = rs.docs.map(doc => {
                        if (userIds.indexOf(doc.data().userId) < 0) userIds.push(doc.data().userId)
                        return doc.data()
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
export const FetchPostListSuccess = (payload: PostList): PostSuccessAction => {
    return {
        type: postActionTypes.FETCH_POST_LIST_SUCCESS,
        payload: payload
    }
}