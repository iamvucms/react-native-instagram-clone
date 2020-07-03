import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useRef } from 'react'
import { Animated, Text, FlatList, LayoutChangeEvent, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { FetchSettingRequest } from '../../../actions/userActions'
import { SCREEN_WIDTH } from '../../../constants'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack } from '../../../navigations/rootNavigation'
import { emojiList } from '../../Others/StoryProcessor'
import { PostingMessage, messagesTypes } from '../../../reducers/messageReducer'
import { CreateMessageRequest } from '../../../actions/messageActions'
type EmojiOptionsRouteProp = RouteProp<SuperRootStackParamList, 'EmojiOptions'>


type EmojiOptionsProps = {
    route: EmojiOptionsRouteProp
}
const EmojiOptions = ({ route }: EmojiOptionsProps) => {
    const dispatch = useDispatch()
    const { targetUsername } = route.params
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number
    }>({
        bottomSheetHeight: 0
    })
    const _onGestureEventHandler = ({ nativeEvent: {
        translationY
    } }: PanGestureHandlerGestureEvent) => {
        if (translationY > 0) {
            _bottomSheetOffsetY.setValue(translationY)
        }
    }
    const _onStateChangeHandler = ({
        nativeEvent: {
            translationY,
            state
        }
    }: PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            if (translationY > ref.current.bottomSheetHeight * 0.6) {
                Animated.timing(_bottomSheetOffsetY, {
                    toValue: ref.current.bottomSheetHeight,
                    useNativeDriver: true,
                    duration: 150
                }).start(() => goBack())
            } else {
                Animated.spring(_bottomSheetOffsetY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start()
            }
        }
    }
    const _onSendEmoji = (emoji: string) => {
        const msg: PostingMessage = {
            seen: 0,
            type: messagesTypes.EMOJI,
            text: emoji,
            create_at: new Date().getTime(),
        }
        dispatch(CreateMessageRequest(msg, targetUsername))
        goBack()
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
                    </View>
                    <View>
                        <View style={styles.searchInputWrapper}>
                            <View style={styles.btnSearch}>
                                <Icon name="magnify" size={20} color="#666" />
                            </View>
                            <TextInput
                                placeholder="Search Emoji"
                                style={styles.searchInput} />
                        </View>
                        <View>
                            <FlatList
                                style={{
                                    height: 500 - 20 - 36 - 30
                                }}
                                numColumns={5}
                                data={emojiList}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity
                                        onPress={() => _onSendEmoji(item)}
                                        style={styles.btnEmoji}>
                                        <Text style={{
                                            fontSize: 30
                                        }}>{item}</Text>
                                    </TouchableOpacity>
                                }
                                keyExtractor={(__, index) => `${index}`}
                            />
                        </View>
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </SafeAreaView>
    )
}

export default EmojiOptions

const styles = StyleSheet.create({
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        height: 500,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    titleWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 20
    },
    searchInputWrapper: {
        marginVertical: 15,
        flexDirection: 'row',
        height: 36,
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        borderRadius: 5,
        borderColor: '#ddd',
        borderWidth: 1
    },
    searchInput: {
        height: '100%',
        width: SCREEN_WIDTH - 30 - 36,
    },
    btnSearch: {
        height: 36,
        width: 36,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnEmoji: {
        width: SCREEN_WIDTH / 5,
        height: SCREEN_WIDTH / 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
