import { firestore } from 'firebase'
import React, { useEffect, useState } from 'react'
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { ConfirmFollowRequest, DeclineFollowRequest, FetchExtraInfoRequest, ToggleFollowUserRequest, ToggleSendFollowRequest, UnSuggestionRequest } from '../../../actions/userActions'
import NavigationBar from '../../../components/NavigationBar'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { Post } from '../../../reducers/postReducer'
import { UserInfo } from '../../../reducers/userReducer'
import { store } from '../../../store'
import { MixedUserInfo } from './Follow'
/**
 * type
 * 1: Recent Interaction but you dont follow,
 * 2: Dont Follow Back
 * 3: Follow by recent interaction follower
 */
type ExtraSuggestionUserInfo = MixedUserInfo & {
    type: 1 | 2 | 3 | 4,
}
const FollowRequests = () => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const dispatch = useDispatch()
    const extraInfo = useSelector(state => state.user.extraInfo)
    const [requests, setRequests] = useState<UserInfo[]>([])
    const [suggests, setSuggests] = useState<ExtraSuggestionUserInfo[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        dispatch(FetchExtraInfoRequest())

    }, [])
    useEffect(() => {
        if (extraInfo?.requestedList) {
            const requestUsernames = [...extraInfo.requestedList]
            const ref = firestore()
            const tasks: Promise<UserInfo>[] = requestUsernames.map(async usr => {
                const rq = await ref.collection('users').doc(usr).get()
                const userData = rq.data() || {}
                return userData
            })
            Promise.all(tasks).then(result => {
                setRequests(result)
            })
        }
    }, [extraInfo?.requestedList])
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
            )
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
        const recentInteractionTasks: Promise<ExtraSuggestionUserInfo>[] = recentInteractions
            .map(usr => asyncFetchUser(usr, 1))

        const dontFollowUsrnames = [...followerUsrnames]
            .filter(usr =>
                follwingUsrnames.indexOf(usr) < 0
                && recentInteractions.indexOf(usr) < 0
                && unSuggestList.indexOf(usr) < 0)
        const dontFollowBackTasks: Promise<ExtraSuggestionUserInfo>[] = dontFollowUsrnames
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
                    && recentInteractions.indexOf(usr) < 0
                    && dontFollowUsrnames.indexOf(usr) < 0
                    && unSuggestList.indexOf(usr) < 0)
            const followedByInteractionTasks: Promise<ExtraSuggestionUserInfo>[]
                = followedByInteractionList
                    .map(usr => asyncFetchUser(usr, 4))
            Promise.all(followedByInteractionTasks).then(result2 => {
                const followerOfFollowingsTasks: Promise<ExtraSuggestionUserInfo>[] = follwingUsrnames
                    .map(async userX => {
                        const rq = await ref.collection('users').doc(userX).get()
                        const userData: UserInfo = rq.data() || {}
                        const userFollowings = (userData.followings || [])
                            .filter(usr => usr !== myUsername
                                && follwingUsrnames.indexOf(usr) < 0
                                && recentInteractions.indexOf(usr) < 0
                                && followedByInteractionList.indexOf(usr) < 0
                                && dontFollowUsrnames.indexOf(usr) < 0
                                && unSuggestList.indexOf(usr) < 0)
                        if (userFollowings.length > 0) {
                            let randomPickusername = userFollowings[
                                Math.floor(Math.random()
                                    * userFollowings.length)]
                            const rq2 = await ref.collection('users').doc(randomPickusername).get()
                            const { username, avatarURL,
                                requestedList, fullname,
                                followings, privacySetting: {
                                    accountPrivacy
                                }
                            } = rq2.data() as (ExtraSuggestionUserInfo & {
                                privacySetting: { accountPrivacy: { private?: boolean } }
                            })
                            const info: ExtraSuggestionUserInfo = {
                                type: 3,
                                private: accountPrivacy.private || false,
                                username,
                                fullname,
                                followings,
                                avatarURL,
                                requestedList
                            }
                            return info
                        } else return {} as ExtraSuggestionUserInfo
                    })
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
                    setLoading(false)
                })

            })
        })

    }
    const _onToggleFollow = (index: number) => {
        let temp = [...suggests]
        if (temp[index].followType === 1) {
            dispatch(ToggleFollowUserRequest(temp[index].username || ''))
            temp[index].followType = 2
        } else if (temp[index].followType === 2) {
            if (temp[index].private) {
                dispatch(ToggleSendFollowRequest(temp[index].username || ''))
                temp[index].followType = 3
            } else {
                dispatch(ToggleFollowUserRequest(temp[index].username || ''))
                temp[index].followType = 1
            }
        } else {
            dispatch(ToggleSendFollowRequest(temp[index].username || ''))
            temp[index].followType = 2
        }
        setSuggests(temp)
    }
    const _onRefresh = () => {
        setLoading(true)
        dispatch(FetchExtraInfoRequest())
    }
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="Follow Requests"
                callback={goBack}
            />
            <FlatList
                refreshing={loading}
                onRefresh={_onRefresh}
                ListHeaderComponent={
                    <FlatList
                        data={requests}
                        renderItem={({ item, index }) =>
                            <RequestItem {...{ item, index }} />
                        }
                        keyExtractor={(item, index) => `${index}`}
                    />
                }
                data={suggests}
                renderItem={({ item, index }) =>
                    <>
                        {index === 0 &&
                            <Text style={{
                                margin: 15,
                                fontSize: 16,
                                fontWeight: '500'
                            }}>Suggestion for you</Text>
                        }
                        <SuggestItem   {...{
                            item, index,
                            onToggleFollow: _onToggleFollow
                        }} />
                    </>
                }
                keyExtractor={(item, index) => `${index}`}
            />
            <View>

            </View>
        </SafeAreaView>
    )
}

