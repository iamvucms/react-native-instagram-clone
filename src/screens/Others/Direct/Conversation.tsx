import React, { useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, KeyboardAvoidingView, FlatList, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import FastImage from 'react-native-fast-image'
import { useSelector } from '../../../reducers'
import { RouteProp } from '@react-navigation/native'
import { SuperRootStackParamList } from '../../../navigations'
import { StackNavigationProp } from '@react-navigation/stack'
import { onlineTypes, Message, PostingMessage, seenTypes, messagesTypes } from '../../../reducers/messageReducer'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { timestampToString } from '../../../utils'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../constants'
import { store } from '../../../store'
import { useDispatch } from 'react-redux'
import { CreateMessageRequest } from '../../../actions/messageActions'
type ConversationRouteProp = RouteProp<SuperRootStackParamList, 'Conversation'>


type ConversationProps = {
    route: ConversationRouteProp
}
const Conversation = ({ route }: ConversationProps) => {
    const dispatch = useDispatch()
    const targetUsername = route.params.username
    const conversation = useSelector(state => state.messages.filter(group => group.ownUser.username === targetUsername)[0])
    const [typing, setTyping] = useState<boolean>(false)
    const [text, setText] = useState<string>('')
    const _onSendText = () => {
        if (text.length > 0) {
            const msg: PostingMessage = {
                seen: 0,
                type: 1,
                text,
                create_at: new Date().getTime(),
            }
            dispatch(CreateMessageRequest(msg, targetUsername))
            setText('')
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        onPress={goBack}
                        style={styles.btnNavigation}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            navigate('ProfileX', {
                                username: conversation.ownUser.username
                            })
                        }
                        style={styles.userInfo}>
                        <View style={styles.targetUserAvatarWrapper}>
                            <FastImage
                                style={styles.targetUserAvatar}
                                source={{
                                    uri: conversation.ownUser.avatarURL
                                }} />
                            {conversation.online.status === onlineTypes.ACTIVE &&
                                <View style={styles.onlinePoint} />
                            }
                        </View>
                        <View style={{
                            marginLeft: 10
                        }}>
                            <Text style={{
                                fontWeight: '600'
                            }}>{conversation.ownUser.fullname}</Text>
                            {conversation.online.status === onlineTypes.ACTIVE ?
                                <Text style={styles.onlineText}>Active now</Text>
                                : <Text style={styles.onlineText}>
                                    Active {timestampToString(conversation.online.last_online)} ago
                                </Text>
                            }
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.rightOptions}>
                    <TouchableOpacity style={styles.btnNavigation}>
                        <Image style={{
                            height: 24,
                            width: 24
                        }} source={require('../../../assets/icons/video-call.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnNavigation}>
                        <Image style={{
                            height: 24,
                            width: 24
                        }} source={require('../../../assets/icons/info.png')} />
                    </TouchableOpacity>
                </View>
            </View>
            <KeyboardAvoidingView
                behavior="height"
                style={styles.messagesContainer}>
                <View style={styles.inboxContainer}>
                    <FlatList
                        style={{
                            height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 88 - 40
                        }}
                        data={conversation.messageList || []}
                        renderItem={({ item, index }) =>
                            <MessageItem {...{ item, index }} />
                        }
                        keyExtractor={(__, index) => `${index}`}
                        inverted
                    />
                    <View style={styles.msgInputWrapper}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.btnCamera}>
                            <Image style={{
                                width: 20,
                                height: 20
                            }} source={require('../../../assets/icons/camera-white.png')} />
                        </TouchableOpacity>
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            multiline={true}
                            onFocus={setTyping.bind(null, true)}
                            onBlur={setTyping.bind(null, false)}
                            style={{
                                ...styles.msgInput,
                                width: (typing || text.length > 0) ? SCREEN_WIDTH - 30 - 44 - 60 : SCREEN_WIDTH - 30 - 44
                            }}
                            placeholder="Message..."
                        />
                        {(typing || text.length > 0) ? (
                            <TouchableOpacity
                                onPress={_onSendText}
                                style={styles.btnSend}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#318bfb'
                                }}>
                                    Send
                                </Text>
                            </TouchableOpacity>
                        ) : (
                                <>
                                    {text.length === 0 &&
                                        <View style={styles.msgRightOptions}>
                                            <TouchableOpacity style={styles.btnNavigation}>
                                                <Image style={{
                                                    width: 20,
                                                    height: 20
                                                }} source={require('../../../assets/icons/photo.png')} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.btnNavigation}>
                                                <Image style={{
                                                    width: 20,
                                                    height: 20
                                                }} source={require('../../../assets/icons/emoji.png')} />
                                            </TouchableOpacity>
                                        </View>
                                    }
                                </>
                            )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Conversation

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    navigationBar: {
        height: 44,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2.5,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 5,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        zIndex: 1,
    },
    rightOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5
    },
    btnNavigation: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    userInfo: {
        marginLeft: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    targetUserAvatarWrapper: {

    },
    onlinePoint: {
        position: 'absolute',
        backgroundColor: '#79d70f',
        height: 15,
        width: 15,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',
        bottom: -2,
        right: -2
    },
    onlineText: {
        fontSize: 12,
        color: '#666'
    },
    targetUserAvatar: {
        width: 30,
        height: 30,
        borderRadius: 30,
        borderColor: '#333',
        borderWidth: 0.3
    },
    messagesContainer: {
        backgroundColor: '#fff',
        width: '100%',
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
        paddingBottom: 20
    },
    inboxContainer: {
        width: '100%',
        position: 'absolute',
        zIndex: 1,
        bottom: 20,
        left: 0
    },
    msgInputWrapper: {
        marginTop: 20,
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        minHeight: 44,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between'
    },
    btnCamera: {
        height: 34,
        width: 34,
        margin: 4,
        borderRadius: 34,
        backgroundColor: '#318bfb',
        justifyContent: 'center',
        alignItems: 'center'
    },
    msgInput: {
        paddingHorizontal: 10,
        marginVertical: 5
    },
    btnSend: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
    },
    msgRightOptions: {
        flexDirection: 'row',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginRight: 4
    },
    messageItem: {
        width: '100%',
        flexDirection: 'row',
        marginVertical: 5
    },
    message: {
        paddingHorizontal: 15,
        borderColor: '#ddd',
        borderWidth: 1,
        marginHorizontal: 15,
        borderRadius: 40,
        maxWidth: SCREEN_WIDTH * 0.6
    },
    myMessage: {
        backgroundColor: '#ddd'
    },
    yourMessage: {

    },
    msgText: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    }
})
interface MessageItemProps {
    item: Message,
    index: number
}
export const MessageItem = React.memo(({ item, index }: MessageItemProps) => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const isMyMessage = item.userId === myUsername
    return (
        <TouchableOpacity
            activeOpacity={1}
            style={{
                ...styles.messageItem,
                justifyContent: isMyMessage ? 'flex-end' : 'flex-start'
            }}>
            <View style={[styles.message, isMyMessage
                ? styles.myMessage : styles.yourMessage]}>
                <Text style={styles.msgText}>{item.text}</Text>
            </View>
        </TouchableOpacity>
    )
})