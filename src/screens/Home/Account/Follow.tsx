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
import { FetchExtraInfoRequest, ToggleFollowUserRequest, RemoveFollowerRequest } from '../../../actions/userActions'
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
const Follow = ({ route }: FollowProps) => {
    const dispatch = useDispatch()
    const type = route.params.type
    const user = useSelector(state => state.user)
    const extraInfo = user.extraInfo
    const [followerQuery, setFollowerQuery] = useState<string>('')
    const [followingQuery, setFollowingQuery] = useState<string>('')
    const [dontFollowBackList, setDontFollowBackList] = useState<UserInfo[]>([])
    const username = user.user.userInfo?.username
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [followers, setFollowers] = useState<UserInfo[]>([])
    const [followersRenderList, setFollowersRenderList] = useState<UserInfo[]>([])
    const [follwings, setFollowings] = useState<UserInfo[]>([])
    const [follwingsRenderList, setFollowingsRenderList] = useState<UserInfo[]>([])
    const _scrollRef = useRef<ScrollView>(null)
    const _tabLineOffsetX = React.useMemo(() =>
        new Animated.Value((type - 1) * SCREEN_WIDTH / 2), [])
    const ref = useRef<{
        followerQueryTimeout: NodeJS.Timeout,
        currentTab: 1 | 2
    }>({
        currentTab: type,
        followerQueryTimeout: setTimeout(() => { }, 0)
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
        if (extraInfo) {
            const followerUsrnames = [...extraInfo.followers]
            const follwingUsrnames = [...extraInfo.followings]
            const dontFollowUsrnames = [...followerUsrnames.filter(usr =>
                follwingUsrnames.indexOf(usr) < 0)]
            followerUsrnames.splice(extraInfo.followers.indexOf(username || ""), 1)
            follwingUsrnames.splice(extraInfo.followings.indexOf(username || ""), 1)
            const ref = firestore()
            const taskFollowers: Promise<UserInfo>[] = followerUsrnames.map(async userX => {
                const rq = await ref.collection('users').doc(userX).get()
                const info: UserInfo = rq.data() || {}
                return info
            })
            Promise.all(taskFollowers).then(result => {
                const dontFollowBackUsers = [...result.filter(usr =>
                    dontFollowUsrnames.indexOf(usr.username || '') > -1
                )]
                setDontFollowBackList(dontFollowBackUsers)
                setFollowers(result)
                setFollowersRenderList(result)
            })
            const taskFollowings: Promise<UserInfo>[] = follwingUsrnames.map(async userX => {
                const rq = await ref.collection('users').doc(userX).get()
                const info: UserInfo = rq.data() || {}
                return info
            })
            Promise.all(taskFollowings).then(result => {
                setFollowings(result)
                setFollowingsRenderList(result)
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
    const _onToggleFollow = (username: string) => {
        dispatch(ToggleFollowUserRequest(username, true))
    }
    const _onRemove = (index: number) => {
        setSelectedIndex(index)
    }
    const _onConfirmRemoveFollower = (username: string) => {
        dispatch(RemoveFollowerRequest(username))
        setSelectedIndex(-1)
    }
    return (
        <SafeAreaView style={styles.container}>
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
                                                    <Image
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
                                                    <Image
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
                                                    <Image
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
                                    {dontFollowBackList.length > 0 &&
                                        <TouchableOpacity style={styles.categoryItem}>
                                            {dontFollowBackList.length >= 2 ? (
                                                <View style={{
                                                    height: 50,
                                                    width: 50,
                                                    marginRight: 10
                                                }}>
                                                    <Image
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
                                                    <Image
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
                                                    <Image
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
                                                }}>Least Interacted With</Text>
                                                <Text style={{
                                                    color: "#666"
                                                }}>{dontFollowBackList[0].username} and {dontFollowBackList.length - 1} others</Text>
                                            </View>
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        }
                        data={followersRenderList}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity
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
                                        onPress={_onToggleFollow.bind(null, item.username || "")}
                                        style={{
                                            ...styles.btnFollow,
                                            ...((extraInfo?.followings
                                                && extraInfo.followings
                                                    .indexOf(item.username || '') > -1) ? {

                                                } : {
                                                    borderWidth: 0,
                                                    backgroundColor: '#318bfb'
                                                }
                                            )
                                        }}>
                                        <Text style={{
                                            fontWeight: '600',
                                            ...((extraInfo?.followings
                                                && extraInfo.followings
                                                    .indexOf(item.username || '') > -1) ? {} : {
                                                    color: '#fff'
                                                }
                                            )
                                        }}>
                                            {(extraInfo?.followings
                                                && extraInfo.followings
                                                    .indexOf(item.username || '') > -1) ? 'Following' : 'Follow'
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
                        renderItem={({ item }) =>
                            <TouchableOpacity
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
                                    <TouchableOpacity style={{
                                        ...styles.btnFollow,
                                        ...((extraInfo?.followings
                                            && extraInfo.followings
                                                .indexOf(item.username || '') > -1) ? {

                                            } : {
                                                borderWidth: 0,
                                                backgroundColor: '#318bfb'
                                            }
                                        )
                                    }}>
                                        <Text style={{
                                            fontWeight: '600',
                                            ...((extraInfo?.followings
                                                && extraInfo.followings
                                                    .indexOf(item.username || '') > -1) ? {} : {
                                                    color: '#fff'
                                                }
                                            )
                                        }}>
                                            {(extraInfo?.followings
                                                && extraInfo.followings
                                                    .indexOf(item.username || '') > -1) ? 'Following' : 'Follow'
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{
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
        padding: 15
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
        height: 64,
        width: 64,
        borderRadius: 32,
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
