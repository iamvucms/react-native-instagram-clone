import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { SuperRootStackParamList } from '../../navigations'
import { goBack, navigate } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { UnfollowRequest, ToggleFollowUserRequest, UpdatePrivacySettingsRequest } from '../../actions/userActions'
import { store } from '../../store'
import { firestore } from 'firebase'
import { ProfileX } from '../../reducers/profileXReducer'
type StoryViewerOptionsRouteProp = RouteProp<SuperRootStackParamList, 'StoryViewerOptions'>
type StoryViewerOptionsProps = {
    route: StoryViewerOptionsRouteProp
}
const StoryViewerOptions = ({ route }: StoryViewerOptionsProps) => {
    const dispatch = useDispatch()
    const { username } = route.params
    const myUsername = store.getState().user.user.userInfo?.username
    const setting = store.getState().user.setting
    const [closeFriends, setCloseFriends] = useState<string[]>(setting?.privacy?.closeFriends?.closeFriends || [])
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number
    }>({
        bottomSheetHeight: 0
    })
    useEffect(() => {

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
    const _onUnFollow = () => {
        goBack()
        dispatch(UnfollowRequest(username))
    }
    const _onUnRequest = () => {
        goBack()
        dispatch(ToggleFollowUserRequest(username))
    }
    const _toggleCloseFriend = async () => {
        const temp = [...closeFriends]
        const index = temp.indexOf(username)
        if (index > -1) {
            temp.splice(index, 1)
        } else {
            temp.push(username)
        }
        setCloseFriends(temp)
        const ref = firestore()
        const rq = await ref.collection('users').doc(`${myUsername}`).get()
        if (rq.exists) {
            const data: ProfileX = rq.data() || {}
            const currentCloseFriends = data.privacySetting?.closeFriends?.closeFriends || []
            const index2 = currentCloseFriends.indexOf(username)
            if (index2 > -1) {
                currentCloseFriends.splice(index2, 1)
            } else {
                currentCloseFriends.push(username)
            }
            dispatch(UpdatePrivacySettingsRequest({
                closeFriends: {
                    closeFriends: currentCloseFriends
                }
            }))
        }
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
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600'
                        }}>{username}</Text>
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </SafeAreaView>
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
    }
})