export default FollowRequests

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        paddingHorizontal: 15
    },
    infoWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    requestAvatar: {
        marginRight: 10,
        height: 40,
        width: 40,
        borderRadius: 20,
        borderColor: "#333",
        borderWidth: 0.3
    },
    requestBtnGroups: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    btnRequest: {
        borderColor: '#ddd',
        width: 80,
        height: 24,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnFollow: {
        borderColor: '#ddd',
        width: 100,
        height: 30,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
const RequestItem = ({ item, index }: { item: UserInfo, index: number }) => {
    const dispatch = useDispatch()
    const _onDeleteRequest = () => {
        dispatch(DeclineFollowRequest(item.username || ""))
    }
    const _onConfirmRequest = () => {
        dispatch(ConfirmFollowRequest(item.username || ""))
    }
    return (
        <TouchableOpacity
            onPress={() => navigate('ProfileX', {
                username: item.username
            })}
            style={styles.requestItem}>
            <View style={styles.infoWrapper}>
                <Image
                    style={styles.requestAvatar}
                    source={{
                        uri: item.avatarURL
                    }} />
                <View>
                    <Text style={{
                        fontWeight: '600'
                    }}>{item.username}</Text>
                    <Text style={{
                        fontWeight: '600', color: '#666'
                    }}>{item.fullname}</Text>
                </View>
            </View>
            <View style={styles.requestBtnGroups}>
                <TouchableOpacity
                    onPress={_onConfirmRequest}
                    style={{
                        ...styles.btnRequest,
                        backgroundColor: '#318bfb'
                    }}>
                    <Text style={{
                        fontWeight: '600',
                        color: '#fff'
                    }}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={_onDeleteRequest}
                    style={{
                        ...styles.btnRequest,
                        borderWidth: 1,
                        marginLeft: 5,
                    }}>
                    <Text style={{ fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}
const SuggestItem = ({ item, index, onToggleFollow }: { onToggleFollow: (index: number) => void, item: ExtraSuggestionUserInfo, index: number }) => {
    const dispatch = useDispatch()
    const _onUnSuggestion = () => {
        dispatch(UnSuggestionRequest(item.username || ''))
    }
    return (
        <TouchableOpacity
            onPress={() => navigate('ProfileX', {
                username: item.username
            })}
            style={styles.requestItem}>
            <View style={styles.infoWrapper}>
                <Image
                    style={styles.requestAvatar}
                    source={{
                        uri: item.avatarURL
                    }} />
                <View>
                    <Text style={{
                        fontWeight: '600'
                    }}>{item.username}</Text>
                    <Text style={{
                        fontWeight: '600', color: '#666'
                    }}>{item.fullname}</Text>
                    {item.type !== 4 &&
                        <Text style={{
                            color: '#666'
                        }}>{item.type === 1 ? 'Recent Interacted With You' : (
                            item.type === 2 ? 'Follows You' : (
                                item.type === 3 ? 'Followed by your followings' : ''
                            )
                        )}</Text>
                    }
                </View>
            </View>
            <View style={styles.requestBtnGroups}>
                <TouchableOpacity
                    onPress={() => onToggleFollow(index)}
                    style={{
                        ...styles.btnFollow,
                        ...(item.followType === 1 || item.followType === 3 ? {
                            borderWidth: 1
                        } : {
                                borderWidth: 0,
                                backgroundColor: '#318bfb'
                            }
                        )
                    }}>
                    <Text style={{
                        fontWeight: '600',
                        color: (item.followType === 1 || item.followType === 3)
                            ? '#000' : '#fff'
                    }}>{item.followType === 1 ? 'Following' : (
                        item.followType === 2 ? 'Follow' : 'Requested'
                    )}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={_onUnSuggestion}
                    style={{
                        marginLeft: 15,
                    }}>
                    <Text>✕</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}