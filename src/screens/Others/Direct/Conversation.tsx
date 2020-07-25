import CameraRoll from '@react-native-community/cameraroll'
import { RouteProp } from '@react-navigation/native'
import { storage } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, FlatList, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { AddEmoijToMessageRequest, CreateEmptyConversationRequest, CreateMessageRequest, MakeSeenRequest, RemoveEmoijToMessageRequest } from '../../../actions/messageActions'
import MessageItem from '../../../components/MessageItem'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../../constants'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { emojiTypes, messagesTypes, onlineTypes, PostingMessage, seenTypes } from '../../../reducers/messageReducer'
import { store } from '../../../store'
import { timestampToString, uriToBlob } from '../../../utils'
type ConversationRouteProp = RouteProp<SuperRootStackParamList, 'Conversation'>
type ConversationProps = {
    route: ConversationRouteProp
}
const Conversation = ({ route }: ConversationProps) => {
    const dispatch = useDispatch()
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const targetUsername = route.params.username
    const myCurrentBlockAccounts = useSelector(state => state.user.setting?.privacy?.blockedAccounts?.blockedAccounts) || []
    const conversation = useSelector(state => state.messages.filter(group => group.ownUser.username === targetUsername)[0])
    const [typing, setTyping] = useState<boolean>(false)
    const [uploadingImage, setUploadingImage] = useState<boolean>(false)
    const [text, setText] = useState<string>('')
    const [page, setPage] = useState<number>(1)
    const [groups, setGroups] = useState<string[]>([])
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
    const [photos, setPhotos] = useState<CameraRoll.PhotoIdentifier[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1)
    const _flatlistRef = useRef<FlatList>(null)
    const _galleryAnim = React.useMemo(() => new Animated.Value(0), [])
    const _emojiBarAnimX = React.useMemo(() => new Animated.Value(0), [])
    const _emojiBarAnimY = React.useMemo(() => new Animated.Value(0), [])
    const _emojiBarAnimRatio = React.useMemo(() => new Animated.Value(0), [])
    const _emojiPointAnimOffsetX = React.useMemo(() => new Animated.Value(0), [])
    const _emojiPointAnimOpacity = React.useMemo(() => new Animated.Value(0), [])
    const [selectedEmoijTargetIndex, setSelectedEmoijTargetIndex] = useState<number>(-1)
    const [showGallery, setShowGallery] = useState<boolean>(false)
    const ref = useRef<{
        scrollTimeOut: NodeJS.Timeout,
        text: string,
        preventNextScrollToEnd: boolean
    }>({
        scrollTimeOut: setTimeout(() => { }, 0),
        text: '',
        preventNextScrollToEnd: false
    })

    useEffect(() => {
        CameraRoll.getPhotos({ assetType: 'Photos', first: 1000 })
            .then(result => {
                const photos = result.edges
                const groupList = Array.from(new Set(photos.map(photo => photo.node.group_name)))
                setGroups(groupList)
                if (groupList.length > 0) setSelectedGroupIndex(0)
            })
        return () => {
        }
    }, [])
    useEffect(() => {
        if (!!!conversation) {
            dispatch(CreateEmptyConversationRequest(targetUsername))
            return;
        }
        if (conversation.messageList.length > 0) {
            const myUsername = store.getState().user.user.userInfo?.username || ''
            const isMyMessage = conversation.messageList[0].userId === myUsername
            const unRead = !isMyMessage && conversation.messageList[0].seen === seenTypes.NOTSEEN
            if (unRead) {
                dispatch(MakeSeenRequest(conversation.messageList[0].userId, conversation.messageList[0].uid))
            }
        }
    }, [conversation])
    useEffect(() => {
        if (selectedGroupIndex > -1) {
            CameraRoll.getPhotos({
                assetType: 'Photos',
                first: 9 * page,
                groupName: groups[selectedGroupIndex]
            })
                .then(result => {
                    const photos = result.edges
                    setPhotos(photos)
                    if (photos.length > 0 && selectedIndex < 0) setSelectedIndex(0)
                })
        }
    }, [selectedGroupIndex, page])
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
    const _onShowGallery = () => {
        ref.current.text = text
        setText('')
        Animated.spring(_galleryAnim, {
            toValue: MAX_GALLERY_HEIGHT,
            useNativeDriver: true
        }).start()
        setShowGallery(true)
    }
    const _onHideGallery = () => {
        setText(ref.current.text)
        Animated.spring(_galleryAnim, {
            toValue: 0,
            useNativeDriver: true
        }).start()
        setShowGallery(false)
    }
    const _onMsgInputFocus = () => {
        setTyping(true)
    }
    const _onLoadmore = () => {
        setPage(page + 1)
    }
    const _onSelectImage = (index: number) => {
        const position = selectedPhotos.indexOf(index)
        if (position > -1) {
            const temp = [...selectedPhotos]
            temp.splice(position, 1)
            setSelectedPhotos(temp)
        } else {
            const temp = [...selectedPhotos]
            temp.push(index)
            setSelectedPhotos(temp)
        }
    }
    const _onUploadImage = async () => {
        setUploadingImage(true)
        if (selectedPhotos.length > 0) {
            const timestamp = new Date().getTime()
            const uploadTasks: Promise<string>[] = selectedPhotos.map(async index => {
                const img = photos[index].node.image
                const extension = img.filename.split('.').pop()?.toLowerCase()
                const blob = await uriToBlob(img.uri)
                const rq = await storage()
                    .ref(`messages/${myUsername}/${new Date().getTime() + Math.random()}.${extension}`)
                    .put(blob as Blob, {
                        contentType: `image/${extension}`
                    })
                const downloadUri = await rq.ref.getDownloadURL()
                return downloadUri
            })
            Promise.all(uploadTasks).then(rs => {
                const sendingTask = rs.map(async (uri, index) => {
                    const message: PostingMessage = {
                        uid: timestamp + index,
                        create_at: timestamp,
                        type: messagesTypes.IMAGE,
                        sourceUri: uri,
                        seen: 0,
                        width: photos[index].node.image.width,
                        height: photos[index].node.image.height,
                    }
                    dispatch(CreateMessageRequest(message, targetUsername))
                })
                Promise.all(sendingTask).then(() => {
                    setUploadingImage(false)
                    _onHideGallery()
                    setSelectedPhotos([])
                })
            })
        }
    }
    const _onShowEmojiSelection = React.useCallback((px: number, py: number, index: number) => {
        setSelectedEmoijTargetIndex(index)
        _emojiBarAnimY.setValue(py - 50)
        if (px > SCREEN_WIDTH / 2) {
            _emojiBarAnimX.setValue(SCREEN_WIDTH - 15 - EMOJI_SELECTION_BAR_WIDTH)
        } else _emojiBarAnimX.setValue(15)
        //show selected emoji
        const targetMsg = conversation.messageList[index]
        const isMyMessage = targetMsg.userId === myUsername
        if (targetMsg.ownEmoji && isMyMessage) {
            _emojiPointAnimOffsetX.setValue(7.5 + (targetMsg.ownEmoji - 1) * 44 + 22 - 1.5)
        }
        if (targetMsg.yourEmoji && !isMyMessage) {
            _emojiPointAnimOffsetX.setValue(7.5 + (targetMsg.yourEmoji - 1) * 44 + 22 - 1.5)
        }
        if (!(targetMsg.ownEmoji && isMyMessage)
            && !(targetMsg.yourEmoji && !isMyMessage)
        ) _emojiPointAnimOpacity.setValue(0)
        else _emojiPointAnimOpacity.setValue(1)
        //end show selected emoji
        Animated.spring(_emojiBarAnimRatio, {
            useNativeDriver: true,
            toValue: 1
        }).start()
    }, [conversation?.messageList])
    const _onHideEmojiSelection = () => {
        Animated.timing(_emojiBarAnimRatio, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => setSelectedEmoijTargetIndex(-1))
    }
    const _onEmojiSelect = (emojiType:
        'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' | 'LIKE') => {
        ref.current.preventNextScrollToEnd = true
        _onHideEmojiSelection()
        const emoji = emojiTypes[emojiType]
        const targetMsg = conversation.messageList[selectedEmoijTargetIndex]
        const isMyMessage = targetMsg.userId === myUsername
        if (targetMsg.ownEmoji === emoji && isMyMessage
            || targetMsg.yourEmoji === emoji && !isMyMessage) {
            return dispatch(RemoveEmoijToMessageRequest(targetUsername, targetMsg.uid))
        }
        dispatch(AddEmoijToMessageRequest(targetUsername,
            targetMsg.uid, emoji))
    }
    const _onMessageBoxSizeChange = () => {
        if (conversation.messageList.length > 0 && !ref.current.preventNextScrollToEnd) {
            clearTimeout(ref.current.scrollTimeOut)
            ref.current.scrollTimeOut = setTimeout(() => {
                _flatlistRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                })
            }, 1000);
        }
        if (ref.current.preventNextScrollToEnd) {
            ref.current.preventNextScrollToEnd = false
        }
    }
    if (!!!conversation || !!!conversation.online) return (
        <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center'
        }}></View>
    )
    const isBlocked = myCurrentBlockAccounts.indexOf(targetUsername) > -1
        || (conversation.ownUser.privacySetting?.blockedAccounts?.blockedAccounts
            && conversation.ownUser.privacySetting?.blockedAccounts?.blockedAccounts
                .indexOf(myUsername) > -1)
    return (
        <View style={styles.container}>
            {selectedEmoijTargetIndex > -1 &&
                <TouchableOpacity
                    style={{
                        width: SCREEN_WIDTH,
                        height: SCREEN_HEIGHT,
                        position: 'absolute',
                        zIndex: 10,
                        top: 0,
                        left: 0
                    }}
                    onPress={_onHideEmojiSelection}
                    activeOpacity={1}>
                    <Animated.View style={{
                        ...styles.emojiSelectionBar,
                        transform: [{
                            translateY: _emojiBarAnimY
                        }, {
                            translateX: _emojiBarAnimX
                        }, {
                            scale: _emojiBarAnimRatio
                        }
                        ]
                    }}>
                        {
                            <Animated.View style={{
                                ...styles.selectedEmojiPoint,
                                opacity: _emojiPointAnimOpacity,
                                transform: [
                                    {
                                        translateX: _emojiPointAnimOffsetX
                                    }
                                ]
                            }} />
                        }
                        <TouchableOpacity
                            onPress={_onEmojiSelect.bind(null, 'LOVE')}
                            style={styles.btnEmoji}>
                            <Text style={styles.emoji}>❤️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onEmojiSelect.bind(null, 'HAHA')}
                            style={styles.btnEmoji}>
                            <Text style={styles.emoji}>😂</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onEmojiSelect.bind(null, 'WOW')}
                            style={styles.btnEmoji}>
                            <Text style={styles.emoji}>😮</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onEmojiSelect.bind(null, 'SAD')}
                            style={styles.btnEmoji}>
                            <Text style={styles.emoji}>😢</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onEmojiSelect.bind(null, 'ANGRY')}
                            style={styles.btnEmoji}>
                            <Text style={styles.emoji}>😡</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onEmojiSelect.bind(null, 'LIKE')}
                            style={styles.btnEmoji}>
                            <Text style={styles.emoji}>👍</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            }
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
                    <TouchableOpacity
                        onPress={() => navigate('ConversationOptions', {
                            username: targetUsername
                        })}
                        style={styles.btnNavigation}>
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
                <Animated.View style={{
                    ...styles.inboxContainer,
                    height: showGallery ? SCREEN_HEIGHT - STATUS_BAR_HEIGHT - MAX_GALLERY_HEIGHT : '100%',
                    transform: [{
                        translateY: Animated.multiply(-1, Animated.subtract(_galleryAnim, Animated.multiply(64, Animated.divide(_galleryAnim, MAX_GALLERY_HEIGHT))))
                    }]
                }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        ref={_flatlistRef}
                        onLayout={_onMessageBoxSizeChange}
                        style={{
                            height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 88 - 30,
                        }}
                        data={conversation.messageList || []}
                        renderItem={({ item, index }) =>
                            <MessageItem {...{
                                item, index,
                                owner: conversation.ownUser,
                                showMsgEmojiSelection: _onShowEmojiSelection
                            }} />
                        }
                        keyExtractor={(__, index) => `${index}`}
                        inverted
                    />
                    <View style={styles.msgInputWrapper}>
                        {!isBlocked &&
                            <React.Fragment>
                                <TouchableOpacity
                                    onPress={() => navigate('StoryTaker', {
                                        sendToDirect: true,
                                        username: conversation.ownUser.username
                                    })}
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
                                    onFocus={_onMsgInputFocus}
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
                                                    <TouchableOpacity
                                                        onPress={_onShowGallery}
                                                        style={styles.btnNavigation}>
                                                        <Image style={{
                                                            width: 20,
                                                            height: 20
                                                        }} source={require('../../../assets/icons/photo.png')} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            navigate('EmojiOptions', {
                                                                targetUsername
                                                            })
                                                        }}
                                                        style={styles.btnNavigation}>
                                                        <Image style={{
                                                            width: 20,
                                                            height: 20
                                                        }} source={require('../../../assets/icons/emoji.png')} />
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                        </>
                                    )}
                            </React.Fragment>
                        }
                        {isBlocked &&
                            <Text style={{
                                textAlign: 'center',
                                width: '100%',
                                color: '#666'
                            }}>
                                You can't not reply this conversation.
                            </Text>
                        }
                    </View>
                </Animated.View>
                <Animated.View style={{
                    ...styles.galleryWrapper,
                    transform: [{
                        translateY: Animated.subtract(MAX_GALLERY_HEIGHT, _galleryAnim)
                    }],
                    opacity: showGallery ? 1 : 0
                }}>
                    {uploadingImage &&
                        <View style={styles.uploadingImageMask}>
                            <View style={styles.uploadingNotification}>
                                <Text>Uploading...</Text>
                            </View>
                        </View>
                    }
                    <View style={styles.navigationGalleryBar}>
                        <TouchableOpacity
                            onPress={_onHideGallery}
                            style={styles.btnNavigation}>
                            <Text style={{
                                fontSize: 24
                            }}>✕</Text>
                            <View style={{
                                position: 'absolute',
                                left: '100%',
                                height: '50%',
                                backgroundColor: '#999',
                                borderRadius: 2,
                                width: 2,
                            }} />
                        </TouchableOpacity>
                        <Text style={{
                            fontWeight: '500',
                            fontSize: 16,
                            paddingHorizontal: 15,
                        }}>Gallery</Text>
                    </View>
                    <FlatList
                        numColumns={3}
                        data={photos}
                        renderItem={({ item, index }) =>
                            <TouchableOpacity
                                onPress={() => _onSelectImage(index)}
                                activeOpacity={1}
                                style={{
                                    ...styles.imageItem,
                                    marginHorizontal: (index - 1) % 3 === 0 ? 2.5 : 0,
                                    marginTop: index < 3 ? 0 : 1.25
                                }}>
                                <Image
                                    style={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                    resizeMode="cover"
                                    source={{
                                        uri: item.node.image.uri
                                    }}
                                />
                                <View style={{
                                    position: 'absolute',
                                    right: 7.5,
                                    top: 7.5,
                                    height: 24,
                                    width: 24,
                                    borderRadius: 24,
                                    borderColor: '#fff',
                                    borderWidth: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 1,
                                    backgroundColor: selectedPhotos.indexOf(index) > -1
                                        ? '#318bfb' : 'rgba(0,0,0,0.3)'
                                }}>
                                    {selectedPhotos.indexOf(index) > -1 &&
                                        <Text style={{
                                            color: '#fff'
                                        }}>
                                            {selectedPhotos.indexOf(index) + 1}
                                        </Text>
                                    }
                                </View>
                            </TouchableOpacity>
                        }
                        keyExtractor={(__, index) => `${index}`}
                        onEndReached={_onLoadmore}
                        onEndReachedThreshold={0.5}
                    />
                    {selectedPhotos.length > 0 &&
                        <TouchableOpacity
                            onPress={_onUploadImage}
                            activeOpacity={0.8}
                            style={styles.btnUploadImage}>
                            <Icon name="arrow-up" size={30} color="#318bfb" />
                        </TouchableOpacity>
                    }
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    )
}

