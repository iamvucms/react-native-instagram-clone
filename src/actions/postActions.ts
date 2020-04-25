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

export const FetchPostListRequest = (setLoadingPostList: React.Dispatch<SetStateAction<boolean>>):
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
                console.warn(result.folowings)
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