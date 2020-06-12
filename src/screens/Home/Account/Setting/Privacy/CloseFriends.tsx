import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Animated, TextInput, Image, ImageBackground, RefreshControl } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { findUsersByName } from '../../../../../utils'
import { UserInfo } from '../../../../../reducers/userReducer'
import { store } from '../../../../../store'
import { firestore } from 'firebase'
import { useDispatch } from 'react-redux'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { Comment } from '../../../../../reducers/commentReducer'
const CloseFriends = (): JSX.Element => {
    const route = useRoute()
    const myUsername = store.getState().user.user.userInfo?.username
    const dispatch = useDispatch()
    const closeFriends = store.getState().user.setting?.privacy?.closeFriends
    const _noteHeight = React.useMemo(() => new Animated.Value(1), [])
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [searching, setSearching] = useState<boolean>(false)
    const [closeList, setCloseList] = useState<string[]>(closeFriends?.closeFriends || [])
    const [suggestionsList, setSuggestionList] = useState<string[]>([])
    const [suggestionUsers, setSuggestionUsers] = useState<UserInfo[]>([])
    const [closeUsers, setCloseUsers] = useState<UserInfo[]>([])
    const [query, setQuery] = useState<string>('')
    const [result, setResult] = useState<UserInfo[]>([])
    const [currNavigation, setCurrNavigation] =
        useState<SettingNavigation | { name: string }>({ name: '' })
    useEffect(() => {
        settingNavigationMap.every(settingNavigation => {
            if (settingNavigation.child) {
                return settingNavigation.child.every(childSettingNavigation => {
                    if (childSettingNavigation.navigationName === route.name) {
                        setCurrNavigation(childSettingNavigation);
                        return false
                    }
                    return true
                }) || true
            }
            return true;
        })
        fetchSuggestionCloseFriends()
    }, [])
    const ref = useRef<{
        timeout: NodeJS.Timeout
    }>({ timeout: setTimeout(() => { }, 0) })
    useEffect(() => {
        clearTimeout(ref.current.timeout)
        ref.current.timeout = setTimeout(() => {
            findUsersByName(query).then(rs => {
                setResult(rs)
            })
        }, 500);

    }, [query])
    useEffect(() => {
        const result: UserInfo[] = []
        const ref = firestore()
        setRefreshing(true)
        if (closeList.length === 0) {
            setCloseUsers(result)
            setRefreshing(false)
            return;
        }
        closeList.map(async (username, index) => {
            const rs = await ref.collection('users').doc(username).get()
            result.push(rs.data() || {})
            if (index === closeList.length - 1) {
                setCloseUsers(result)
                setRefreshing(false)
            }
        })
    }, [closeList])
    useEffect(() => {
        const result: UserInfo[] = []
        const ref = firestore()
        setRefreshing(true)
        if (suggestionsList.length === 0) {
            setSuggestionUsers(result)
            setRefreshing(false)
            return;
        }
        suggestionsList.map(async (username, index) => {
            const rs = await ref.collection('users').doc(username).get()
            result.push(rs.data() || {})
            if (index === suggestionsList.length - 1) {
                setSuggestionUsers(result)
                setRefreshing(false)
            }
        })
    }, [suggestionsList])
    const _onStartSearching = () => {
        setSearching(true)
        Animated.timing(_noteHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start()
    }
    const _onFinishSearching = () => {
        setSearching(false)
        setResult([])
        _noteHeight.setValue(1)
    }
    const _onRefresh = () => {
        setCloseList(store.getState().user
            .setting?.privacy?.closeFriends?.closeFriends || [])
        setSuggestionList([...suggestionsList])
    }
    const _onToggleCloseFriend = (username: string) => {
        if (closeList.indexOf(username) > -1) {
            const temp = [...closeList]
            setSuggestionList([...suggestionsList, username])
            temp.splice(temp.indexOf(username), 1)
            setCloseList(temp)
            dispatch(UpdatePrivacySettingsRequest({
                closeFriends: {
                    closeFriends: [...temp]
                }
            }))
        } else {
            const temp = [...suggestionsList]
            temp.splice(suggestionsList.indexOf(username), 1)
            setSuggestionList([...temp])
            setCloseList([...closeList, username])
            dispatch(UpdatePrivacySettingsRequest({
                closeFriends: {
                    closeFriends: [...closeList, username]
                }
            }))
        }
    }
    const fetchSuggestionCloseFriends = async () => {
        const ref = firestore()
        const rq = await ref.collection('posts')
            .where('userId', '==', myUsername)
            .limit(25)
            .get()
        let preList: {
            username: string,
            score: number
        }[] = []
        rq.docs.map(async (rs, index) => {
            const likes = (rs.data().likes as string[])
            likes.map(usr => {
                if (usr !== myUsername && closeList.indexOf(usr) < 0) {
                    let i = -1
                    preList.every((x, index2) => {
                        if (x.username === usr) {
                            i = index2
                            return false
                        }
                        return true
                    })
                    if (i > -1) preList[i].score += 1
                    else preList.push({
                        username: usr,
                        score: 1
                    })
                }
            })
            const rq2 = await rs.ref.collection('comments').get()
            rq2.docs.map((rs2) => {
                const comment: Comment = rs2.data() || {}
                if (comment.userId !== myUsername
                    && closeList.indexOf(comment.userId || '') < 0) {
                    let i = -1
                    preList.every((x, index2) => {
                        if (x.username === comment.userId) {
                            i = index2
                            return false
                        }
                        return true
                    })
                    if (i > -1) preList[i].score += 1
                    else preList.push({
                        username: comment.userId || '',
                        score: 1
                    })
                }
            })
            if (index === rq.size - 1) {
                preList = preList.sort((a, b) => b.score - a.score)
                setSuggestionList([...preList].map(x => x.username))
            }
        })

    }
    return (
        <SafeAreaView style={styles.container}>
            {!searching && <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />}
            {searching &&
                <View style={styles.searchInputWrapper}>
                    <TouchableOpacity
                        onPress={_onFinishSearching}
                        style={{
                            height: 44,
                            width: 44,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        autoFocus={true}
                        placeholder="Search"
                        autoCapitalize="none"
                        style={{
                            width: SCREEN_WIDTH - 44,
                            height: 44,
                            fontSize: 16
                        }} />
                </View>
            }
            <Animated.View style={{
                ...styles.note,
                height: _noteHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 90]
                }),
                borderBottomColor: '#ddd',
                borderBottomWidth: 1
            }}>
                <Text style={{
                    maxWidth: '85%',
                    color: '#666',
                    textAlign: 'center'
                }}>
                    We don't send notifications when you edit yur close friends list. <Text style={{
                        color: '#000',
                        fontWeight: '600'
                    }}>
                        How it works.
                    </Text>
                </Text>
            </Animated.View>
            {!searching &&
                <TouchableOpacity
                    onPress={_onStartSearching}
                    activeOpacity={1}
                    style={styles.mockInputSearch}>
                    <View style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Icon name="magnify" size={24} color="#666" />
                    </View>
                    <Text style={{
                        fontSize: 16,
                        color: '#666'
                    }}>Search</Text>
                </TouchableOpacity>
            }
            <ScrollView
                style={{
                    height: SCREEN_HEIGHT - getTabBarHeight()
                        - STATUS_BAR_HEIGHT - 44 - 90 - 70
                }}
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={_onRefresh}
                />}
                bounces={!searching}
                showsVerticalScrollIndicator={false}
            >
                {!searching && <View style={styles.closeFriends}>
                    <View style={{
                        padding: 15,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: 16
                        }}>
                            Close Friends
                        </Text>
                        <TouchableOpacity>
                            <Text style={{
                                color: '#318bfb',
                                fontWeight: '500'
                            }}>Remove All</Text>
                        </TouchableOpacity>
                    </View>
                    {closeUsers.map((userX, index) => (
                        <UserItem userX={userX} key={index}
                            _onToggleCloseFriend={_onToggleCloseFriend}
                            closeList={closeList} />
                    ))}
                </View>
                }
                <View style={styles.suggestions}>
                    <View style={{
                        padding: 15
                    }}>
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: 16
                        }}>
                            {result.length === 0 ? 'Suggestions' : 'Result'}
                        </Text>
                    </View>

                    {result.length === 0 && suggestionUsers.map((userX, index) => (
                        <UserItem userX={userX} key={index}
                            _onToggleCloseFriend={_onToggleCloseFriend}
                            closeList={closeList} />
                    ))}
                    {result.map((userX, index) => (
                        <UserItem userX={userX} key={index}
                            _onToggleCloseFriend={_onToggleCloseFriend}
                            closeList={closeList} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

export default CloseFriends

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    searchInputWrapper: {
        flexDirection: 'row'
    },
    mockInputSearch: {
        borderRadius: 5,
        borderColor: '#666',
        borderWidth: 1,
        height: 40,
        margin: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    note: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',

    },
    closeFriends: {

    },
    suggestions: {

    },
    peopleItem: {
        marginVertical: 5,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    avatar: {
        position: 'relative',
        width: 54,
        height: 54,
        borderRadius: 54,
        borderColor: '#ddd',
        borderWidth: 0.5
    },
    star: {
        position: 'absolute',
        zIndex: 999,
        height: 24,
        width: 24,
        borderColor: '#fff',
        borderWidth: 2.5,
        borderRadius: 20,
        bottom: -2,
        right: -5,
    },
    btnToggleCloseFriend: {
        paddingVertical: 5,
        borderRadius: 5,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
const UserItem = ({ userX, closeList, _onToggleCloseFriend }: { _onToggleCloseFriend: (username: string) => void, userX: UserInfo, closeList: string[] }) => {
    return (
        <View style={styles.peopleItem}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <ImageBackground style={styles.avatar} imageStyle={styles.avatar} source={{
                    uri: userX.avatarURL
                }} >
                    {closeList.indexOf(userX.username || '') > -1
                        ? <Image style={styles.star}
                            source={require('../../../../../assets/icons/close-friend.png')} />
                        : null
                    }

                </ImageBackground>
                <View style={{
                    marginLeft: 15,
                    width: SCREEN_WIDTH - 30 - 54 - 15 - 80
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                    }}>{userX.username}</Text>
                    <Text style={{ width: '90%' }} numberOfLines={1}>
                        {userX.bio}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={_onToggleCloseFriend.bind(null, userX.username || '')}
                style={{
                    ...styles.btnToggleCloseFriend,
                    borderColor: '#ddd',
                    borderWidth: closeList.indexOf(userX.username || '') > -1 ? 1 : 0,
                    backgroundColor: closeList.indexOf(userX.username || '') > -1 ? '#fff' : '#318bfb',
                }}>
                <Text style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    color: closeList.indexOf(userX.username || '') > -1 ? '#000' : '#fff',
                }}>{closeList.indexOf(userX.username || '') > -1 ? 'Remove' : 'Add'}</Text>
            </TouchableOpacity>
        </View>
    )
}
