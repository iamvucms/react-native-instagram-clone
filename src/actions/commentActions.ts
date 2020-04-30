import { firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { commentActionTypes, seenTypes } from "../constants";
import {
    ExtraComment, Comment, CommentAction,
    CommentErrorAction, CommentList, CommentSuccessAction, CommentExtraList
} from '../reducers/commentReducer';
import { store } from "../store";
import { UserInfo } from '../reducers/userReducer';
import { SetStateAction } from 'react';

export const FetchCommentListRequest = (postId: number):
    ThunkAction<Promise<void>, {}, {}, CommentAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, CommentAction>) => {
        try {
            const ref = firestore()
            const rq = await ref.collection('posts')
                .where('uid', '==', postId).limit(1).get()
            if (rq.docs.length > 0) {
                const destinationPost = rq.docs[0]
                const rq2 = await destinationPost.ref.collection('comments')
                    .orderBy('create_at', 'desc').get()
                const ownIds: string[] = []
                let collection = rq2.docs.map(x => {
                    const data: ExtraComment = { ...x.data() }
                    x.ref.collection('replies')
                        .orderBy('create_at', 'desc').get().then(rq3 => {
                            let replies = rq3.docs.map(x2 => {
                                if (ownIds.indexOf(x2.data().userId) < 0)
                                    ownIds.push(x2.data().userId)
                                return x2.data()
                            })
                            data.replies = replies
                        })
                    if (ownIds.indexOf(x.data().userId) < 0)
                        ownIds.push(x.data().userId)
                    return data
                })
                let ownInfos: UserInfo[] = []
                while (ownIds.length > 0) {
                    const rs = await firestore().collection('users')
                        .where('username', 'in', ownIds.splice(0, 10))
                        .get()
                    const temp = rs.docs.map(doc => {
                        return doc.data()
                    })
                    ownInfos = ownInfos.concat(temp)
                }
                //
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