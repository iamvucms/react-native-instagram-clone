import { RouteProp } from '@react-navigation/native'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, FlatList, Keyboard, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { SuperRootStackParamList } from '../../navigations'
import { goBack } from '../../navigations/rootNavigation'
import { messagesTypes, PostingMessage } from '../../reducers/messageReducer'
import { ExtraPost } from '../../reducers/postReducer'
import { ProfileX } from '../../reducers/profileXReducer'
import { store } from '../../store'
import { MapBoxAddress } from '../../utils'
import { CreateMessageRequest, UndoMyLastMessageRequest } from '../../actions/messageActions'
import { useSelector } from '../../reducers'
type ShareToDirectRouteProp = RouteProp<SuperRootStackParamList, 'ShareToDirect'>
type ShareToDirectProps = {
    route: ShareToDirectRouteProp
}
const ShareToDirect = ({ route }: ShareToDirectProps) => {
    const shareItem = route.params.item
    const type = 'center' in shareItem ? 1 : 2
    const [query, setQuery] = useState<string>('')
    const [showFull, setShowFull] = useState<boolean>(false)
    const extraInfo = useSelector(state => state.user.extraInfo)
    const myUsername = store.getState().user.user.userInfo?.username
    const [suggestionlist, setSuggestionList] = useState<ProfileX[]>([])
    const [receiverList, setReceiverList] = useState<ProfileX[]>([])
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const _bottomSheetAnim = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number,
        preOffsetY: number
    }>({
        bottomSheetHeight: 0,
        preOffsetY: 0
    })
    //Effect
    useEffect(() => {
        ; (async () => {
            const ref = firestore()
            const rq = await ref.collection('users').doc(`${myUsername}`).get()
            const myUserInfo: ProfileX = rq.data() || {}
            const currentFollowings = myUserInfo.followings || []
            const currentCloseFriends = myUserInfo.privacySetting?.closeFriends?.closeFriends || []
            const currentBlockAccounts = myUserInfo.privacySetting?.blockedAccounts?.blockedAccounts || []
            const followings = extraInfo?.followings || []
            const followers = extraInfo?.followers || []
            const currentMsgUsers = store.getState().messages.map(x => x.ownUser.username) || []
            const commonUsers = Array.from(
                new Set(currentMsgUsers.concat(followers).concat(followings))
            )
            const fetchUserInfoTasks: Promise<ProfileX>[] = commonUsers.map(async usr => {
                const rq2 = await ref.collection('users').doc(`${usr}`).get()
                return rq2.data() || {}
            })
            const userInfoList = await Promise.all(fetchUserInfoTasks)
            const filteredUserInfoList = userInfoList.filter(usr =>
                currentBlockAccounts.indexOf(`${usr}`) < 0
                && (usr.privacySetting?.blockedAccounts?.blockedAccounts || [])
                    .indexOf(`${myUsername}`) < 0
                && (usr.privacySetting?.accountPrivacy?.private === false
                    || (usr.privacySetting?.accountPrivacy?.private === true
                        &&
                        currentFollowings.indexOf(`${usr}`) > 0
                    )
                )
                && usr !== myUsername
            )
            setSuggestionList(filteredUserInfoList)
        })()
    }, [])
    useEffect(() => {
        if (query.length > 0) {
            _searchUsers(query).then(userList => {
                setReceiverList(userList)
            })
        } else setReceiverList([])
    }, [query])



    const _onGestureEventHandler = ({ nativeEvent: {
        translationY
    } }: PanGestureHandlerGestureEvent) => {
        if (translationY < -(0.4 * SCREEN_HEIGHT - STATUS_BAR_HEIGHT)) return;
        _bottomSheetOffsetY.setValue(ref.current.preOffsetY + translationY)
    }
    const _onStateChangeHandler = ({
        nativeEvent: {
            translationY,
            state
        }
    }: PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            if (ref.current.preOffsetY + translationY > SCREEN_HEIGHT * 0.3) {
                Animated.timing(_bottomSheetOffsetY, {
                    toValue: ref.current.bottomSheetHeight,
                    useNativeDriver: true,
                    duration: 150
                }).start(() => goBack())
            } else if (ref.current.preOffsetY + translationY < 0) {
                const offsetY = Math.abs(ref.current.preOffsetY + translationY)
                if (offsetY > SCREEN_HEIGHT * 0.2) {
                    Animated.timing(_bottomSheetAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }).start()
                    Animated.spring(_bottomSheetOffsetY, {
                        toValue: -SCREEN_HEIGHT * 0.4 + STATUS_BAR_HEIGHT,
                        useNativeDriver: true,
                    }).start()
                    setShowFull(true)
                    ref.current.preOffsetY = -SCREEN_HEIGHT * 0.4 + STATUS_BAR_HEIGHT
                } else {
                    Animated.timing(_bottomSheetAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start()
                    Animated.spring(_bottomSheetOffsetY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start()
                    setShowFull(false)
                    ref.current.preOffsetY = 0
                    Keyboard.dismiss()
                }
            } else {
                Animated.timing(_bottomSheetAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start()
                ref.current.preOffsetY = 0
                Animated.spring(_bottomSheetOffsetY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start()
                Keyboard.dismiss()
            }
        }
    }
    const _onTxtInputFocus = () => {
        Animated.timing(_bottomSheetAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start()
        setShowFull(true)
        Animated.timing(_bottomSheetOffsetY, {
            duration: 200,
            toValue: -SCREEN_HEIGHT * 0.4 + STATUS_BAR_HEIGHT,
            useNativeDriver: true,
        }).start()
        ref.current.preOffsetY = -SCREEN_HEIGHT * 0.4 + STATUS_BAR_HEIGHT
    }
    const _onTxtInputBlur = () => {
        Animated.timing(_bottomSheetAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
        ref.current.preOffsetY = 0
        Animated.spring(_bottomSheetOffsetY, {
            toValue: 0,
            useNativeDriver: true,
        }).start()
    }
    const _searchUsers = async (q: string): Promise<ProfileX[]> => {
        const ref = firestore()
        const rq = await ref.collection('users').doc(`${myUsername}`).get()
        const myUserInfo: ProfileX = rq.data() || {}
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
    return (
        <SafeAreaView>
            <TouchableOpacity
                onPress={goBack}
                style={{
                    height: '100%',
                    width: '100%',
                }}>

            </TouchableOpacity>
            <PanGestureHandler
                onGestureEvent={_onGestureEventHandler}
                onHandlerStateChange={_onStateChangeHandler}
            >
                <Animated.View
                    onLayout={({ nativeEvent: { layout: { height } } }: LayoutChangeEvent) => {
                        ref.current.bottomSheetHeight = height
                    }}
                    style={{
                        ...styles.bottomSheet,
                        borderTopLeftRadius: _bottomSheetAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [15, 0]
                        }),
                        borderTopRightRadius: _bottomSheetAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [15, 0]
                        }),
                        shadowOpacity: _bottomSheetAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.25, 0]
                        }),
                        shadowRadius: _bottomSheetAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 1]
                        }),
                        transform: [{
                            translateY: _bottomSheetOffsetY
                        }]
                    }}>
                    <View style={styles.titleWrapper}>
                        <View style={{
                            marginBottom: 10,
                            height: 3,
                            width: 40,
                            backgroundColor: '#999',
                            borderRadius: 2,
                        }} />
                        <View style={styles.messageInputWrapper}>
                            <FastImage style={styles.previewImage} source={{
                                uri: type === 2 ? ((shareItem as ExtraPost).source || [])[0].uri
                                    : (shareItem as MapBoxAddress).avatarURI
                            }} />
                            <TextInput
                                onFocus={_onTxtInputFocus}
                                multiline={true}
                                style={styles.messageInput}
                                placeholder="Write a message..."
                            />
                        </View>
                    </View>
                    <View style={styles.body}>
                        <View style={styles.searchWrapper}>
                            <View style={styles.searchBtn}>
                                <Icon name="magnify" size={20} color="#666" />
                            </View>
                            <TextInput
                                style={styles.searchInput}
                                onFocus={_onTxtInputFocus}
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search"
                            />
                            <View style={styles.searchBtn}>
                                <Icon name="magnify" size={20} color="#666" />
                            </View>
                        </View>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            style={{
                                height: SCREEN_HEIGHT * (showFull ? 1 : 0.6) - 83.5 - 36 - 50,
                                marginVertical: 5,
                            }}
                            data={receiverList.length === 0
                                ? suggestionlist : receiverList}
                            renderItem={({ item, index }) =>
                                <ReceiverItem
                                    type={type === 1 ? 'address' : 'post'}
                                    shareItem={shareItem}
                                    index={index}
                                    user={item} />
                            }
                            keyExtractor={(item, index) => `${index}`}
                        />
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </SafeAreaView>
    )
}

