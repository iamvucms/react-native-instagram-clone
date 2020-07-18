import { RouteProp } from '@react-navigation/native'
import React, { useRef, useState, useEffect } from 'react'
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View, FlatList, KeyboardAvoidingView, TextInput, Keyboard } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import SuperImage from '../../components/SuperImage'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { SuperRootStackParamList } from '../../navigations'
import { goBack, navigate } from '../../navigations/rootNavigation'
import { store } from '../../store'
import { ProfileX } from '../../reducers/profileXReducer'
import { firestore } from 'firebase'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'
import { DeleteStoryRequest } from '../../actions/storyActions'
import { PostingMessage, messagesTypes } from '../../reducers/messageReducer'
import { CreateMessageRequest } from '../../actions/messageActions'
type StorySeenListRouteProp = RouteProp<SuperRootStackParamList, 'StorySeenList'>

type StorySeenListProps = {
    route: StorySeenListRouteProp
}
const StorySeenList = ({ route }: StorySeenListProps) => {
    const dispatch = useDispatch()
    const { extraStory, childIndex } = route.params
    const myUsername = `${store.getState().user.user.userInfo?.username}`
    const story = { ...extraStory.storyList[childIndex] }
    const [viewerInfos, setViewerInfos] = useState<ProfileX[]>([])
    const [targetSendMsgUsername, setTargetSendMsgUsername] = useState<string>('')
    const [msgTxt, setMsgTxt] = useState<string>('')
    //
    const filteredSeenList = React.useMemo(() => (() => {
        const temp = [...(story.seenList || [])]
        const index = temp.indexOf(myUsername)
        temp.splice(index, 1)
        return temp
    })(), [])
    //
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
    const _anim = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{ animating: boolean }>({ animating: false })

    //Effect
    useEffect(() => {
        ; (async () => {
            const dbRef = firestore()
            const fetchUserInfoTask: Promise<ProfileX>[] =
                filteredSeenList.map(async usr => {
                    const rq = await dbRef.collection('users').doc(`${usr}`).get()
                    return rq.data() || {}
                })
            Promise.all(fetchUserInfoTask).then(rs => {
                setViewerInfos([...rs])
            })
        })()
    }, [filteredSeenList])
    //

    const _onAnimation = () => {
        if (ref.current.animating) return;
        Animated.timing(_anim, {
            toValue: 1,
            useNativeDriver: false,
            duration: 400
        }).start()
        ref.current.animating = true
    }
    const _onGoBack = () => {
        Animated.timing(_anim, {
            toValue: 0,
            useNativeDriver: false,
            duration: 250
        }).start(goBack)
    }
    const _onConfirmDelete = async () => {
        const uid = story.uid || 0
        await dispatch(DeleteStoryRequest(uid))
        navigate('HomeIndex')
    }
    const _onSendMsg = () => {
        const targetUsername = targetSendMsgUsername
        Keyboard.dismiss()
        if (msgTxt.length > 0) {
            const msg: PostingMessage = {
                seen: 0,
                type: messagesTypes.REPLY_STORY,
                text: msgTxt,
                superImageId: story.source,
                create_at: new Date().getTime(),
            }
            dispatch(CreateMessageRequest(msg, targetUsername))
            setMsgTxt('')
            setTargetSendMsgUsername('')
        }
    }
    let seenCount = filteredSeenList.length < 1000 ? `${filteredSeenList.length}` : (
        filteredSeenList.length < 1000000
            ? Math.round(filteredSeenList.length / 1000) + 'K'
            : Math.round(filteredSeenList.length / 1000000) + 'M'
    )
    return (
        <React.Fragment>
            {showConfirmDelete &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowConfirmDelete(false)}
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
                            onPress={() => setShowConfirmDelete(false)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            <View>
                <Animated.View style={{
                    ...styles.storyTopWrapper,
                    opacity: _anim
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center'
                    }}>
                        <TouchableOpacity
                            onPress={() => navigate('StoryPrivacy')}
                            style={styles.btnOption}>
                            <Icon name="tune" size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onGoBack}
                            style={styles.btnOption}>
                            <Text style={{
                                fontSize: 30,
                            }}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.triangle} />
                </Animated.View>
                <Animated.View style={{
                    ...styles.mainContainer,
                    opacity: _anim,
                }}>
                    <View style={styles.optionsBar}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Icon name="eye" size={20} />
                            <Text style={{
                                marginLeft: 5
                            }}>{seenCount}</Text>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity
                                onPress={() => setShowConfirmDelete(true)}
                                style={styles.btnOption}>
                                <Image style={{
                                    height: 24,
                                    width: 24
                                }} source={require("../../assets/icons/trash.png")} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <Text style={{
                            fontWeight: '600',
                            margin: 15
                        }}>Viewers</Text>
                        <FlatList
                            style={{
                                height: SCREEN_HEIGHT - HEADER_SIZE - 44 - 50
                            }}
                            data={viewerInfos}
                            renderItem={({ item }) => (
                                <ViewerItem
                                    setTargetMsgUsername={setTargetSendMsgUsername}
                                    user={item} />
                            )}
                            keyExtractor={(_, index) => `${index}`}
                        />
                    </View>
                </Animated.View>
            </View>
            <Animated.View
                style={{
                    ...styles.storyImage,
                    transform: [{
                        translateX: _anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, (SCREEN_WIDTH - 150) / 2]
                        })
                    }, {
                        translateY: _anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, STATUS_BAR_HEIGHT]
                        })
                    }],
                    width: _anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [SCREEN_WIDTH, 150]
                    }),
                    height: _anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [SCREEN_HEIGHT, 250]
                    }),
                }}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={_onGoBack}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}>
                    <SuperImage
                        showOnlyImage={true}
                        disableNavigation={true}
                        disablePress={true}
                        onReady={_onAnimation}
                        fitSize={true}
                        superId={story.source as number}
                    />
                </TouchableOpacity>
            </Animated.View>
            {targetSendMsgUsername.length > 0 &&
                <KeyboardAvoidingView behavior="position" style={styles.msgInput}>
                    <View style={{
                        backgroundColor: "#fff",
                        padding: 15,
                        borderTopColor: '#ddd',
                        borderTopWidth: 1
                    }}>
                        <View style={styles.msgUserInfo}>
                            <FastImage
                                source={{
                                    uri: viewerInfos.find(x => x.username === targetSendMsgUsername)?.avatarURL
                                }}
                                style={{
                                    height: 64,
                                    width: 64,
                                    borderRadius: 64,
                                    borderColor: "#333",
                                    borderWidth: 0.3
                                }}
                            />
                            <Text style={{
                                marginLeft: 15,
                                fontWeight: '600'
                            }}>
                                Message to {targetSendMsgUsername}
                            </Text>
                        </View>
                        <TextInput
                            returnKeyType="send"
                            onSubmitEditing={_onSendMsg}
                            keyboardType="ascii-capable"
                            autoFocus={true}
                            value={msgTxt}
                            onChangeText={setMsgTxt}
                            placeholder="Message..."
                            onBlur={() => setTargetSendMsgUsername('')}
                            style={styles.msgTxtInput} />
                        {msgTxt.length > 0 &&
                            <TouchableOpacity
                                onPress={_onSendMsg}
                                style={styles.btnSend}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: "#318bfb"
                                }}>
                                    Send
                                </Text>
                            </TouchableOpacity>
                        }
                    </View>
                </KeyboardAvoidingView>
            }
        </React.Fragment>

    )
}
export default StorySeenList

