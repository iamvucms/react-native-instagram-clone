import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { SuperRootStackParamList } from '../../navigations'
import { goBack, navigate } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { UnfollowRequest, ToggleFollowUserRequest, UpdatePrivacySettingsRequest, RemoveFollowerRequest } from '../../actions/userActions'
import { store } from '../../store'
import { firestore } from 'firebase'
import { ProfileX } from '../../reducers/profileXReducer'
import { FetchStoryListRequest } from '../../actions/storyActions'
import { FetchPostListRequest } from '../../actions/postActions'
import FastImage from 'react-native-fast-image'
type StoryViewerOptionsRouteProp = RouteProp<SuperRootStackParamList, 'StoryViewerOptions'>
type StoryViewerOptionsProps = {
    route: StoryViewerOptionsRouteProp
}
const StoryViewerOptions = ({ route }: StoryViewerOptionsProps) => {
    const dispatch = useDispatch()
    const { username } = route.params
    const myUsername = store.getState().user.user.userInfo?.username
    const hideStoryFrom = useSelector(state =>
        state.user.setting?.privacy?.story?.hideStoryFrom) || []
    const [userInfo, setUserInfo] = useState<ProfileX>({})
    const [showConfirmBlock, setShowConfirmBlock] = useState<boolean>(false)
    const [showConfirmRemoveFollower, setShowConfirmRemoveFollower] = useState<boolean>(false)
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number
    }>({
        bottomSheetHeight: 0
    })
    useEffect(() => {
        ; (async () => {
            const ref = firestore()
            const rq = await ref.collection('users').doc(`${username}`).get()
            if (rq.exists) {
                setUserInfo(rq.data() || {})
            }
        })()
    }, [])

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
            if (translationY > ref.current.bottomSheetHeight * 0.5) {
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
    const _onConfirmBlock = async () => {
        let currentBlockedAccounts = [...(store.getState().user.setting?.privacy?.blockedAccounts?.blockedAccounts || [])]
        currentBlockedAccounts.push(username)
        currentBlockedAccounts = Array.from(new Set(currentBlockedAccounts))
        dispatch(UpdatePrivacySettingsRequest({
            blockedAccounts: {
                blockedAccounts: currentBlockedAccounts
            }
        }))
        await dispatch(UnfollowRequest(username))
        dispatch(RemoveFollowerRequest(username))
        dispatch(FetchStoryListRequest())
        dispatch(FetchPostListRequest())
        goBack()
    }
    const _onConfirmRemoveFollower = async () => {
        await dispatch(RemoveFollowerRequest(username))
        goBack()
    }
    const _onHideYourStory = async () => {
        const exists = hideStoryFrom.indexOf(username) > -1
        if (!exists) {
            await dispatch(UpdatePrivacySettingsRequest({
                story: {
                    hideStoryFrom: [...hideStoryFrom, username]
                }
            }))
        }
        goBack()
    }
    return (
        <React.Fragment>
            {showConfirmBlock &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowConfirmBlock(false)}
                    style={styles.backdrop}>
                    <View style={styles.confirmBox}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600"
                        }}>Block {username}?</Text>
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
                                color: 'red'
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
            {showConfirmRemoveFollower &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowConfirmRemoveFollower(false)}
                    style={styles.backdrop}>
                    <View style={styles.confirmBox}>
                        <FastImage
                            source={{
                                uri: userInfo.avatarURL
                            }}
                            style={{
                                height: 80,
                                width: 80,
                                borderRadius: 80
                            }}
                        />
                        <Text style={{
                            marginTop: 20,
                            fontSize: 20,
                            fontWeight: "600"
                        }}>Remove Follower?</Text>
                        <Text style={{
                            textAlign: 'center',
                            color: '#666',
                            maxWidth: "80%",
                            marginVertical: 15
                        }}>Instagram won't tell to {username} they were removed from your followers.</Text>
                        <TouchableOpacity
                            onPress={_onConfirmRemoveFollower}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: '#318bfb'
                            }}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowConfirmRemoveFollower(false)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
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
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600'
                            }}>{username}</Text>
                        </View>
                        <View>
                            <TouchableOpacity
                                onPress={() => setShowConfirmBlock(true)}
                                style={styles.optionItem}>
                                <Text style={{
                                    fontSize: 16,
                                    color: 'red'
                                }}>Block</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowConfirmRemoveFollower(true)}
                                style={styles.optionItem}>
                                <Text style={{
                                    fontSize: 16,
                                }}>Remove Follower</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onHideYourStory}
                                style={styles.optionItem}>
                                <Text style={{
                                    fontSize: 16,
                                }}>Hide Your Story</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigate('ProfileX', {
                                    username
                                })}
                                style={styles.optionItem}>
                                <Text style={{
                                    fontSize: 16,
                                }}>View Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </PanGestureHandler>
            </SafeAreaView>
        </React.Fragment>
    )
}

export default StoryViewerOptions

const styles = StyleSheet.create({
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: 40,
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
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
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd'
    },
    optionItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        height: 44,
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        alignItems: 'center'
    },
    closeFriendIcon: {
        width: 24,
        height: 24
    },
    backdrop: {
        position: 'absolute',
        zIndex: 2,
        height: '100%',
        width: '100%',
        backgroundColor: "rgba(0,0,0,0.3)",
        top: 0,
        left: 0,
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
        borderTopColor: '#ddd',
        borderTopWidth: 1
    },

})

