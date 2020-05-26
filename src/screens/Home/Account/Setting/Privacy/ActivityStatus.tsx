import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation, dispatch } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation } from '../../../../../constants'
import Switcher from '../../../../../components/Switcher'
import { useSelector } from '../../../../../reducers'
import { useDispatch } from 'react-redux'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
const ActivityStatus = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const activityStatus = useSelector(state => state.user.setting?.privacy?.activityStatus)
    const [showActivity, setShowActivity] = useState<boolean>(activityStatus?.show || false)
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
    useEffect(() => {
        dispatch(UpdatePrivacySettingsRequest({
            activityStatus: {
                show: showActivity
            }
        }))
    }, [showActivity])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    marginVertical: 25,
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Text style={{
                        fontSize: 16
                    }}>
                        Show Activity Status
                    </Text>
                    <Switcher on={showActivity}
                        onTurnOff={setShowActivity.bind(null, false)}
                        onTurnOn={setShowActivity.bind(null, true)}
                    />
                </View>
                <Text style={{
                    fontSize: 12,
                    color: '#666',
                    paddingHorizontal: 15,
                    paddingBottom: 25
                }}>
                    Allow accounts you follow and anyone you message to see when you were last active on Instagram apps. When this is turned off, you won't be able to see the activity status of their accounts.
                </Text>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ActivityStatus

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
    }
})
