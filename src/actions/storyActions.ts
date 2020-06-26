import { firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { seenTypes, storyActionTypes, ExtraStory, Story, StoryAction, StoryErrorAction, StoryList, StorySuccessAction } from '../reducers/storyReducer';
import { UserInfo } from '../reducers/userReducer';
import { store } from "../store";
import { StoryProcessedImage } from '../screens/Others/StoryProcessor';

export const FetchStoryListRequest = ():
    ThunkAction<Promise<void>, {}, {}, StoryAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, StoryAction>) => {
        try {
            const ref = firestore()
            const me = store.getState().user.user
            const request = await ref
                .collection('users')
                .doc(me.userInfo?.username)
                .get()
            const result = request.data()
            if (request.exists) {
                const followingList: string[] = result?.followings || []
                let collection: Story[] = []
                const ownIds: string[] = []
                while (followingList.length > 0) {
                    let result = await ref
                        .collection('stories')
                        .where('userId', 'in', followingList.splice(0, 10))
                        .where('create_at', '>=',
                            new Date(new Date().getTime() - 24 * 3600 * 1000))
                        .orderBy('create_at', 'desc')
                        .orderBy('seen', 'asc')
                        .get()
                    const temp: Story[] = result.docs.map(doc => {
                        const data: Story = doc.data() || {}
                        const currentSeenList: string[] = data.seenList || []
                        if (currentSeenList.indexOf(`${me.userInfo?.username}`) > -1) {
                            data.seen = 1
                        } else data.seen = 0
                        if (ownIds.indexOf(`${data.userId}`) < 0)
                            ownIds.push(`${data.userId}`)
                        return data
                    })
                    collection = collection.concat(temp)
                }
                let ownInfos: UserInfo[] = []
                while (ownIds.length > 0) {
                    const result = await ref
                        .collection('users')
                        .where('username', 'in', ownIds.splice(0, 10))
                        .get()
                    ownInfos = ownInfos.concat(result.docs.map(doc => doc.data()))
                }
                const fullStory: StoryList = ownInfos.map(info => {
                    const collectStory: Story[] = collection
                        .filter(story => story.userId == info.username)
                    const extraStory: ExtraStory = {
                        ownUser: info,
                        storyList: collectStory
                    }
                    return extraStory
                })
                fullStory.sort((a, b) => (a.storyList.every(
                    x => x.seen === seenTypes.SEEN) ? 1 : 0) - (b.storyList.every(
                        x => x.seen === seenTypes.SEEN) ? 1 : 0))
                dispatch(FetchStoryListSuccess(fullStory))
            } else dispatch(FetchStoryListFailure())
        } catch (e) {
            console.warn(e)
            dispatch(FetchStoryListFailure())
        }
    }
}
export const FetchStoryListFailure = (): StoryErrorAction => {
    return {
        type: storyActionTypes.FETCH_STORY_LIST_FAILURE,
        payload: {
            message: 'Get Story List Failed!'
        }
    }
}
export const FetchStoryListSuccess = (payload: StoryList): StorySuccessAction => {
    return {
        type: storyActionTypes.FETCH_STORY_LIST_SUCCESS,
        payload: payload
    }
}
export const PostStoryRequest = (images: Story[]):
    ThunkAction<Promise<string[]>, {}, {}, StoryAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, StoryAction>) => {
        try {
            const ref = firestore()
            const me = store.getState().user.user
            const rq = await ref.collection('users')
                .doc(me.userInfo?.username)
                .get()
            if (rq.exists) {
                for (let img of images) {
                    const uid = new Date().getTime()
                    await ref.collection('stories').doc(`${uid}`).set({
                        ...img,
                        uid
                    })
                }
            }
        } catch (e) {
            dispatch({
                type: storyActionTypes.FETCH_STORY_LIST_FAILURE,
                payload: {
                    message: 'Upload images error!'
                }
            })
        }
        return []
    }
}