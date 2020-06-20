import { RouteProp } from '@react-navigation/native'
import React, { useRef, useState, useEffect } from 'react'
import { Animated, Keyboard, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput, TouchableWithoutFeedback, FlatList } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import { SuperRootStackParamList } from '../../navigations'
import { goBack } from '../../navigations/rootNavigation'
import { ExtraPost } from '../../reducers/postReducer'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT, SCREEN_WIDTH } from '../../constants'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { MapBoxAddress } from '../../utils'
import { ProfileX } from '../../reducers/profileXReducer'
type ShareToDirectRouteProp = RouteProp<SuperRootStackParamList, 'ShareToDirect'>
type ShareToDirectProps = {
    route: ShareToDirectRouteProp
}
const ShareToDirect = ({ route }: ShareToDirectProps) => {
    const { item } = route.params
    const type = 'center' in item ? 1 : 2
    const [query, setQuery] = useState<string>('')
    const [receiverList, setReceiverList] = useState<ProfileX[]>([
        {
            avatarURL: 'https://www.w3schools.com/w3css/img_lights.jpg',
            fullname: 'Vucms',
            username: 'vucms0202'
        }
    ])
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const _bottomSheetAnim = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number,
        preOffsetY: number
    }>({
        bottomSheetHeight: 0,
        preOffsetY: 0
    })

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
    const _onSend = (receiverIndex: number) => {

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
                                uri: type === 2 ? ((item as ExtraPost).source || [])[0].uri
                                    : (item as MapBoxAddress).avatarURI
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
                            <TextInput style={styles.searchInput}
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
                            style={{
                                marginVertical: 5,
                                paddingVertical: 10
                            }}
                            data={receiverList}
                            renderItem={({ item, index }) =>
                                <ReceiverItem
                                    onSend={_onSend}
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
    onSend: (i: number) => void,
    index: number
}
const ReceiverItem = ({ user, onSend, index }: ReceiverItemProps) => {
    const [sent, setSent] = useState<boolean>(false)
    const ref = useRef<{
        done: boolean
    }>({ done: false })
    useEffect(() => {
        return () => {
            if (sent && !ref.current.done) {
                onSend(index)
            }
        }
    }, [])
    const _onToggleSend = () => {
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