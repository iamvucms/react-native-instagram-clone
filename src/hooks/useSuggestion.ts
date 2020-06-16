import React, { useState, useRef, useEffect } from "react";
import { Keyboard, EmitterSubscription } from "react-native";
import { useSelector } from "../reducers";
import { firestore } from "firebase";
import { store } from "../store";
import { Post } from "../reducers/postReducer";
import { MixedUserInfo } from "../screens/Home/Account/Follow";
import { UserInfo } from "../reducers/userReducer";
import { ProfileX } from "../reducers/profileXReducer";

/**
 * Returns suggestion follow list
 * 
 * @return {[ExtraSuggestionUserInfo[],
    React.Dispatch<React.SetStateAction<ExtraSuggestionUserInfo[]>>]} isOpen
 */
/**
 * type
 * 1: Recent Interaction but you dont follow,
 * 2: Dont Follow Back
 * 3: Follow by recent interaction follower
 */
export type ExtraSuggestionUserInfo = MixedUserInfo & {
    type: 1 | 2 | 3 | 4,
}
export function useSuggestion(limit?: number): [ExtraSuggestionUserInfo[],
    React.Dispatch<React.SetStateAction<ExtraSuggestionUserInfo[]>>] {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const extraInfo = useSelector(state => state.user.extraInfo)
    const [suggests, setSuggests] = useState<ExtraSuggestionUserInfo[]>([])
    useEffect(() => {
        if (extraInfo) {
            fetchSuggestion()
        }
    }, [extraInfo])
    //DANGEROUS~~!!!!
    const fetchSuggestion = async () => {


        const unSuggestList = [...(extraInfo?.unSuggestList || [])]
        const followerUsrnames = [...(extraInfo?.followers || [])]
        const follwingUsrnames = [...(extraInfo?.followings || [])]
        followerUsrnames.splice(followerUsrnames.indexOf(myUsername || ""), 1)
        follwingUsrnames.splice(follwingUsrnames.indexOf(myUsername || ""), 1)
        const ref = firestore()
        const rq = await ref.collection('users').doc(myUsername).get()
        const myUserData: ProfileX = rq.data() || {}
        const currentBlockList = myUserData.privacySetting?.blockedAccounts?.blockedAccounts || []
        let recentInteractions: string[] = []
        const rs = await ref.collection('posts')
            .where('userId', '==', myUsername)
            .limit(10)
            .orderBy('create_at', 'desc')
            .get()
        rs.docs.map(post => {
            const data: Post = post.data()
            data.likes?.map(usr =>
                recentInteractions.push(usr)
            )
            data.commentList?.map(usr =>
                recentInteractions.push(usr)
            )
        })
        recentInteractions = Array.from(new Set(recentInteractions))
            .filter(usr => usr !== myUsername &&
                follwingUsrnames.indexOf(usr) < 0
                && unSuggestList.indexOf(usr) < 0
                && currentBlockList.indexOf(usr) < 0
            )
        let recentInteractionsForTask = [...recentInteractions]
        if (limit) recentInteractionsForTask = recentInteractionsForTask
            .splice(0, limit - recentInteractions.length)
        const asyncFetchUser = async (userX: string, type: 1 | 2 | 3 | 4) => {
            const rq = await ref.collection('users').doc(userX).get()
            const { username, avatarURL, requestedList, fullname, followings,
                privacySetting: {
                    accountPrivacy
                }
            } = rq.data() as (ExtraSuggestionUserInfo & {
                privacySetting: { accountPrivacy: { private?: boolean } }
            })
            const info: ExtraSuggestionUserInfo = {
                type: type,
                private: accountPrivacy.private || false,
                username,
                fullname,
                followings,
                avatarURL,
                requestedList
            }
            return info
        }
        const recentInteractionTasks: Promise<ExtraSuggestionUserInfo>[] = recentInteractionsForTask
            .map(usr => asyncFetchUser(usr, 1))

        let dontFollowUsrnames = [...followerUsrnames]
            .filter(usr =>
                follwingUsrnames.indexOf(usr) < 0
                && recentInteractionsForTask.indexOf(usr) < 0
                && unSuggestList.indexOf(usr) < 0
                && currentBlockList.indexOf(usr) < 0)

        let dontFolloweUsernameForTask = [...dontFollowUsrnames]
        if (limit) dontFolloweUsernameForTask = dontFolloweUsernameForTask
            .splice(0, limit - recentInteractionsForTask.length)
        const dontFollowBackTasks: Promise<ExtraSuggestionUserInfo>[] = dontFolloweUsernameForTask
            .map(usr => asyncFetchUser(usr, 2))
        Promise.all(recentInteractionTasks
            .concat(dontFollowBackTasks)
        ).then(result => {
            let followedByInteractionList: string[] = []
            result.map(usr => {
                if (usr.type === 1) {
                    followedByInteractionList
                        = followedByInteractionList.concat((usr.followings || []).splice(0, 5))
                }
            })
            followedByInteractionList = Array.from(new Set(followedByInteractionList))
                .filter(usr => usr !== myUsername
                    && follwingUsrnames.indexOf(usr) < 0
                    && recentInteractionsForTask.indexOf(usr) < 0
                    && dontFolloweUsernameForTask.indexOf(usr) < 0
                    && unSuggestList.indexOf(usr) < 0
                    && currentBlockList.indexOf(usr) < 0)
            let followedByInteractionForTask = [...followedByInteractionList]
            if (limit) followedByInteractionForTask = followedByInteractionForTask
                .splice(0, limit - recentInteractionsForTask.length
                    - dontFolloweUsernameForTask.length)
            const followedByInteractionTasks: Promise<ExtraSuggestionUserInfo>[]
                = followedByInteractionForTask
                    .map(usr => asyncFetchUser(usr, 4))

            Promise.all(followedByInteractionTasks).then(result2 => {
                const followerOfFollowingUsernameTasks: Promise<string>[]
                    = follwingUsrnames.map(async userX => {
                        const rq = await ref.collection('users').doc(userX).get()
                        const userData: UserInfo = rq.data() || {}
                        const userFollowings = (userData.followings || [])
                        if (userFollowings.length > 0) {
                            let randomPickusername = userFollowings[
                                Math.floor(Math.random()
                                    * userFollowings.length)]
                            return randomPickusername
                        } else return ''
                    })
                Promise.all(followerOfFollowingUsernameTasks).then(resultTemp => {
                    let followedByFollwers = Array.from(new Set(resultTemp))
                        .filter(usr => usr !== myUsername
                            && usr !== ''
                            && follwingUsrnames.indexOf(usr) < 0
                            && recentInteractionsForTask.indexOf(usr) < 0
                            && dontFolloweUsernameForTask.indexOf(usr) < 0
                            && followedByInteractionForTask.indexOf(usr) < 0
                            && unSuggestList.indexOf(usr) < 0
                            && currentBlockList.indexOf(usr) < 0)
                    if (limit) followedByFollwers = followedByFollwers
                        .splice(0, limit - recentInteractionsForTask.length
                            - dontFolloweUsernameForTask.length
                            - followedByInteractionForTask.length)
                    const followerOfFollowingsTasks: Promise<ExtraSuggestionUserInfo>[] = followedByFollwers
                        .map(usr => asyncFetchUser(usr, 3))
                    Promise.all(followerOfFollowingsTasks).then(result3 => {
                        result = result.concat(result2).concat(result3)
                        result = result.map(usr => {
                            if (usr.requestedList && usr.requestedList.indexOf(myUsername) > -1) {
                                usr.followType = 3
                                return usr
                            }
                            if (follwingUsrnames.indexOf(usr.username || '') > -1) {
                                usr.followType = 1
                            }
                            else usr.followType = 2
                            return usr
                        }).filter(usr => usr.hasOwnProperty('username'))
                        setSuggests(result)
                    })
                })

            })
        })
    }
    return [suggests, setSuggests]
}