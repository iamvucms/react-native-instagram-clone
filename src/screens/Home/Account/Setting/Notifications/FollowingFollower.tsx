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
const FollowingFollower = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const followingFollowers = useSelector(state => state.user.setting?.notification?.followingFollowers)
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
    const _onChangeFollowerRequest = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            followingFollowers: {
                followerRequest: value
            }
        }))
    }, [])
    const _onChangeAcceptedFollowRequest = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            followingFollowers: {
                acceptedFollowRequest: value
            }
        }))
    }, [])
    const _onChangeFriendsOnInstagram = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            followingFollowers: {
                friendsOnInstagram: value
            }
        }))
    }, [])
    const _onChangeMentionsInBio = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            followingFollowers: {
                mentionsInBio: value
            }
        }))
    }, [])
    const _onChangeRecommendationsForOthers = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            followingFollowers: {
                recommendationsForOthers: value
            }
        }))
    }, [])
    const _onChangeRecommendationsFromOthers = React.useCallback((value: NotificationLevel) => {
        dispatch(UpdateNotificationSettingsRequest({
            followingFollowers: {
                recommendationsFromOthers: value
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
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Follower Requests</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={followingFollowers?.followerRequest || 0}
                        onChange={_onChangeFollowerRequest}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms has requested to follow you.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Accepted Follow Requests</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={followingFollowers?.acceptedFollowRequest || 0}
                        onChange={_onChangeAcceptedFollowRequest}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms accepted your follow request.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Friends on Instagram</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={followingFollowers?.friendsOnInstagram || 0}
                        onChange={_onChangeFriendsOnInstagram}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>Your Facebook friend VuCms is on Instagram as vucms.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Mentions in Bio</Text>
                    </View>
                    <Radio
                        labels={["Off", 'From People I Follow', "From Everyone"]}
                        values={[0, 1, 2]}
                        defaultSelected={followingFollowers?.mentionsInBio || 0}
                        onChange={_onChangeMentionsInBio}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms mentioned you in their bio.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Recommendations For Others</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={followingFollowers?.recommendationsForOthers || 0}
                        onChange={_onChangeRecommendationsForOthers}
                    />
                    <Text style={{ fontSize: 12, color: '#666', maxWidth: '90%', paddingHorizontal: 15 }}>Help vucms get started on Instagram by recommending accounts to follow.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Recommendations From Others</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={[0, 1]}
                        defaultSelected={followingFollowers?.recommendationsFromOthers || 0}
                        onChange={_onChangeRecommendationsFromOthers}
                    />
                    <Text style={{ fontSize: 12, color: '#666', maxWidth: '90%', paddingHorizontal: 15 }}>vucms throught you might like these accounts.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default FollowingFollower

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
