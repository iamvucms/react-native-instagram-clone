import React, { useEffect, useRef, useState } from 'react'
import { Animated, KeyboardAvoidingView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { goBack, navigate } from '../../navigations/rootNavigation'
import { Highlight } from '../../reducers/userReducer'
import SuperImage from '../SuperImage'
import { useDispatch } from 'react-redux'
import { RemoveFromHighlightRequest, FetchHighlightRequest } from '../../actions/userActions'
export interface HighlightView {
    highlight: Highlight,
    isMyHighlight?: boolean,
}
const HighlightView = ({ highlight, isMyHighlight }: HighlightView) => {
    const dispatch = useDispatch()
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
    const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false)
    const [childIndex, setChildIndex] = useState<number>(0)
    const animXList = highlight.stories.map(x => new Animated.Value(0))
    const [state, setState] = useState<object>({})
    const ref = useRef<{
        allowAnimationCallback: boolean,
    }>({
        allowAnimationCallback: false,
    })
    useEffect(() => {
        return () => {
            stopAnimation()
        }
    }, [])
    //effect
    useEffect(() => {
        animXList.every((animX, animIndex) => {
            if (animIndex === childIndex) {
                ref.current.allowAnimationCallback = true
                animX.setValue(0)
                Animated.timing(animX, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: false//Can true but stopAnimation will not work
                }).start(() => {
                    setTimeout(() => {
                        if (ref.current.allowAnimationCallback) {
                            if (childIndex + 1 < highlight.stories.length) {
                                setChildIndex(childIndex + 1)
                            } else goBack()
                        }
                    }, 100);
                })
                return false
            }
            animX.setValue(1)
            return true
        })
    }, [childIndex, state])
    const stopAnimation = (allowCallback: boolean = false) => {
        ref.current.allowAnimationCallback = allowCallback
        animXList.map(animX => animX.stopAnimation())
    }
    const _onConfirmDelete = () => {
        goBack()
        dispatch(RemoveFromHighlightRequest(highlight.stories[childIndex].uid, highlight.name))
    }
    const _onNext = () => {
        if (childIndex + 1 < highlight.stories.length) {
            setChildIndex(childIndex + 1)
        } else goBack()
    }
    const _onBack = () => {
        if (childIndex > 0) {
            stopAnimation()
            animXList.slice(childIndex).map(animX => animX.setValue(0))
            setTimeout(() => {
                setChildIndex(childIndex - 1)
            }, 200);
        }
    }
    const timeoutBarItemWidth = SCREEN_WIDTH / highlight.stories.length - 1 * (highlight.stories.length - 1)
    return (
        <View>
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
                            }}>Remove Story from Highlight?</Text>
                            <TouchableOpacity
                                onPress={_onConfirmDelete}
                                style={styles.btnConfirm}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                    color: 'red'
                                }}>Remove</Text>
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
                {showMoreOptions &&
                    <TouchableOpacity
                        style={styles.backdrop}
                        onPress={() => {
                            setShowMoreOptions(false)
                            setState({})
                        }}
                        activeOpacity={1}>
                        <View style={styles.optionsWrapper}>
                            {isMyHighlight &&
                                <>
                                    <TouchableHighlight
                                        underlayColor="#eee"
                                        onPress={() => {
                                            navigate('EditHighlight', {
                                                name: highlight.name
                                            })
                                            setShowMoreOptions(false)
                                        }}
                                        style={styles.optionItem}>
                                        <Text>Edit Highlight</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        underlayColor="#eee"
                                        onPress={() => {
                                            setShowConfirmDelete(true)
                                            setShowMoreOptions(false)
                                        }}
                                        style={styles.optionItem}>
                                        <Text>Remove from Highlight</Text>
                                    </TouchableHighlight>
                                </>
                            }
                            <TouchableHighlight
                                underlayColor="#eee"
                                onPress={() => {
                                }}
                                style={styles.optionItem}>
                                <Text>Copy Link...</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor="#eee"
                                onPress={() => {
                                }}
                                style={styles.optionItem}>
                                <Text>Share to...</Text>
                            </TouchableHighlight>
                        </View>
                    </TouchableOpacity>
                }
                <View style={styles.container}>
                    <View style={StyleSheet.absoluteFillObject}>
                        {[...highlight.stories].map((storyItem, storyIndex) => (
                            <View key={storyIndex}>
                                {storyIndex === childIndex &&
                                    <SuperImage
                                        onStopAnimation={stopAnimation}
                                        onNext={_onNext}
                                        onBack={_onBack}
                                        superId={storyItem.superId} />
                                }
                            </View>
                        ))}
                    </View>
                    <View style={styles.topWrapper}>
                        <View style={styles.topInfo}>
                            <FastImage style={styles.avatar} source={{
                                uri: highlight.avatarUri
                            }} />
                            <Text style={{
                                fontWeight: '600',
                                color: '#fff',
                                marginLeft: 10
                            }}>{highlight.name}</Text>
                        </View>
                        <View style={styles.timeoutBarWrapper}>
                            {[...highlight.stories].map((storyItem, storyIndex) => (
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
                            <TouchableOpacity style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 15
                            }}>

                                <Icon name="share" size={30} color="#fff" />
                                <Text style={{
                                    color: '#fff',
                                    fontWeight: '500',
                                    fontSize: 12
                                }}>Share to...</Text>
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
                    </KeyboardAvoidingView>
                </View>
            </React.Fragment >
        </View>
    )
}

export default HighlightView

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
        justifyContent: "flex-end",
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
