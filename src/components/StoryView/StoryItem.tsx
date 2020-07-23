import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View, Keyboard } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { StoryController } from '.'
import { DeleteStoryRequest, FetchStoryListRequest } from '../../actions/storyActions'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { seenTypes } from '../../reducers/notificationReducer'
import { ProfileX } from '../../reducers/profileXReducer'
import { ExtraStory } from '../../reducers/storyReducer'
import { store } from '../../store'
import { timestampToString } from '../../utils'
import SuperImage from '../SuperImage'
import { goBack, navigate } from '../../navigations/rootNavigation'
import { messagesTypes, PostingMessage } from '../../reducers/messageReducer'
import { CreateMessageRequest } from '../../actions/messageActions'
export interface StoryProps {
    item: ExtraStory,
    index: number,
    maxIndex: number,
    controller: StoryController,
    setController: (preGroupIndex: number, nextGroupIndex: number) => void
}
const StoryItem = ({ item, index, maxIndex, controller, setController }: StoryProps) => {
    const getNextIndex = React.useCallback((): number => {
        let nextIndex = 0
        item.storyList.every((story, storyIndex) => {
            if (story.seen === seenTypes.NOTSEEN) {
                nextIndex = storyIndex
                return false
            }
            return true
        })
        return nextIndex
    }, [])
    const dispatch = useDispatch()
    const myInfo = store.getState().user.user.userInfo
    const myUsername = myInfo?.username || ''
    const isMyStory = myUsername === item.ownUser.username
    const [showOptions, setShowOptions] = useState<boolean>(false)
    const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false)
    const [childIndex, setChildIndex] = useState<number>(getNextIndex())
    const [seenAll, setSeenAll] = useState<boolean>(false)
    const [state, setState] = useState<object>({})
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
    const ref = useRef<{
        message: string,
        allowAnimationCallback: boolean,
    }>({
        message: '',
        allowAnimationCallback: false,
    })
    const animXList = item.storyList.map(x => new Animated.Value(0))
    useEffect(() => {
        return () => {
            stopAnimation()
        }
    }, [])
    useEffect(() => {
        const db = firestore()
        if (controller.currentGroupIndex === index) {
            if (seenAll) {
                animXList.map(animX => animX.setValue(0))
                setSeenAll(false)
                return setChildIndex(0)
            }
            animXList.every((animX, animIndex) => {
                if (animIndex === childIndex) {
                    ref.current.allowAnimationCallback = true
                    animX.setValue(0)
                    Animated.timing(animX, {
                        toValue: 1,
                        duration: 10000,
                        useNativeDriver: false//Can true but stopAnimation will not work
                    }).start(() => {
                        db.collection('stories').doc(`${item.storyList[animIndex].uid}`).get()
                            .then(storyDoc => {
                                const currentSeenList: string[] = (storyDoc.data() || {}).seenList || []
                                if (currentSeenList.indexOf(`${myInfo?.username}`) < 0) {
                                    currentSeenList.push(`${myInfo?.username}`)
                                    storyDoc.ref.update({
                                        seenList: currentSeenList
                                    })
                                }
                            })
                        item.storyList[animIndex].seen = seenTypes.SEEN as 0 | 1
                        //Wait for update ref.current.allowAnimationCallback if swipe to another groupItem
                        setTimeout(() => {
                            if (ref.current.allowAnimationCallback) {
                                if (childIndex + 1 < item.storyList.length) {
                                    setChildIndex(childIndex + 1)
                                } else {
                                    if (index < maxIndex) setSeenAll(true)
                                    setController(index, index + 1)
                                }
                            }
                        }, 200);
                    })
                    return false
                }
                animX.setValue(1)
                return true
            })
        } else {
            stopAnimation()
        }
    }, [controller, childIndex, seenAll, state])
    const _onSendMessage = () => {
        Keyboard.dismiss()
        if (ref.current.message.length > 0) {
            const msg: PostingMessage = {
                seen: 0,
                type: messagesTypes.REPLY_STORY,
                text: ref.current.message,
                superImageId: item.storyList[childIndex].source,
                create_at: new Date().getTime(),
            }
            dispatch(CreateMessageRequest(msg, item.ownUser.username as string))
            ref.current.message = ''
        }
    }
    const _onNext = () => {
        if (childIndex + 1 < item.storyList.length) {
            setChildIndex(childIndex + 1)
            stopAnimation()
        } else {
            if (index < maxIndex) setSeenAll(true)
        }
    }
    const stopAnimation = (allowCallback: boolean = false) => {
        ref.current.allowAnimationCallback = allowCallback
        animXList.map(animX => animX.stopAnimation())
    }
    const _onBack = () => {
        if (childIndex > 0) {
            stopAnimation()
            animXList.slice(childIndex).map(animX => animX.setValue(0))
            setTimeout(() => {
                setChildIndex(childIndex - 1)
            }, 300);
        } else {
            setController(index, index - 1)
        }
    }
    const _onConfirmDelete = async () => {
        const uid = item.storyList[childIndex].uid || 0
        await dispatch(DeleteStoryRequest(uid))
        setShowMoreOptions(false)
        goBack()
        dispatch(FetchStoryListRequest())
    }
    const timeoutBarItemWidth = SCREEN_WIDTH / item.storyList.length - 1 * (item.storyList.length - 1)
    const seenList = [...(item?.storyList[childIndex]?.seenList || [])]
    const i = seenList.indexOf(myUsername)
    if (index > -1) seenList.splice(i, 1)
    const previewSeenList = [...seenList].splice(-5)
    return (
        <React.Fragment>
            {showConfirmDelete &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                        setShowConfirmDelete(false)
                        setState({})
                    }}
                    style={styles.backdrop}>
                    <View style={styles.confirmBox}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600",
                            marginBottom: 15
                        }}>Delete Story?</Text>
                        <TouchableOpacity
                            onPress={_onConfirmDelete}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: 'red'
                            }}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowConfirmDelete(false)
                                setState({})
                            }}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            {showOptions &&
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={() => {
                        setShowOptions(false)
                        setState({})
                    }}
                    activeOpacity={1}>
                    <View style={styles.optionsWrapper}>
                        <TouchableHighlight
                            underlayColor="#eee"
                            style={styles.optionItem}>
                            <Text>Report...</Text>
                        </TouchableHighlight>
                    </View>
                </TouchableOpacity>
            }
            {showMoreOptions &&
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={() => {
                        setShowMoreOptions(false)
                        setState({})
                    }}
                    activeOpacity={1}>
                    <View style={styles.optionsWrapper}>
                        <TouchableHighlight
                            underlayColor="#eee"
                            onPress={() => {
                                setShowConfirmDelete(true)
                                setShowMoreOptions(false)
                            }}
                            style={styles.optionItem}>
                            <Text>Delete</Text>
                        </TouchableHighlight>
                        {/* <TouchableHighlight
                            underlayColor="#eee"
                            onPress={() => { }}
                            style={styles.optionItem}>
                            <Text>Send to...</Text>
                        </TouchableHighlight> */}
                        <TouchableHighlight
                            underlayColor="#eee"
                            onPress={() => {
                                stopAnimation()
                                navigate('StoryPrivacy')
                            }}
                            style={styles.optionItem}>
                            <Text>Story Settings</Text>
                        </TouchableHighlight>
                    </View>
                </TouchableOpacity>
            }
            <View style={styles.container}>
                <View style={StyleSheet.absoluteFillObject}>
                    {item.storyList.map((storyItem, storyIndex) => (
                        <View key={storyIndex}>
                            {((index === controller.currentGroupIndex && storyIndex === childIndex) || storyIndex === childIndex) &&
                                <SuperImage
                                    onStopAnimation={stopAnimation}
                                    onNext={_onNext}
                                    onBack={_onBack}
                                    superId={storyItem.source as number} />
                            }
                        </View>
                    ))}
                </View>
                <View style={styles.topWrapper}>
                    <View style={styles.topInfo}>
                        <FastImage style={styles.avatar} source={{
                            uri: item.ownUser.avatarURL
                        }} />
                        <Text style={{
                            fontWeight: '600',
                            color: '#fff',
                            marginLeft: 10
                        }}>{item.ownUser.username}</Text>
                        {controller.currentGroupIndex === index && <Text style={{
                            fontWeight: '600',
                            color: '#ddd',
                            marginLeft: 10
                        }}>{timestampToString(item.storyList[childIndex]?.create_at?.toMillis() || 0)}</Text>}
                    </View>
                    <View style={styles.timeoutBarWrapper}>
                        {item.storyList.map((storyItem, storyIndex) => (
                            <View key={storyIndex} style={{
                                ...styles.timeoutBarItem,
                                width: timeoutBarItemWidth,
                            }}>
                                <Animated.View style={{
                                    ...StyleSheet.absoluteFillObject,
                                    width: timeoutBarItemWidth,
                                    backgroundColor: '#fff',
                                    transform: [{
                                        translateX: animXList[storyIndex].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-timeoutBarItemWidth, 0],
                                            extrapolate: 'clamp'
                                        })
                                    }]
                                }} />
                            </View>
                        ))}
                    </View>
                </View>
                <KeyboardAvoidingView style={{
                    width: SCREEN_WIDTH,
                    height: 80,
                    position: 'absolute',
                    bottom: 0,
                    left: 0
                }}
                    behavior="position"
                >
                    <View style={styles.bottomWrapper}>
                        {!isMyStory &&
                            <React.Fragment>
                                <FastImage
                                    source={{
                                        uri: myInfo?.avatarURL
                                    }}
                                    style={styles.messageAvatar} />
                                <View>
                                    <TextInput
                                        onFocus={() => {
                                            stopAnimation()
                                        }}
                                        onBlur={() => {
                                            setState({})
                                        }}
                                        clearTextOnFocus={true}
                                        onSubmitEditing={_onSendMessage}
                                        returnKeyType="send"
                                        textAlignVertical="center"
                                        placeholder="Send a message"
                                        placeholderTextColor="#fff"
                                        onChangeText={e => ref.current.message = e}
                                        style={styles.messageInput} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowOptions(true)
                                            stopAnimation()
                                        }}
                                        style={styles.btnOptions}>
                                        <Icon name="dots-vertical" color="#fff" size={24} />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={styles.btnSend}>
                                    <Icon name="send" size={36} color="#fff" />
                                </TouchableOpacity>
                            </React.Fragment>
                        }
                        {isMyStory &&
                            <React.Fragment>
                                <View>
                                    {seenList.length > 0 &&
                                        <SeenPreviewList
                                            stopAnimation={stopAnimation}
                                            childIndex={childIndex}
                                            extraStory={{ ...item }}
                                            seenCount={seenList.length}
                                            previewSeenList={previewSeenList} />
                                    }
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            stopAnimation()
                                            navigate('AddToHighlights', {
                                                superId: item.storyList[childIndex].source,
                                                uid: item.storyList[childIndex].uid
                                            })
                                        }}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 15
                                        }}>
                                        <View style={{
                                            height: 30,
                                            width: 30,
                                            borderRadius: 30,
                                            borderColor: "#fff",
                                            borderWidth: 2,
                                            borderStyle: 'dashed',
                                            marginBottom: 5,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Icon name="heart" size={14} color="#fff" />
                                        </View>
                                        <Text style={{
                                            color: '#fff',
                                            fontWeight: '500',
                                            fontSize: 12
                                        }}>Highlight</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowMoreOptions(true)
                                            stopAnimation()
                                        }}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <View style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: 30,
                                            width: 30,
                                            marginBottom: 5,
                                        }}>
                                            <Icon name="dots-vertical" size={30} color="#fff" />
                                        </View>
                                        <Text style={{
                                            color: '#fff',
                                            fontWeight: '500',
                                            fontSize: 12
                                        }}>More</Text>
                                    </TouchableOpacity>
                                </View>
                            </React.Fragment>
                        }
                    </View>
                </KeyboardAvoidingView>
            </View>
        </React.Fragment >
    )
}