export default Conversation
const MAX_GALLERY_HEIGHT = SCREEN_WIDTH + 44
const EMOJI_SELECTION_BAR_WIDTH = 44 * 6 + 15
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    emojiSelectionBar: {
        position: 'absolute',
        zIndex: 999,
        backgroundColor: '#fff',
        top: 0,
        left: 0,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        borderRadius: 44,
        paddingHorizontal: 7.5,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    btnEmoji: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emoji: {
        fontSize: 30
    },
    selectedEmojiPoint: {
        height: 3,
        width: 3,
        borderRadius: 3,
        backgroundColor: '#666',
        position: 'absolute',
        bottom: 2
    },
    navigationBar: {
        height: 44 + STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT,
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
    galleryWrapper: {
        borderTopColor: '#ddd',
        borderTopWidth: 0.5,
        height: MAX_GALLERY_HEIGHT,
        width: '100%',
        position: 'absolute',
        backgroundColor: '#000',
        bottom: 0,
        zIndex: 1,
        left: 0
    },
    uploadingImageMask: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadingNotification: {
        backgroundColor: '#fff',
        padding: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        borderRadius: 5
    },
    btnUploadImage: {
        position: 'absolute',
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 50,
        left: (SCREEN_WIDTH - 50) / 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
    },
    navigationGalleryBar: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        height: 44,
        alignItems: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    imageItem: {
        width: (SCREEN_WIDTH - 5) / 3,
        height: (SCREEN_WIDTH - 5) / 3,
        marginVertical: 1.25,
        backgroundColor: 'red'
    },
    inboxContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        zIndex: -1,
        bottom: 20,
        left: 0
    },
    msgInputWrapper: {
        marginTop: 10,
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
})
