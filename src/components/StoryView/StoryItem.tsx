import React, { useEffect, useRef, useState } from 'react'
import { Animated, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { StoryController } from '.'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { seenTypes } from '../../reducers/notificationReducer'
import { ExtraStory } from '../../reducers/storyReducer'
import { store } from '../../store'
import { timestampToString } from '../../utils'
import SuperImage from '../SuperImage'
import { firestore } from 'firebase'
export interface StoryProps {
    item: ExtraStory,
    index: number,
    maxIndex: number,
    controller: StoryController,
    setController: (preGroupIndex: number, nextGroupIndex: number) => void
}
const StoryItem = ({ item, index, maxIndex, controller, setController }: StoryProps) => {

    const getNextIndex = (): number => {
        let nextIndex = 0
        item.storyList.every((story, storyIndex) => {
            if (story.seen === seenTypes.NOTSEEN) {
                nextIndex = storyIndex
                return false
            }
            return true
        })
        return nextIndex
    }
    const myInfo = store.getState().user.user.userInfo
    const [childIndex, setChildIndex] = useState<number>(getNextIndex())
    const [seenAll, setSeenAll] = useState<boolean>(false)
    const [state, setState] = useState<object>({})
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
            animXList.map(animX => animX.stopAnimation())
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
        console.warn(ref.current.message)
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
            /**
             Still be error here.
             */
        } else {
            setController(index, index - 1)
        }
        // animXList.map(animX => animX.stopAnimation())
    }
    const timeoutBarItemWidth = SCREEN_WIDTH / item.storyList.length - 1 * (item.storyList.length - 1)
    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFillObject}>
                {item.storyList.map((storyItem, storyIndex) => (
                    <View key={storyIndex}>
                        {((index === controller.currentGroupIndex && storyIndex === childIndex) || storyIndex === childIndex) &&
                            <SuperImage
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
                    }}>{timestampToString(item.storyList[childIndex].create_at?.toMillis() || 0)}</Text>}
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
                    <FastImage
                        source={{
                            uri: myInfo?.avatarURL
                        }}
                        style={styles.messageAvatar} />
                    <TextInput
                        onFocus={() => {
                            stopAnimation()
                        }}
                        onBlur={() => {
                            setState({})
                        }}
                        onSubmitEditing={_onSendMessage}
                        returnKeyType="send"
                        textAlignVertical="center"
                        placeholder="Send a message"
                        placeholderTextColor="#fff"
                        onChangeText={e => ref.current.message = e}
                        style={styles.messageInput} />
                    <ScrollView
                        keyboardShouldPersistTaps="always"
                        contentContainerStyle={{
                            height: 44
                        }}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableOpacity
                            style={styles.btnSend}>
                            <Icon name="send" size={36} color="#fff" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}

export default React.memo(StoryItem)

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
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
    }
})