const HEADER_SIZE = 250 + 30 + STATUS_BAR_HEIGHT
const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#fff',
        height: SCREEN_HEIGHT - HEADER_SIZE
    },
    optionsBar: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        borderBottomColor: "#ddd",
        borderBottomWidth: 0.5
    },
    storyImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    storyTopWrapper: {
        width: "100%",
        height: HEADER_SIZE,
        paddingTop: STATUS_BAR_HEIGHT,
        backgroundColor: "rgb(242,242,242)"
    },
    triangle: {
        position: 'absolute',
        zIndex: 1,
        borderColor: "#fff",
        borderRightWidth: 15,
        borderLeftWidth: 15,
        borderRightColor: "rgba(0,0,0,0)",
        borderLeftColor: "rgba(0,0,0,0)",
        borderBottomWidth: 15,
        bottom: 0,
        left: (SCREEN_WIDTH - 30) / 2
    },
    btnOption: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginVertical: 7.5
    },
    btnViewerOption: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    viewerAvatar: {
        height: 50,
        width: 50,
        borderRadius: 64,
        borderColor: '#333',
        borderWidth: 0.3,
        marginRight: 10
    },
    backdrop: {
        zIndex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
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

    },
    msgInput: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: "100%",

        backgroundColor: "#fff",

    },
    msgUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderTopColor: "#ddd",

    },
    msgTxtInput: {
        height: 44,
        paddingHorizontal: 15,
        paddingRight: 75,
        borderColor: "#ddd",
        borderRadius: 44,
        borderWidth: 1,
        width: SCREEN_WIDTH - 30
    },
    btnSend: {
        height: 44,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 15,
        right: 15
    }
})
interface ViewerItemProps {
    user: ProfileX,
    setTargetMsgUsername: React.Dispatch<React.SetStateAction<string>>
}
const ViewerItem = React.memo(({ user, setTargetMsgUsername }: ViewerItemProps) => {
    const _onViewProfile = () => {
        navigate("ProfileX", {
            username: user.username
        })
    }
    const _onShowViewerOptions = () => {
        navigate('StoryViewerOptions', {
            username: user.username
        })
    }
    return (
        <TouchableOpacity
            onPress={_onViewProfile}
            style={styles.viewerItem}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <FastImage
                    source={{
                        uri: user.avatarURL
                    }}
                    style={styles.viewerAvatar}
                />
                <View>
                    <Text style={{
                        fontWeight: '500'
                    }}>{user.fullname}</Text>
                    <Text style={{
                        fontWeight: '600',
                        color: '#666'
                    }}>{user.username}</Text>
                </View>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TouchableOpacity
                    onPress={_onShowViewerOptions}
                    style={styles.btnViewerOption}>
                    <Icon name="dots-vertical" size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTargetMsgUsername(`${user.username}`)}
                    style={styles.btnViewerOption}>
                    <Image style={{
                        height: 20,
                        width: 20
                    }} source={require('../../assets/icons/send.png')} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
})