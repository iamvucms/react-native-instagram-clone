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
const LiveIGTV = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const liveIGTV = useSelector(state => state.user.setting?.notification?.liveIGTV)
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
    const _onChangeLiveVideos = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            liveIGTV: {
                liveVideos: value
            }
        }))
    }, [])
    const _onChangeIGTVVideoUploads = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            liveIGTV: {
                igtvVideoUploads: value
            }
        }))
    }, [])
    const _onChangeIGTVViewCounts = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            liveIGTV: {
                igtvViewCounts: value
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
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Live Videos</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={liveIGTV?.liveVideos || 0}
                        onChange={_onChangeLiveVideos}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms started a live video. Watch it before it ends!</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>IGTV Video Uploads</Text>
                    </View>
                    <Radio
                        labels={["Off", "From People I Follow", "From Everyone"]}
                        values={[0, 1, 2]}
                        defaultSelected={liveIGTV?.igtvVideoUploads || 0}
                        onChange={_onChangeIGTVVideoUploads}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>Your video is ready to watch on IGTV.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>IGTV View Counts</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={liveIGTV?.igtvViewCounts || 0}
                        onChange={_onChangeIGTVViewCounts}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>Your IGTV video há mỏe than 100K views.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default LiveIGTV

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
