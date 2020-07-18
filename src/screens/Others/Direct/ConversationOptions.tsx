import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SuperRootStackParamList } from '../../../navigations'
import { RouteProp } from '@react-navigation/native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import Switcher from '../../../components/Switcher'
import { store } from '../../../store'
import { useSelector } from '../../../reducers'
import { messagesTypes, Message } from '../../../reducers/messageReducer'
import { SCREEN_WIDTH } from '../../../constants'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'
import { UnfollowRequest, ToggleSendFollowRequest, UpdatePrivacySettingsRequest, ToggleFollowUserRequest, RemoveFollowerRequest } from '../../../actions/userActions'
import { FetchStoryListRequest } from '../../../actions/storyActions'
import { FetchPostListRequest } from '../../../actions/postActions'

type ConversationOptionsRouteProp = RouteProp<SuperRootStackParamList, 'ConversationOptions'>
type ConversationOptionsProps = {
    route: ConversationOptionsRouteProp
}
const ConversationOptions = ({ route }: ConversationOptionsProps) => {
    const dispatch = useDispatch()
    const targetUsername = route.params.username
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const myFollowings = useSelector(state => state.user.extraInfo?.followings) || []
    const conversation = useSelector(state => state.messages.filter(group => group.ownUser.username === targetUsername)[0])
    const [mutedMessages, setMutedMessages] = useState<boolean>(false)
    const [mutedVideoChats, setMutedVideoChats] = useState<boolean>(false)
    const [showConfirmBlock, setShowConfirmBlock] = useState<boolean>(false)

    const sharedImages = [...conversation.messageList].filter(x => x.type === messagesTypes.IMAGE)
    const previewSharedImages = [...sharedImages].splice(-4)
    const fType = myFollowings.indexOf(targetUsername) > -1 ? 1 : (
        (conversation.ownUser.requestedList && conversation.ownUser.requestedList?.indexOf(myUsername) > -1) ? 3 : 2
    )
    const [followType, setFollowType] = useState<number>(fType)

    //EFFECTS
    useEffect(() => {
        const currentMutedMessages = [...(store.getState().user.setting?.privacy
            ?.mutedMessages?.mutedMessages || [])]
        if (mutedMessages) {
            currentMutedMessages.push(targetUsername)
        } else {
            const index = currentMutedMessages.indexOf(targetUsername)
            currentMutedMessages.splice(index, 1)
        }
        dispatch(UpdatePrivacySettingsRequest({
            mutedMessages: {
                mutedMessages: Array.from(new Set(currentMutedMessages))
            }
        }))
    }, [mutedMessages])
    useEffect(() => {
        const currentMutedVideoCalls = [...(store.getState().user.setting?.privacy
            ?.mutedVideoCalls?.mutedVideoCalls || [])]
        if (mutedVideoChats) {
            currentMutedVideoCalls.push(targetUsername)
        } else {
            const index = currentMutedVideoCalls.indexOf(targetUsername)
            currentMutedVideoCalls.splice(index, 1)
        }
        dispatch(UpdatePrivacySettingsRequest({
            mutedVideoCalls: {
                mutedVideoCalls: Array.from(new Set(currentMutedVideoCalls))
            }
        }))
    }, [mutedVideoChats])
    const _onToggleFollow = () => {
        if (followType === 1) {
            dispatch(UnfollowRequest(targetUsername))
            setFollowType(2)
        } else if (followType === 2) {
            if (conversation.ownUser.privacySetting?.accountPrivacy?.private) {
                setFollowType(3)
                dispatch(ToggleSendFollowRequest(targetUsername))
            } else {
                setFollowType(1)
                dispatch(ToggleFollowUserRequest(targetUsername))
            }
        } else {
            dispatch(ToggleSendFollowRequest(targetUsername))
            setFollowType(2)
        }
    }
    const _onConfirmBlock = async () => {
        let currentBlockedAccounts = [...(store.getState().user.setting?.privacy?.blockedAccounts?.blockedAccounts || [])]
        currentBlockedAccounts.push(targetUsername)
        currentBlockedAccounts = Array.from(new Set(currentBlockedAccounts))
        dispatch(UpdatePrivacySettingsRequest({
            blockedAccounts: {
                blockedAccounts: currentBlockedAccounts
            }
        }))
        await dispatch(UnfollowRequest(targetUsername))
        dispatch(RemoveFollowerRequest(targetUsername))
        dispatch(FetchStoryListRequest())
        dispatch(FetchPostListRequest())
        goBack()
    }
    return (
        <React.Fragment>
            {showConfirmBlock &&
                <TouchableOpacity
                    onPress={() => setShowConfirmBlock(false)}
                    activeOpacity={1}
                    style={styles.backdrop}>
                    <View style={styles.confirmBox}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600"
                        }}>Block {conversation.ownUser.fullname}?</Text>
                        <Text style={{
                            textAlign: 'center',
                            color: '#666',
                            maxWidth: "80%",
                            marginVertical: 15
                        }}>They won't be able to find your profile, posts or story on Instagram. Instagram wont't let them know you blocked them.</Text>
                        <TouchableOpacity
                            onPress={_onConfirmBlock}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: '#318bfb'
                            }}>Block</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowConfirmBlock(false)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            <SafeAreaView style={styles.container}>
                <NavigationBar title="Detail" callback={goBack} />
                <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <View style={styles.optionItem}>
                            <Text style={styles.optionTitle}>Mute Messages</Text>
                            <Switcher on={mutedMessages}
                                onTurnOff={setMutedMessages.bind(null, false)}
                                onTurnOn={setMutedMessages.bind(null, true)}
                            />
                        </View>
                        <View style={styles.optionItem}>
                            <Text style={styles.optionTitle}>Mute Video Chats</Text>
                            <Switcher on={mutedVideoChats}
                                onTurnOff={setMutedVideoChats.bind(null, false)}
                                onTurnOn={setMutedVideoChats.bind(null, true)}
                            />
                        </View>
                    </View>
                    <View style={styles.sharedTitle}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500'
                        }}>Shared</Text>
                        <TouchableOpacity
                            onPress={() => navigate('SharedImages', {
                                imageMessages: [...sharedImages]
                            })}
                        >
                            <Text style={{
                                color: "#318bfb",
                                fontWeight: '600'
                            }}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.previewSharedImagesWrapper}>
                        {previewSharedImages.map((msg, index) => (
                            <SharedImage
                                sharedImages={sharedImages}
                                key={index}
                                message={msg} index={index} />
                        ))}
                    </View>
                    <View style={styles.userInfoWrapper}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500',
                        }}>
                            Members
                    </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigate('ProfileX', {
                                username: targetUsername
                            })}
                            style={styles.userInfo}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <View style={styles.avatarWrapper}>
                                    <FastImage
                                        source={{
                                            uri: conversation.ownUser.avatarURL
                                        }}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 60
                                        }}
                                    />
                                </View>
                                <View>
                                    <Text style={{
                                        fontWeight: '500'
                                    }}>{conversation.ownUser.fullname}</Text>
                                    <Text style={{
                                        fontWeight: '600',
                                        color: "#666"
                                    }}>{conversation.ownUser.username}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={_onToggleFollow}
                                activeOpacity={0.6}
                                style={{
                                    ...styles.btnFollow,
                                    borderWidth: followType !== 2 ? 1 : 0,
                                    backgroundColor: followType !== 2 ? '#fff' : '#318bfb'
                                }}>
                                <Text style={{
                                    color: followType !== 2 ? '#000' : '#fff',
                                    fontWeight: '500'
                                }}>{followType === 1 ? 'Following' : (
                                    followType === 3 ? 'Requested' : 'Follow'
                                )}</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.extraOptionsWrapper}>
                        <TouchableOpacity style={styles.extraOptionItem}>
                            <Text style={{
                                fontSize: 16
                            }}>Restrict</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.extraOptionItem}>
                            <Text style={{
                                fontSize: 16
                            }}>Report...</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowConfirmBlock(true)}
                            style={styles.extraOptionItem}>
                            <Text style={{
                                fontSize: 16
                            }}>Block Account</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </React.Fragment>
    )
}

