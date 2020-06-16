import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { FetchSettingRequest, UpdateNotificationSettingsRequest } from '../../../actions/userActions'
import Switcher from '../../../components/Switcher'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { firestore } from 'firebase'
import { store } from '../../../store'
type NotificationOptionsRouteProp = RouteProp<SuperRootStackParamList, 'NotificationOptions'>


type NotificationOptionsProps = {
    route: NotificationOptionsRouteProp
}
const NotificationOptions = ({ route }: NotificationOptionsProps) => {
    const dispatch = useDispatch()
    const username = store.getState().user.user.userInfo?.username || ''
    const targetUser = route.params.user
    const setting = useSelector(state => state.user.setting)
    const notifyPostAccounts = setting?.notification?.notificationAccounts?.posts || []
    const notifyStoryAccounts = setting?.notification?.notificationAccounts?.story || []
    const [notifyPost, setNotifyPost]
        = useState<boolean>(notifyPostAccounts.indexOf(targetUser.username || '') > -1)
    const [notifyStories, setNotifyStories]
        = useState<boolean>(notifyStoryAccounts.indexOf(targetUser.username || '') > -1)
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number
    }>({
        bottomSheetHeight: 0
    })
    useEffect(() => {
        dispatch(FetchSettingRequest())
    }, [])

    useEffect(() => {
        const index = notifyPostAccounts.indexOf(targetUser.username || '')
        const list = [...notifyPostAccounts]
        if (notifyPost && index < 0) {
            list.push(targetUser.username || '')
        } else if (!notifyPost && index > -1) {
            list.splice(index, 1)
        }
        dispatch(UpdateNotificationSettingsRequest({
            notificationAccounts: {
                posts: list
            }
        }))
        firestore().collection('users').doc(username).update({
            postNotificationList: list
        })
        return () => {

        }
    }, [notifyPost])
    useEffect(() => {
        const index = notifyStoryAccounts.indexOf(targetUser.username || '')
        const list = [...notifyStoryAccounts]
        if (notifyStories && index < 0) {
            list.push(targetUser.username || '')
        } else if (!notifyStories && index > -1) {
            list.splice(index, 1)
        }
        dispatch(UpdateNotificationSettingsRequest({
            notificationAccounts: {
                story: list
            }
        }))
        firestore().collection('users').doc(username).update({
            storyNotificationList: list
        })
        return () => {

        }
    }, [notifyStories])
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
                            fontSize: 18,
                            fontWeight: '500'
                        }}>Notifications</Text>
                    </View>
                    <View>
                        <View style={styles.optionItem}>
                            <Text style={{ fontSize: 16 }}>Posts</Text>
                            <Switcher on={notifyPost}
                                onTurnOff={setNotifyPost.bind(null, false)}
                                onTurnOn={setNotifyPost.bind(null, true)}
                            />
                        </View>
                        <View style={styles.optionItem}>
                            <Text style={{ fontSize: 16 }}>Stories</Text>
                            <Switcher on={notifyStories}
                                onTurnOff={setNotifyStories.bind(null, false)}
                                onTurnOn={setNotifyStories.bind(null, true)}
                            />
                        </View>
                    </View>

                </Animated.View>
            </PanGestureHandler>
        </SafeAreaView>
    )
}

export default NotificationOptions

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
        flexDirection: 'row',
        height: 44,
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        alignItems: 'center'
    }
})
