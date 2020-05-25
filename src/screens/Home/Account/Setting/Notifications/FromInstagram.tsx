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
const FromInstagram = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const fromInstagram = useSelector(state => state.user.setting?.notification?.fromInstagram)
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
    const _onChangeReminders = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            fromInstagram: {
                reminders: value
            }
        }))
    }, [])
    const _onChangeProductAnnouncements = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            fromInstagram: {
                productAnnoucements: value
            }
        }))
    }, [])
    const _onChangeSupportRequests = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            fromInstagram: {
                supportRequests: value
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
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Reminders</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={fromInstagram?.reminders || 0}
                        onChange={_onChangeReminders}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>You have unseen notifications, and other similar notifications.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Product Announcements</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={fromInstagram?.productAnnoucements || 0}
                        onChange={_onChangeProductAnnouncements}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>Download Boomerang, Instagram's latest app.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Support Requests</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={fromInstagram?.supportRequests || 0}
                        onChange={_onChangeSupportRequests}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>Your support request from July 10 was just updated.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default FromInstagram

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