export default ShareToDirect

const styles = StyleSheet.create({
    bottomSheet: {
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#ddd',
        paddingBottom: 40,
        position: 'absolute',
        zIndex: 1,
        top: SCREEN_HEIGHT * 0.4,
        left: 0,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },

        elevation: 5,
        height: SCREEN_HEIGHT
    },
    titleWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd'
    },
    optionItem: {
        flexDirection: 'row',
        height: 44,
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        alignItems: 'center'
    },
    messageInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 15,
        minHeight: 50,
        width: '100%',
    },
    messageInput: {
        minHeight: 30,
        width: SCREEN_WIDTH - 30 - 50,
        paddingHorizontal: 15
    },
    previewImage: {
        borderColor: '#ddd',
        borderWidth: 1,
        height: 50,
        width: 50,
        borderRadius: 5
    },
    body: {
        padding: 15
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    searchBtn: {
        width: 36,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchInput: {
        height: '100%',
        width: SCREEN_WIDTH - 30 - 36 * 2
    },
    receiverItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        justifyContent: 'space-between'
    },
    avatar: {
        height: 44,
        width: 44,
        borderRadius: 44,
        borderWidth: 0.3,
        borderColor: "#333"
    },
    btnSend: {
        width: 64,
        height: 24,
        borderRadius: 3,

        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#ddd'
    }
})
interface ReceiverItemProps {
    user: ProfileX,
    index: number,
    shareItem: MapBoxAddress | ExtraPost,
    type: 'address' | 'post'
}
const ReceiverItem = ({ user, index, shareItem, type }: ReceiverItemProps) => {
    const dispatch = useDispatch()
    const [sent, setSent] = useState<boolean>(false)
    const _onToggleSend = async () => {
        if (!sent) {
            const msg: PostingMessage = {
                type: messagesTypes.POST,
                create_at: new Date().getTime(),
                seen: 0,
            }
            if (type === 'post') msg.postId = (shareItem as ExtraPost).uid
            if (type === 'address') {
                msg.type = messagesTypes.ADDRESS
                msg.address_id = (shareItem as MapBoxAddress).id
            }
            await dispatch(CreateMessageRequest(msg, `${user.username}`))
        } else {
            dispatch(UndoMyLastMessageRequest(`${user.username}`))
        }
        setSent(!sent)
    }
    return (
        <View style={styles.receiverItem}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <FastImage
                    style={styles.avatar}
                    source={{
                        uri: user.avatarURL
                    }}
                />
                <View style={{
                    marginLeft: 10
                }}>
                    <Text>{user.fullname}</Text>
                    <Text style={{
                        fontWeight: "500",
                        color: '#666'
                    }}>{user.username}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={_onToggleSend}
                style={{
                    ...styles.btnSend,
                    backgroundColor: sent ? '#fff' : '#318bfb',
                    borderWidth: sent ? 1 : 0
                }}>
                <Text style={{
                    color: sent ? '#000' : '#fff',
                    fontWeight: '600'
                }}>{sent ? 'Undo' : 'Send'}</Text>
            </TouchableOpacity>
        </View>
    )
}