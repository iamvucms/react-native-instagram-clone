import { firestore } from 'firebase';
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { storyActionTypes, seenTypes } from "../constants";
import { ExtraStory, Story, StoryAction, StoryErrorAction, StoryList, StorySuccessAction } from '../reducers/storyReducer';
import { store } from "../store";
import { UserInfo } from '../reducers/userReducer';
import { SetStateAction } from 'react';

export const FetchStoryListRequest = (setLoadingStoryList?: React.Dispatch<SetStateAction<boolean>>):
    ThunkAction<Promise<void>, {}, {}, StoryAction> => {
    return async (dispatch: ThunkDispatch<{}, {}, StoryAction>) => {
        try {
            const me = store.getState().user.user
            const request = await firestore()
                .collection('users')
                .doc(me.userInfo?.username)
                .get()
            const result = request.data()
            if (result) {
                const followingList: string[] = result.followings
                let collection: Story[] = []
                const ownIds: number[] = []
                while (followingList.length > 0) {
                    let result = await firestore()
                        .collection('stories')
                        .where('userId', 'in', followingList.splice(0, 10))
                        .where('create_at', '>=',
                            new Date(new Date().getTime() - 24 * 3600 * 1000))
                        .orderBy('create_at', 'desc')
                        .orderBy('seen', 'asc')
                        .get()
                    const temp: Story[] = await result.docs.map(doc => {
                        if (ownIds.indexOf(doc.data().userId) < 0)
                            ownIds.push(doc.data().userId)
                        return doc.data()
                    })
                    collection = collection.concat(temp)
                }
                let ownInfos: UserInfo[] = []
                while (ownIds.length > 0) {
                    const result = await firestore()
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
                // fullStory.map((story, index) => {
                //     const isSeen: boolean = story story.storyList.every(
                //         x => x.seen === seenTypes.SEEN)
                //     if (isSeen) {
                //         console.log(story.ownUser.username, index)
                //         // fullStory.splice(index, 1)
                //         fullStory.push(story)
                //     }
                // })
                if (setLoadingStoryList) setLoadingStoryList(false)
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