export default React.memo(StoryItem)

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    backdrop: {
        height: '100%',
        width: '100%',
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionsWrapper: {
        overflow: "hidden",
        width: '80%',
        borderRadius: 5,
        backgroundColor: "#fff"
    },
    optionItem: {
        height: 44,
        paddingHorizontal: 15,
        justifyContent: 'center'
    },
    topWrapper: {
        height: 50 + STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT
    },
    timeoutBarWrapper: {
        position: 'absolute',
        top: STATUS_BAR_HEIGHT,
        height: 3,
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: "row",
        alignItems: 'center',
    },
    timeoutBarItem: {
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 3,
        overflow: 'hidden'
    },
    topInfo: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginVertical: 5
    },
    bottomWrapper: {
        width: '100%',
        height: 80,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 30
    },
    messageAvatar: {
        width: 44,
        height: 44,
        borderRadius: 44,
        borderColor: '#ddd',
        borderWidth: 1
    },
    messageInput: {
        height: 44,
        width: SCREEN_WIDTH - 30 - 44 * 2 - 20,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 44,
        marginHorizontal: 10,
        paddingHorizontal: 15,
        color: '#fff',
        fontSize: 16
    },
    btnSend: {
        height: 44,
        width: 44,
        justifyContent: "center",
        alignItems: 'center',
    },
    btnOptions: {
        position: "absolute",
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        right: 10
    },
    previewSeenList: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    previewAvatar: {
        borderRadius: 30,
        height: 30,
        width: 30,
        borderColor: '#fff',
        borderWidth: 2
    },

    confirmBox: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        backgroundColor: '#fff',
        borderRadius: 10
    },
    btnConfirm: {
        height: 44,
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: '#ddd',
        borderTopWidth: 1
    },
})
interface SeenPreviewListProps {
    previewSeenList: string[],
    seenCount: number,
    childIndex: number,
    extraStory: ExtraStory,
    stopAnimation: () => void
}
const SeenPreviewList = ({ seenCount, stopAnimation, childIndex, previewSeenList, extraStory }: SeenPreviewListProps) => {
    const [seenListPreviewInfo, setSeenListPreviewInfo] = useState<ProfileX[]>([])
    useEffect(() => {
        const previewInfoUsernames = Array.from(new Set(previewSeenList))
        const db = firestore()
        const fetchPreviewSeenListInfoTask: Promise<ProfileX>[] = previewInfoUsernames.map(async usr => {
            const rq = await db.collection('users').doc(`${usr}`).get()
            return rq.data() || {}
        })
        Promise.all(fetchPreviewSeenListInfoTask).then(userData => {
            setSeenListPreviewInfo(userData)
        })
    }, [previewSeenList])
    const _onShowDetail = () => {
        stopAnimation()
        navigate('StorySeenList', {
            extraStory,
            childIndex
        })
    }
    return (
        <TouchableOpacity
            onPress={_onShowDetail}
        >
            <View style={styles.previewSeenList}>
                {previewSeenList.map((usr, idx) => (
                    <FastImage
                        key={idx}
                        style={{
                            ...styles.previewAvatar,
                            zIndex: idx,
                            marginLeft: idx !== 0 ? -10 : 0
                        }}
                        source={{ uri: seenListPreviewInfo.find(x => x.username === usr)?.avatarURL }}
                    />
                ))}
            </View>
            <Text style={{
                color: '#fff',
                fontWeight: '500'
            }}>Seen by {seenCount}</Text>

        </TouchableOpacity>
    )
}