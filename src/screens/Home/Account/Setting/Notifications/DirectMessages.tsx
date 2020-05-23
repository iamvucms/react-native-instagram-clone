import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import Radio from '../../../../../components/Radio'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { useDispatch } from 'react-redux'
import { UpdateNotificationSettingsRequest } from '../../../../../actions/userActions'
import { useSelector } from '../../../../../reducers'
import { NotificationLevel } from '../../../../../reducers/userReducer'
const DirectMessages = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const directMessages = useSelector(state => state.user.setting?.notification?.directMessages)
    const [currNavigation, setCurrNavigation] =
        useState<SettingNavigation | { name: string }>({ name: '' })
    useEffect(() => {
        settingNavigationMap.every(settingNavigation => {
            if (settingNavigation.child) {
                return settingNavigation.child.every(childSettingNavigation => {
                    if (childSettingNavigation.navigationName === route.name) {
                        setCurrNavigation(childSettingNavigation);
                        return false
                    }
                    return true
                }) || true
            }
            return true;
        })
    }, [])
    const _onChangeMessageRequests = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            directMessages: {
                messageRequests: value
            }
        }))
    }, [])
    const _onChangeMessages = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            directMessages: {
                messages: value
            }
        }))
    }, [])
    const _onChangeGroupRequests = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            directMessages: {
                groupRequest: value
            }
        }))
    }, [])
    const _onChangeVideoChats = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            directMessages: {
                videoChats: value
            }
        }))
    }, [])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                style={{
                    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - getTabBarHeight()
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Message Requests</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={directMessages?.messageRequests || 0}
                        onChange={_onChangeMessageRequests}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms wants to you a message.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Messages</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={directMessages?.messageRequests || 0}
                        onChange={_onChangeMessages}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms sent you a message.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Group Requests</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={directMessages?.groupRequest || 0}
                        onChange={_onChangeGroupRequests}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms wants to add vucms to your group.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Video Chats</Text>
                    </View>
                    <Radio
                        labels={["Off", 'From People I Follow', "From Everyone"]}
                        values={[0, 1, 2]}
                        defaultSelected={directMessages?.videoChats || 0}
                        onChange={_onChangeVideoChats}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>Incoming video chat from vucms.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default DirectMessages

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    settingItem: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    optionsWrapper: {
        paddingVertical: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5
    }
})
