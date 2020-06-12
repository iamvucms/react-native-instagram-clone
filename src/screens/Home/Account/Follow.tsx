import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useRef, useEffect, useState } from 'react'
import { Animated, Image, FlatList, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../../constants'
import { goBack, navigate, dispatch } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { UserInfo } from '../../../reducers/userReducer'
import { firestore } from 'firebase'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'
import { FetchExtraInfoRequest, ToggleFollowUserRequest, RemoveFollowerRequest, UnfollowRequest, ToggleSendFollowRequest } from '../../../actions/userActions'
import { Post } from '../../../reducers/postReducer'
type FollowRouteProp = RouteProp<{
    Follow: {
        type: 1 | 2
    }
}, 'Follow'>

type FollowNavigationProp = StackNavigationProp<{
    Follow: {
        type: 1 | 2
    }
}, 'Follow'>

type FollowProps = {
    navigation: FollowNavigationProp,
    route: FollowRouteProp
}
/**
 * followType
 * 1:Following
 * 2:Aren't Following
 * 3:Requested
 */
export type MixedUserInfo = UserInfo & {
    followType?: 1 | 2 | 3,
    private: boolean
}
const Follow = ({ route }: FollowProps) => {
    const dispatch = useDispatch()
    const type = route.params.type
    const user = useSelector(state => state.user)
    const extraInfo = user.extraInfo
    const [followerQuery, setFollowerQuery] = useState<string>('')
    const [followingQuery, setFollowingQuery] = useState<string>('')
    const [dontFollowBackList, setDontFollowBackList] = useState<UserInfo[]>([])
    const [recentFollowerInteractionList, setRecentFollowerInteractionList]
        = useState<UserInfo[]>([])
    const [recentFollowingsInteractionList, setRecentFollowingsInteractionList]
        = useState<UserInfo[]>([])
    const username = user.user.userInfo?.username
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [selectedUnfollowIndex, setSelectedUnfollowIndex] = useState<number>(-1)
    const [selectedFollowingIndex, setSelectedFollowingIndex] = useState<number>(-1)
    const [followers, setFollowers] = useState<MixedUserInfo[]>([])
    const [followersRenderList, setFollowersRenderList] = useState<MixedUserInfo[]>([])
    const [follwings, setFollowings] = useState<MixedUserInfo[]>([])
    const [follwingsRenderList, setFollowingsRenderList] = useState<MixedUserInfo[]>([])
    const [lastRequest, setLastRequest] = useState<UserInfo>({})
    const _scrollRef = useRef<ScrollView>(null)
    const _tabLineOffsetX = React.useMemo(() =>
        new Animated.Value((type - 1) * SCREEN_WIDTH / 2), [])
    const ref = useRef<{
        followerQueryTimeout: NodeJS.Timeout,
        followingQueryTimeout: NodeJS.Timeout,
        currentTab: 1 | 2
    }>({
        currentTab: type,
        followerQueryTimeout: setTimeout(() => { }, 0),
        followingQueryTimeout: setTimeout(() => { }, 0)
    })
    useEffect(() => {
        if (type === 2) {
            _scrollRef.current?.scrollTo({
                y: 0,
                x: SCREEN_WIDTH,
                animated: false
            })
        }
        dispatch(FetchExtraInfoRequest())
    }, [])
    useEffect(() => {
        clearTimeout(ref.current.followerQueryTimeout)
        if (followerQuery.length > 0) {
            ref.current.followerQueryTimeout = setTimeout(() => {
                const temp = [...followers].filter(usr => usr.username
                    && usr.username.indexOf(followerQuery.toLowerCase()) > -1)
                setFollowersRenderList(temp)
            }, 300);
        } else setFollowersRenderList([...followers])
    }, [followerQuery])

    useEffect(() => {
        clearTimeout(ref.current.followingQueryTimeout)
        if (followingQuery.length > 0) {
            ref.current.followingQueryTimeout = setTimeout(() => {
                const temp = [...follwings].filter(usr => usr.username
                    && usr.username.indexOf(followingQuery.toLowerCase()) > -1)
                setFollowingsRenderList(temp)
            }, 300);
        } else setFollowingsRenderList([...follwings])
    }, [followingQuery])

    useEffect(() => {
        if (extraInfo) {
            const requestedUsrname = [...extraInfo.requestedList].pop()

            const followerUsrnames = [...extraInfo.followers]
            const follwingUsrnames = [...extraInfo.followings]
            const dontFollowUsrnames = [...followerUsrnames.filter(usr =>
                follwingUsrnames.indexOf(usr) < 0)]
            followerUsrnames.splice(extraInfo.followers.indexOf(username || ""), 1)
            follwingUsrnames.splice(extraInfo.followings.indexOf(username || ""), 1)
            const ref = firestore()
            if (requestedUsrname) {
                ref.collection('users').doc(requestedUsrname).get().then(rs => {
                    setLastRequest(rs.data() || {})
                })
            }
            const taskFollowers: Promise<MixedUserInfo & {
                requestedList: string[]
            }>[] = followerUsrnames.map(async userX => {
                const rq = await ref.collection('users').doc(userX).get()
                const { username, avatarURL, requestedList, privacySetting: {
                    accountPrivacy
                } } = rq.data() as (MixedUserInfo & {
                    requestedList?: string[],
                    privacySetting: { accountPrivacy: { private?: boolean } }
                })
                const info = {
                    private: accountPrivacy.private || false,
                    username,
                    avatarURL,
                    requestedList: requestedList || []
                }
                return info
            })
            Promise.all(taskFollowers).then(result => {
                result = result.map(usr => {
                    if (usr.requestedList.indexOf(username || '') > -1) {
                        usr.followType = 3
                        return usr
                    }
                    if (follwingUsrnames.indexOf(usr.username || '') > -1) {
                        usr.followType = 1
                    }
                    else usr.followType = 2
                    return usr
                })
                const dontFollowBackUsers = [...result.filter(usr =>
                    dontFollowUsrnames.indexOf(usr.username || '') > -1
                )]
                setDontFollowBackList(dontFollowBackUsers)
                setFollowers(result)
                setFollowersRenderList(result)
                ref.collection('posts')
                    .where('userId', '==', username)
                    .limit(10)
                    .orderBy('create_at', 'desc')
                    .get().then(rs => {
                        let interactionList: string[] = []
                        rs.docs.map(post => {
                            const data: Post = post.data()
                            data.likes?.map(usr =>
                                interactionList.push(usr)
                            )
                            data.commentList?.map(usr =>
                                interactionList.push(usr)
                            )
                        })
                        interactionList = Array.from(new Set(interactionList))
                        const temp = [...result.filter(usr =>
                            interactionList.indexOf(usr.username || '') > -1
                        )]
                        setRecentFollowerInteractionList(temp)
                    })
            })

            const taskFollowings: Promise<MixedUserInfo & {
                requestedList: string[]
            }>[] = follwingUsrnames.map(async userX => {
                const rq = await ref.collection('users').doc(userX).get()
                const { username, avatarURL, requestedList, privacySetting: {
                    accountPrivacy
                } } = rq.data() as (MixedUserInfo & {
                    requestedList?: string[],
                    privacySetting: { accountPrivacy: { private?: boolean } }
                })
                const info = {
                    private: accountPrivacy.private || false,
                    username,
                    avatarURL,
                    requestedList: requestedList || []
                }
                return info
            })
            Promise.all(taskFollowings).then(result => {
                result = result.map(usr => {
                    if (usr.requestedList.indexOf(username || '') > -1) {
                        usr.followType = 3
                        return usr
                    }
                    if (follwingUsrnames.indexOf(usr.username || '') > -1) {
                        usr.followType = 1
                    }
                    else usr.followType = 2
                    return usr
                })
                setFollowings(result)
                setFollowingsRenderList(result)
                ref.collection('posts')
                    .where('likes', 'array-contains', username)
                    .limit(10)
                    .orderBy('create_at', 'desc')
                    .get().then(rs => {
                        let interactionList: string[] = []
                        rs.docs.map(post => {
                            const data: Post = post.data()
                            interactionList.push(data.userId || '')
                        })
                        ref.collection('posts')
                            .where('commentList', 'array-contains', username)
                            .limit(10)
                            .orderBy('create_at', 'desc')
                            .get().then(rs => {
                                let interactionList: string[] = []
                                rs.docs.map(post => {
                                    const data: Post = post.data()
                                    interactionList.push(data.userId || '')
                                })
                                interactionList = Array.from(new Set(interactionList))
                                const temp = [...result.filter(usr =>
                                    interactionList.indexOf(usr.username || '') > -1
                                )]
                                setRecentFollowingsInteractionList(temp)
                            })
                    })
            })
        }
    }, [extraInfo])

    const _onSwitchTab = (type: 1 | 2) => {
        if (type === 2 && ref.current.currentTab === 1) {
            ref.current.currentTab = type
            _scrollRef.current?.scrollTo({
                y: 0,
                x: SCREEN_WIDTH,
                animated: true
            })
            return Animated.timing(_tabLineOffsetX, {
                toValue: SCREEN_WIDTH / 2,
                useNativeDriver: false,
                duration: 200
            }).start()
        }
        if (type === 1 && ref.current.currentTab === 2) {
            ref.current.currentTab = type
            _scrollRef.current?.scrollTo({
                y: 0,
                x: 0,
                animated: true
            })
            return Animated.timing(_tabLineOffsetX, {
                toValue: 0,
                useNativeDriver: false,
                duration: 200
            }).start()
        }
    }
    const _onScrollEndDrag = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (x > SCREEN_WIDTH / 2) {
            _scrollRef.current?.scrollTo({
                y: 0,
                x: SCREEN_WIDTH,
                animated: true
            })
            if (ref.current.currentTab === 1) {
                Animated.timing(_tabLineOffsetX, {
                    toValue: SCREEN_WIDTH / 2,
                    useNativeDriver: false,
                    duration: 200
                }).start()
            }
            ref.current.currentTab = 2
        } else {
            _scrollRef.current?.scrollTo({
                y: 0,
                x: 0,
                animated: true
            })
            if (ref.current.currentTab === 2) {
                Animated.timing(_tabLineOffsetX, {
                    toValue: 0,
                    useNativeDriver: false,
                    duration: 200
                }).start()
            }
            ref.current.currentTab = 1
        }
    }
    const _onToggleFollow = (index: number) => {
        dispatch(ToggleFollowUserRequest(followersRenderList[index].username || '', true))
    }
    const _onRemove = (index: number) => {
        setSelectedIndex(index)
    }
    const _onConfirmRemoveFollower = (username: string) => {
        dispatch(RemoveFollowerRequest(username))
        setSelectedIndex(-1)
    }
    const _onUnFollow = (index: number) => {
        let temp = [...follwingsRenderList]
        if (follwingsRenderList[index].followType === 1) {
            setSelectedUnfollowIndex(index)
        } else if (follwingsRenderList[index].followType === 2) {

            if (follwingsRenderList[index].private) {
                dispatch(ToggleSendFollowRequest(follwingsRenderList[index].username || ''))
                temp[index].followType = 3
            } else {
                dispatch(ToggleFollowUserRequest(follwingsRenderList[index].username || ''))
                temp[index].followType = 1
            }

        } else {
            dispatch(ToggleSendFollowRequest(follwingsRenderList[index].username || ''))
            temp[index].followType = 2
        }
        setFollowingsRenderList(temp)
    }
    const _onConfirmUnFollow = (usernameX: string) => {
        dispatch(UnfollowRequest(usernameX))
        setSelectedUnfollowIndex(-1)
        let temp = [...follwingsRenderList]
        temp = temp.map(usr => {
            if (usr.username === usernameX) {
                usr.followType = 2
            }
            return usr
        })
        setFollowingsRenderList(temp)
    }
    return (
        <SafeAreaView style={styles.container}>
            {selectedFollowingIndex > -1 &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={setSelectedFollowingIndex.bind(null, -1)}
                    style={styles.confirmWrapper}>
                    <View style={{ ...styles.confirmBox, paddingTop: 0, borderRadius: 5 }}>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedFollowingIndex(-1)
                                navigate('NotificationOptions', {
                                    user: follwingsRenderList[selectedFollowingIndex]
                                })
                            }}
                            style={{
                                paddingHorizontal: 15,
                                height: 44,
                                width: '100%',
                                justifyContent: 'center'
                            }}
                        >
                            <Text style={{ fontWeight: '500' }}>Manage Notifications</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedFollowingIndex(-1)
                                navigate('MuteOptions', {
                                    user: follwingsRenderList[selectedFollowingIndex]
                                })
                            }}
                            style={{
                                paddingHorizontal: 15,
                                height: 44,
                                width: '100%',
                                justifyContent: 'center'
                            }}
                        >
                            <Text style={{ fontWeight: '500' }}>Muted</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            {selectedIndex > -1 &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={setSelectedIndex.bind(null, -1)}
                    style={styles.confirmWrapper}>
                    <View style={styles.confirmBox}>
                        <FastImage style={styles.avatar} source={{ uri: followersRenderList[selectedIndex].avatarURL }} />
                        <Text style={{
                            marginTop: 15,
                            fontSize: 20,
                            fontWeight: '600'
                        }}>Remove Follower?</Text>
                        <Text style={{
                            color: "#666",
                            textAlign: 'center',
                            marginBottom: 20,
                        }}>
                            Instagram won't tell {followersRenderList[selectedIndex].username} they were removed from your followers.
                        </Text>
                        <TouchableOpacity
                            onPress={() => _onConfirmRemoveFollower(followersRenderList[selectedIndex].username || '')}
                            style={styles.btnConfirm}>
                            <Text style={{
                                color: '#318bfb',
                                fontSize: 16,
                                fontWeight: '600'
                            }}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={setSelectedIndex.bind(null, -1)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            {selectedUnfollowIndex > -1 &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={setSelectedUnfollowIndex.bind(null, -1)}
                    style={styles.confirmWrapper}>
                    <View style={styles.confirmBox}>
                        <FastImage style={styles.avatar} source={{ uri: follwingsRenderList[selectedUnfollowIndex].avatarURL }} />
                        <Text style={{
                            marginTop: 15,
                            fontSize: 20,
                            fontWeight: '600'
                        }}>Are You Sure?</Text>
                        <Text style={{
                            color: "#666",
                            textAlign: 'center',
                            marginBottom: 20,
                            marginHorizontal: 15,
                        }}>
                            Are you sure to unfollow @{follwingsRenderList[selectedUnfollowIndex].username}
                        </Text>
                        <TouchableOpacity
                            onPress={() => _onConfirmUnFollow(follwingsRenderList[selectedUnfollowIndex].username || '')}
                            style={styles.btnConfirm}>
                            <Text style={{
                                color: '#318bfb',
                                fontSize: 16,
                                fontWeight: '600'
                            }}>Unfollow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={setSelectedUnfollowIndex.bind(null, -1)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 44,
                }}>
                    <TouchableOpacity
                        onPress={goBack}
                        style={styles.btnGoBack}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '500'
                    }}>{username}</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 44,
                }}>
                    <TouchableOpacity
                        onPress={() => _onSwitchTab(1)}
                        style={styles.tab}
                    >
                        <Text style={{
                            fontWeight: '500'
                        }}>Follower</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => _onSwitchTab(2)}
                        style={styles.tab}
                    >
                        <Text style={{
                            fontWeight: '500'
                        }}>Following</Text>
                    </TouchableOpacity>
                    <Animated.View
                        style={{
                            ...styles.tabLine,
                            left: _tabLineOffsetX
                        }} />
                </View>
            </View>
            <ScrollView
                onScrollEndDrag={_onScrollEndDrag}
                scrollEventThrottle={30}
                ref={_scrollRef}
                bounces={false}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.tabContainer}>
                    <FlatList
                        ListHeaderComponent={
                            <>
                                {lastRequest.hasOwnProperty('username') &&
                                    <TouchableOpacity
                                        onPress={() => navigate('FollowRequests')}
                                        style={styles.requestListWrapper}>
                                        <View style={{
                                            height: 40,
                                            width: 40,
                                            marginRight: 10,
                                        }}>
                                            <FastImage
                                                source={{
                                                    uri: lastRequest.avatarURL
                                                }}
                                                style={{
                                                    height: 40,
                                                    width: 40,
                                                    borderRadius: 40,
                                                    borderColor: '#333',
                                                    borderWidth: 0.3
                                                }} />
                                            <View style={styles.requestNumber}>
                                                <Text style={{
                                                    color: '#fff',
                                                    fontWeight: "bold"
                                                }}>{extraInfo?.requestedList.length}</Text>
                                            </View>
                                        </View>
                                        <View>
                                            <Text>Follow Request</Text>
                                            <Text style={{
                                                color: "#666"
                                            }}>Approve or ignore requests</Text>
                                        </View>
                                    </TouchableOpacity>

                                }
                                <View style={styles.headerList}>
                                    <View style={styles.searchWrapper}>
                                        <View style={{
                                            height: 44,
                                            width: 44,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Icon name="magnify" size={20} color="#666" />
                                        </View>
                                        <TextInput
                                            style={{
                                                height: '100%',
                                                width: SCREEN_WIDTH - 30 - 44
                                            }}
                                            autoCapitalize="none"
                                            value={followerQuery}
                                            onChangeText={setFollowerQuery}
                                            placeholder="Search followers"
                                        />
                                    </View>
                                    <View style={styles.categoriesWrapper}>
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: '600'
                                        }}>Categories</Text>
                                        {dontFollowBackList.length > 0 &&
                                            <TouchableOpacity
                                                onPress={() =>
                                                    navigate('AccountYouDontFollowBack')}
                                                style={styles.categoryItem}>
                                                {dontFollowBackList.length >= 2 ? (
                                                    <View style={{
                                                        height: 50,
                                                        width: 50,
                                                        marginRight: 10
                                                    }}>
                                                        <FastImage
                                                            style={{
                                                                position: 'absolute',
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40
                                                            }}
                                                            source={{
                                                                uri: dontFollowBackList[0].avatarURL
                                                            }}
                                                        />
                                                        <FastImage
                                                            style={{
                                                                borderWidth: 2,
                                                                borderColor: '#fff',
                                                                position: 'absolute',
                                                                top: 10,
                                                                left: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{
                                                                uri: dontFollowBackList[1].avatarURL
                                                            }}
                                                        />
                                                    </View>
                                                ) : (
                                                        <FastImage
                                                            style={{
                                                                marginRight: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{ uri: dontFollowBackList[0].avatarURL }} />
                                                    )
                                                }
                                                <View>
                                                    <Text style={{
                                                        fontWeight: '600'
                                                    }}>Account You Don't Follow Back</Text>
                                                    <Text style={{
                                                        color: "#666"
                                                    }}>{dontFollowBackList[0].username} and {dontFollowBackList.length - 1} others</Text>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                        {recentFollowerInteractionList.length > 0 &&
                                            <TouchableOpacity
                                                onPress={() => navigate('RecentFollowerInteraction')}
                                                style={styles.categoryItem}>
                                                {recentFollowerInteractionList.length >= 2 ? (
                                                    <View style={{
                                                        height: 50,
                                                        width: 50,
                                                        marginRight: 10
                                                    }}>
                                                        <FastImage
                                                            style={{
                                                                position: 'absolute',
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40
                                                            }}
                                                            source={{
                                                                uri: recentFollowerInteractionList[0].avatarURL
                                                            }}
                                                        />
                                                        <FastImage
                                                            style={{
                                                                borderWidth: 2,
                                                                borderColor: '#fff',
                                                                position: 'absolute',
                                                                top: 10,
                                                                left: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{
                                                                uri: recentFollowerInteractionList[1].avatarURL
                                                            }}
                                                        />
                                                    </View>
                                                ) : (
                                                        <FastImage
                                                            style={{
                                                                marginRight: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{ uri: recentFollowerInteractionList[0].avatarURL }} />
                                                    )
                                                }
                                                <View>
                                                    <Text style={{
                                                        fontWeight: '600'
                                                    }}>Recent Interacted With</Text>
                                                    <Text style={{
                                                        color: "#666"
                                                    }}>{recentFollowerInteractionList[0].username} and {recentFollowerInteractionList.length - 1} others</Text>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                                <View>
                                    <Text style={{
                                        margin: 15,
                                        marginBottom: 5,
                                        fontSize: 16,
                                        fontWeight: '600'
                                    }}>All Followers</Text>
                                </View>
                            </>
                        }
                        data={followersRenderList}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity
                                onPress={() => {
                                    navigate('ProfileX', {
                                        username: item.username
                                    })
                                }}
                                style={styles.userItem}>
                                <View style={{
                                    width: '50%',
                                    flexDirection: "row",
                                    alignItems: 'center'
                                }}>
                                    <FastImage
                                        style={{
                                            height: 64,
                                            width: 64,
                                            borderRadius: 32,
                                            borderColor: '#333',
                                            borderWidth: 0.3
                                        }}
                                        source={{
                                            uri: item.avatarURL,
                                            priority: FastImage.priority.high
                                        }} />
                                    <Text style={{
                                        marginLeft: 10,
                                        fontWeight: '500'
                                    }}>{item.username}</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <TouchableOpacity
                                        onPress={_onToggleFollow.bind(null, index)}
                                        style={{
                                            ...styles.btnFollow,
                                            ...(item.followType === 1 || item.followType === 3 ? {

                                            } : {
                                                    borderWidth: 0,
                                                    backgroundColor: '#318bfb'
                                                }
                                            )
                                        }}>
                                        <Text style={{
                                            fontWeight: '600',
                                            ...(item.followType === 1 || item.followType === 3 ? {} : {
                                                color: '#fff'
                                            }
                                            )
                                        }}>
                                            {item.followType === 1 ? 'Following' : (
                                                item.followType === 2 ? 'Follow' : 'Requested'
                                            )
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={_onRemove.bind(null, index)}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <Icon name="dots-vertical" size={20} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        }
                        keyExtractor={(item, index) => `${index}`}
                    />
                </View>
                <View style={styles.tabContainer}>
                    <FlatList
                        data={follwingsRenderList}
                        ListHeaderComponent={
                            <>
                                <View style={styles.headerList}>
                                    <View style={styles.searchWrapper}>
                                        <View style={{
                                            height: 44,
                                            width: 44,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Icon name="magnify" size={20} color="#666" />
                                        </View>
                                        <TextInput
                                            style={{

                                                height: '100%',
                                                width: SCREEN_WIDTH - 30 - 44
                                            }}
                                            autoCapitalize="none"
                                            value={followingQuery}
                                            onChangeText={setFollowingQuery}
                                            placeholder="Search followings"
                                        />
                                    </View>
                                    <View style={styles.categoriesWrapper}>
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: '600'
                                        }}>Categories</Text>
                                        {recentFollowingsInteractionList.length > 0 &&
                                            <TouchableOpacity
                                                onPress={() =>
                                                    navigate('RecentFollowingInteraction')}
                                                style={styles.categoryItem}>
                                                {recentFollowingsInteractionList.length >= 2 ? (
                                                    <View style={{
                                                        height: 50,
                                                        width: 50,
                                                        marginRight: 10
                                                    }}>
                                                        <FastImage
                                                            style={{
                                                                position: 'absolute',
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40
                                                            }}
                                                            source={{
                                                                uri: recentFollowingsInteractionList[0].avatarURL
                                                            }}
                                                        />
                                                        <FastImage
                                                            style={{
                                                                borderWidth: 2,
                                                                borderColor: '#fff',
                                                                position: 'absolute',
                                                                top: 10,
                                                                left: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{
                                                                uri: recentFollowingsInteractionList[1].avatarURL
                                                            }}
                                                        />
                                                    </View>
                                                ) : (
                                                        <FastImage
                                                            style={{
                                                                marginRight: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{ uri: recentFollowingsInteractionList[0].avatarURL }} />
                                                    )
                                                }
                                                <View>
                                                    <Text style={{
                                                        fontWeight: '600'
                                                    }}>Recent Interacted With</Text>
                                                    <Text style={{
                                                        color: "#666"
                                                    }}>{recentFollowingsInteractionList[0].username} and {recentFollowingsInteractionList.length - 1} others</Text>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                        {dontFollowBackList.length > 0 &&
                                            <TouchableOpacity style={styles.categoryItem}>
                                                {dontFollowBackList.length >= 2 ? (
                                                    <View style={{
                                                        height: 50,
                                                        width: 50,
                                                        marginRight: 10
                                                    }}>
                                                        <FastImage
                                                            style={{
                                                                position: 'absolute',
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40
                                                            }}
                                                            source={{
                                                                uri: dontFollowBackList[0].avatarURL
                                                            }}
                                                        />
                                                        <FastImage
                                                            style={{
                                                                borderWidth: 2,
                                                                borderColor: '#fff',
                                                                position: 'absolute',
                                                                top: 10,
                                                                left: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{
                                                                uri: dontFollowBackList[0].avatarURL
                                                            }}
                                                        />
                                                    </View>
                                                ) : (
                                                        <FastImage
                                                            style={{
                                                                marginRight: 10,
                                                                height: 40,
                                                                width: 40,
                                                                borderRadius: 40,
                                                            }}
                                                            source={{ uri: dontFollowBackList[0].avatarURL }} />
                                                    )
                                                }
                                                <View>
                                                    <Text style={{
                                                        fontWeight: '600'
                                                    }}>Most Shown in Feed</Text>
                                                    <Text style={{
                                                        color: "#666"
                                                    }}>{dontFollowBackList[0].username} and {dontFollowBackList.length - 1} others</Text>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                                <View>
                                    <Text style={{
                                        margin: 15,
                                        marginBottom: 5,
                                        fontSize: 16,
                                        fontWeight: '600'
                                    }}>All Followings</Text>
                                </View>
                            </>
                        }
                        renderItem={({ item, index }) =>
                            <TouchableOpacity
                                onPress={() => {
                                    navigate('ProfileX', {
                                        username: item.username
                                    })
                                }}
                                style={styles.userItem}>
                                <View style={{
                                    width: '50%',
                                    flexDirection: "row",
                                    alignItems: 'center'
                                }}>
                                    <FastImage
                                        style={{
                                            height: 64,
                                            width: 64,
                                            borderRadius: 32,
                                            borderColor: '#333',
                                            borderWidth: 0.3
                                        }}
                                        source={{
                                            uri: item.avatarURL,
                                            priority: FastImage.priority.high
                                        }} />
                                    <Text style={{
                                        marginLeft: 10,
                                        fontWeight: '500'
                                    }}>{item.username}</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <TouchableOpacity
                                        onPress={_onUnFollow.bind(null, index)}
                                        style={{
                                            ...styles.btnFollow,
                                            ...(item.followType === 1 || item.followType === 3 ? {} : {
                                                borderWidth: 0,
                                                backgroundColor: '#318bfb'
                                            }
                                            )
                                        }}>
                                        <Text style={{
                                            fontWeight: '600',
                                            ...(item.followType === 1 || item.followType === 3 ? {} : {
                                                color: '#fff'
                                            }
                                            )
                                        }}>
                                            {item.followType === 1 ? 'Following' : (
                                                item.followType === 2 ? 'Follow' : 'Requested'
                                            )
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={setSelectedFollowingIndex.bind(null, index)}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <Icon name="dots-vertical" size={20} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        }
                        keyExtractor={(item, index) => `${index}`}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Follow

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        height: 88,
        width: '100%',
        borderBottomColor: "#ddd",
        borderBottomWidth: 1,
        marginBottom: 2
    },
    btnGoBack: {
        height: 44,
        width: 66,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab: {
        height: 44,
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabContainer: {
        width: SCREEN_WIDTH,
    },
    requestListWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 15,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.3
    },
    requestNumber: {
        position: 'absolute',
        height: 18,
        width: 18,
        borderRadius: 18,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        right: 0
    },
    tabLine: {
        position: 'absolute',
        height: 2,
        width: SCREEN_WIDTH / 2,
        backgroundColor: '#333',
        top: '100%',
        zIndex: 1,
    },
    userItem: {
        paddingHorizontal: 15,
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    btnFollow: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        borderColor: '#ddd',
        borderRadius: 5,
        borderWidth: 1
    },
    headerList: {
        padding: 15,
        paddingBottom: 0,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.3
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderBottomWidth: 1,
        borderBottomColor: "#318bfb"
    },
    categoriesWrapper: {
        marginVertical: 10
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5
    },
    avatar: {
        height: 100,
        width: 100,
        borderRadius: 100,
        borderColor: "#333",
        borderWidth: 0.3
    },
    confirmWrapper: {
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(0,0,0,0.3)',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        paddingTop: 15,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    btnConfirm: {
        borderTopColor: '#ddd',
        borderTopWidth: 0.5,
        height: 44,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
