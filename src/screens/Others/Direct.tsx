import { useIsFocused } from '@react-navigation/native'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, TouchableHighlight, KeyboardAvoidingView, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import NavigationBar from '../../components/NavigationBar'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { goBack, navigate, dispatch } from '../../navigations/rootNavigation'
import { ProfileX } from '../../reducers/profileXReducer'
import { store } from '../../store'
import FastImage from 'react-native-fast-image'
import { TriggerMessageListenerRequest } from '../../actions/messageActions'
import { useDispatch } from 'react-redux'
import { useSelector } from '../../reducers'
import { ExtraMessage } from '../../reducers/messageReducer'
import { seenTypes } from '../../reducers/notificationReducer'
import { timestampToString } from '../../utils'
const Direct = () => {
    const dispatch = useDispatch()
    const messages = useSelector(state => state.messages).filter(x => x.messageList.length > 0)
    const myUsername = store.getState().user.user.userInfo?.username
    const focused = useIsFocused()
    const [query, setQuery] = useState<string>('')
    const [searching, setSearching] = useState<boolean>(false)
    const [resultList, setResultList] = useState<ProfileX[]>([])
    const ref = useRef<{
        queryTimeout: NodeJS.Timeout
    }>({
        queryTimeout: setTimeout(() => { }, 0)
    })
    //Effect
    useEffect(() => {
        dispatch(TriggerMessageListenerRequest())
    }, [])
    useEffect(() => {
        if (focused) {

        }
    }, [focused])
    useEffect(() => {
        clearTimeout(ref.current.queryTimeout)
        if (query.length > 0) {
            ref.current.queryTimeout = setTimeout(async () => {
                const result = await _searchUsers(query)
                setResultList(result)
            }, 300)
        } else setResultList([])
    }, [query])
    const _searchUsers = async (q: string): Promise<ProfileX[]> => {
        const ref = firestore()
        const rq = await ref.collection('users').doc(`${myUsername}`).get()
        const myUserInfo: ProfileX = rq.data() || {}
        myUserInfo
        const currentFollowings = myUserInfo.followings || []
        const currentCloseFriends = myUserInfo.privacySetting?.closeFriends?.closeFriends || []
        const currentBlockAccounts = myUserInfo.privacySetting?.blockedAccounts?.blockedAccounts || []
        const rq2 = await ref.collection('users')
            .where('keyword', 'array-contains', q.trim().toLowerCase())
            .limit(100)
            .get()
        let resultList: ProfileX[] = rq2.docs.map(doc => doc.data() || {})
        resultList = resultList.filter(usr =>
            (usr.privacySetting?.blockedAccounts?.blockedAccounts || [])
                .indexOf(`${myUsername}`) < 0
            && usr.username !== myUsername
            && currentBlockAccounts.indexOf(`${usr.username}`) < 0
        )
        resultList.sort((a, b) => {
            let aScore = 0
            let bScore = 0
            if (currentCloseFriends.indexOf(`${a.username}`) > -1) {
                aScore = 2
            } else if (currentFollowings.indexOf(`${a.username}`) > -1) {
                aScore = 1
            }
            if (currentCloseFriends.indexOf(`${b.username}`) > -1) {
                bScore = 2
            } else if (currentFollowings.indexOf(`${b.username}`) > -1) {
                bScore = 1
            }
            return bScore - aScore
        })
        return resultList
    }
    const _onSearching = () => {
        setSearching(true)
        setQuery('')
    }
    const _onGoback = () => {
        if (searching) setSearching(false)
        else goBack()
    }
    return (
        <SafeAreaView style={styles.container}>
            {!searching ? (
                <View>
                    <NavigationBar title="Direct" callback={_onGoback} />
                    <View style={styles.rightOptions}>
                        <TouchableOpacity style={{
                            ...styles.btnRightOptions,
                        }}>
                            <Image style={{
                                height: 24,
                                width: 24
                            }} source={require('../../assets/icons/video-call.png')} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnRightOptions}>
                            <Image style={{
                                height: 20,
                                width: 20
                            }} source={require('../../assets/icons/edit.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
            ) :
                (
                    <View style={styles.searchNavigationBar}>
                        <TouchableOpacity
                            onPress={_onGoback}
                            style={styles.btnGoback}>
                            <Icon name="arrow-left" size={20} />
                        </TouchableOpacity>
                        <TextInput
                            autoCapitalize="none"
                            autoFocus={true}
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search"
                            placeholderTextColor="#666"
                            style={styles.searchInput} />
                        <KeyboardAvoidingView
                            behavior="height"
                            style={styles.searchResultList}>
                            <FlatList
                                style={{
                                    height: '100%',
                                    marginBottom: 50
                                }}

                                data={resultList}
                                renderItem={({ item }) =>
                                    <UserItem user={item} />
                                }
                                keyExtractor={(item, index) => `${index}`}
                            />
                        </KeyboardAvoidingView>
                    </View>
                )}
            <View style={styles.mainContainer}>
                <TouchableOpacity
                    onPress={_onSearching}
                    activeOpacity={0.8}
                    style={styles.searchBar}>
                    <View style={styles.searchIcon}>
                        <Icon name="magnify" size={20} color="#666" />
                    </View>
                    <Text style={styles.mockSearchInput}>Search</Text>
                </TouchableOpacity>
                <View>
                    <FlatList
                        style={{
                            height: '100%',
                            marginVertical: 10
                        }}
                        data={messages}
                        renderItem={({ item, index }) =>
                            <UserMessageItem {...{ item, index }} />
                        }
                        keyExtractor={(item, index) => `${index}`}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Direct

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: '100%',
        backgroundColor: "#fff"
    },
    rightOptions: {
        position: 'absolute',
        top: 0,
        height: 44,
        right: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnRightOptions: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainContainer: {
        paddingVertical: 15
    },
    searchBar: {
        flexDirection: 'row',
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        height: 36,
        borderRadius: 5,
        borderColor: "#ddd",
        borderWidth: 1
    },
    searchIcon: {
        height: 36,
        width: 36,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchInput: {
        height: 44,
        width: SCREEN_WIDTH - 44,
        paddingRight: 15,
        color: '#000'
    },
    mockSearchInput: {
        color: '#666',
        lineHeight: 36,
        height: "100%",
        width: SCREEN_WIDTH - 30 - 36
    },
    searchNavigationBar: {
        height: 44,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
        borderBottomColor: "#ddd",
        borderBottomWidth: 1
    },
    btnGoback: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: "center"
    },
    searchResultList: {
        position: 'absolute',
        width: '100%',
        top: 45,
        left: 0,
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
        backgroundColor: "#fff",
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 7.5,
        justifyContent: 'space-between'
    },
    resultUserAvatar: {
        height: 50,
        width: 50,
        borderRadius: 50,
        borderWidth: 0.3,
        borderColor: '#333'
    },
    userFullname: {
        fontWeight: '500'
    },
    userUsername: {
        fontWeight: '600',
        color: '#666'
    }
})
interface UserMessageItemProps {
    item: ExtraMessage
}
export const UserMessageItem = React.memo(({ item }: UserMessageItemProps) => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const isMyMessage = item.messageList[0].userId === myUsername
    const unRead = !isMyMessage && item.messageList[0].seen === seenTypes.NOTSEEN
    const _onViewConversation = () => {
        navigate('Conversation', {
            username: item.ownUser.username
        })
    }
    return (
        <TouchableHighlight
            onPress={_onViewConversation}
            underlayColor="#ddd"
            style={styles.userContainer}>
            <>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <FastImage
                        source={{
                            uri: item.ownUser.avatarURL
                        }}
                        style={styles.resultUserAvatar} />
                    <View
                        style={{
                            marginHorizontal: 10
                        }}
                    >
                        <Text style={styles.userFullname}>{item.ownUser.username}</Text>
                        <View style={{
                            flexDirection: 'row'
                        }}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    maxWidth: SCREEN_WIDTH - 30 - 150,
                                    fontWeight: unRead ? '600' : '400',
                                    color: unRead ? '#000' : '#666'
                                }}>{item.messageList[0].text}</Text>
                            <Text style={{
                                fontWeight: unRead ? '600' : '400',
                                color: unRead ? '#000' : '#666'
                            }}> • {timestampToString(item.messageList[0].create_at)}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigate('StoryTaker', {
                        sendToDirect: true,
                        username: item.ownUser.username
                    })}
                    style={{
                        height: 50,
                        width: 50,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <Image style={{
                        height: 20,
                        width: 20
                    }} source={require('../../assets/icons/camera.png')} />
                </TouchableOpacity>
            </>
        </TouchableHighlight>
    )
})
interface UserItemProps {
    user: ProfileX
}
export const UserItem = React.memo(({ user }: UserItemProps) => {
    const _onViewConversation = () => {
        navigate('Conversation', {
            username: user.username
        })
    }
    return (
        <TouchableHighlight
            onPress={_onViewConversation}
            underlayColor="#ddd"
            style={styles.userContainer}>
            <>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <FastImage
                        source={{
                            uri: user.avatarURL
                        }}
                        style={styles.resultUserAvatar} />
                    <View
                        style={{
                            marginLeft: 10
                        }}
                    >
                        <Text style={styles.userFullname}>{user.fullname}</Text>
                        <Text style={styles.userUsername}>{user.username}</Text>
                    </View>
                </View>
                <TouchableOpacity style={{
                    height: 50,
                    width: 50,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Image style={{
                        height: 20,
                        width: 20
                    }} source={require('../../assets/icons/camera.png')} />
                </TouchableOpacity>
            </>
        </TouchableHighlight>
    )
})