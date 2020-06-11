import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { FetchSettingRequest, UpdatePrivacySettingsRequest } from '../../../actions/userActions'
import Switcher from '../../../components/Switcher'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
type MuteOptionsRouteProp = RouteProp<SuperRootStackParamList, 'MuteOptions'>


type MuteOptionsProps = {
    route: MuteOptionsRouteProp
}
const MuteOptions = ({ route }: MuteOptionsProps) => {
    const dispatch = useDispatch()
    const targetUser = route.params.user
    const setting = useSelector(state => state.user.setting)
    const mutedPostAccounts = setting?.privacy?.mutedAccouts?.posts || []
    const mutedStoryAccounts = setting?.privacy?.mutedAccouts?.story || []
    const [mutePost, setMutePost]
        = useState<boolean>(mutedPostAccounts.indexOf(targetUser.username || '') > -1)
    const [muteStories, setMuteStories]
        = useState<boolean>(mutedStoryAccounts.indexOf(targetUser.username || '') > -1)
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
        const index = mutedPostAccounts.indexOf(targetUser.username || '')
        const list = [...mutedPostAccounts]
        if (mutePost && index < 0) {
            list.push(targetUser.username || '')
        } else if (!mutePost && index > -1) {
            list.splice(index, 1)
        }
        dispatch(UpdatePrivacySettingsRequest({
            mutedAccouts: {
                posts: list
            }
        }))
        return () => {

        }
    }, [mutePost])
    useEffect(() => {
        const index = mutedStoryAccounts.indexOf(targetUser.username || '')
        const list = [...mutedStoryAccounts]
        if (muteStories && index < 0) {
            list.push(targetUser.username || '')
        } else if (!muteStories && index > -1) {
            list.splice(index, 1)
        }
        dispatch(UpdatePrivacySettingsRequest({
            mutedAccouts: {
                story: list
            }
        }))
        return () => {

        }
    }, [muteStories])
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
                        }}>Mute</Text>
                    </View>
                    <View>
                        <View style={styles.optionItem}>
                            <Text style={{ fontSize: 16 }}>Posts</Text>
                            <Switcher on={mutePost}
                                onTurnOff={setMutePost.bind(null, false)}
                                onTurnOn={setMutePost.bind(null, true)}
                            />
                        </View>
                        <View style={styles.optionItem}>
                            <Text style={{ fontSize: 16 }}>Stories</Text>
                            <Switcher on={muteStories}
                                onTurnOff={setMuteStories.bind(null, false)}
                                onTurnOn={setMuteStories.bind(null, true)}
                            />
                        </View>
                    </View>
                    <Text style={{
                        margin: 15,
                        color: '#666',
                        fontSize: 12
                    }}>Instagram won't let them know you muted them.</Text>
                </Animated.View>
            </PanGestureHandler>
        </SafeAreaView>
    )
}

export default MuteOptions

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