export default ConversationOptions
const SHARED_IMG_SIZE = (SCREEN_WIDTH - 30 - 6) / 4
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff',
    },
    backdrop: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBox: {
        width: '80%',
        paddingTop: 15,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    optionItem: {
        paddingHorizontal: 15,
        marginVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    optionTitle: {
        fontSize: 16
    },
    sharedTitle: {
        marginTop: 15,
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    previewSharedImagesWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        marginVertical: 15
    },
    sharedImage: {
        width: SHARED_IMG_SIZE,
        height: SHARED_IMG_SIZE,
    },
    seeAll: {
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        height: "100%",
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    userInfoWrapper: {
        margin: 15,
        marginTop: 0
    },
    userInfo: {
        marginVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarWrapper: {
        marginRight: 10,
        height: 64,
        width: 64,
        overflow: "hidden",
        borderColor: "#ddd",
        borderWidth: 0.3
    },
    btnFollow: {
        width: 100,
        borderRadius: 5,
        borderColor: '#ddd',
        height: 28,
        justifyContent: 'center',
        alignItems: 'center'
    },
    extraOptionsWrapper: {
        paddingHorizontal: 15,
        borderTopColor: '#ddd',
        borderTopWidth: 0.5
    },
    extraOptionItem: {
        height: 44,
        justifyContent: 'center'
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
interface SharedImageProps {
    index: number,
    message: Message,
    sharedImages: Message[]
}
const SharedImage = ({ index, message, sharedImages }: SharedImageProps) => {
    const imgRef = useRef<Image>(null)
    const _onShowFull = () => {
        imgRef.current?.measure((x, y, w, h, pX, pY) => {
            navigate('ImageFullView', {
                pH: SHARED_IMG_SIZE,
                pW: SHARED_IMG_SIZE,
                pX,
                pY,
                oH: message.height,
                oW: message.width,
                pScale: SHARED_IMG_SIZE / (message.width as number),
                uri: message.sourceUri,
                borderRadius: false,
                unScaled: true
            })
        })
    }
    return (
        <TouchableOpacity
            onPress={index < 3 ? _onShowFull : () =>
                navigate('SharedImages', {
                    imageMessages: [...sharedImages]
                })
            }
            activeOpacity={0.8}
            key={index}>
            <Image
                ref={imgRef}
                source={{
                    uri: message.sourceUri
                }}
                style={styles.sharedImage}
            />
            {index === 3 &&
                <View style={styles.seeAll}>
                    <Text style={{
                        fontSize: 16,
                        color: '#fff'
                    }}>See All</Text>
                </View>
            }
        </TouchableOpacity>
    )
}
