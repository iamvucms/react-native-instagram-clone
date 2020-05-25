import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { useDispatch } from 'react-redux'
import { UpdateNotificationSettingsRequest } from '../../../../../actions/userActions'
import { useSelector } from '../../../../../reducers'
import Switcher from '../../../../../components/Switcher'
import { EmailandSMSNotificationsOptions } from '../../../../../reducers/userReducer'
const EmailAndSMS = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const emailAndSMSNotifications = useSelector(state => state.user.setting?.notification?.emailAndSMSNotifications)
    const [currentSetting, setCurrentSetting] = useState<EmailandSMSNotificationsOptions>({
        ...emailAndSMSNotifications
    })
    const [currNavigation, setCurrNavigation] =
        useState<SettingNavigation | { name: string }>({ name: '' })
    useEffect(() => {
        settingNavigationMap.every(settingNavigation => {
            if (settingNavigation.child) {
                return settingNavigation.child.every(childSettingNavigation => {
                    if (childSettingNavigation.navigationName === route.name) {
                        setCurrNavigation(childSettingNavigation);

                    }
                    return true
                }) || true
            }
            return true;
        })
    }, [])
    const _onChangeFeedbackEmails = (value: boolean) => {
        setCurrentSetting({
            ...currentSetting,
            feedbackEmails: value
        })
        dispatch(UpdateNotificationSettingsRequest({
            emailAndSMSNotifications: {
                feedbackEmails: value
            }
        }))
    }
    const _onChangeReminderEmails = (value: boolean) => {
        setCurrentSetting({
            ...currentSetting,
            reminderEmails: value
        })
        dispatch(UpdateNotificationSettingsRequest({
            emailAndSMSNotifications: {
                reminderEmails: value
            }
        }))
    }
    const _onChangeProductEmails = (value: boolean) => {
        setCurrentSetting({
            ...currentSetting,
            productEmail: value
        })
        dispatch(UpdateNotificationSettingsRequest({
            emailAndSMSNotifications: {
                productEmail: value
            }
        }))
    }
    const _onChangeNewsEmails = (value: boolean) => {
        setCurrentSetting({
            ...currentSetting,
            newsEmails: value
        })
        dispatch(UpdateNotificationSettingsRequest({
            emailAndSMSNotifications: {
                newsEmails: value
            }
        }))
    }
    const _onChangeTextSMSMessages = (value: boolean) => {
        setCurrentSetting({
            ...currentSetting,
            textSMSMessages: value
        })
        dispatch(UpdateNotificationSettingsRequest({
            emailAndSMSNotifications: {
                textSMSMessages: value
            }
        }))
    }
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
                    <View style={styles.optionItem}>
                        <View style={styles.option}>
                            <Text style={{ fontWeight: '500', fontSize: 16 }}>Feedback Emails</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>Give feedback on Instagram.</Text>
                        </View>
                        <Switcher
                            onTurnOn={_onChangeFeedbackEmails.bind(null, true)}
                            onTurnOff={_onChangeFeedbackEmails.bind(null, false)}
                            on={currentSetting?.feedbackEmails || false} />
                    </View>
                    <View style={styles.optionItem}>
                        <View style={styles.option}>
                            <Text style={{ fontWeight: '500', fontSize: 16 }}>Reminder Emails</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>Give feedback on Instagram.</Text>
                        </View>
                        <Switcher
                            onTurnOn={_onChangeReminderEmails.bind(null, true)}
                            onTurnOff={_onChangeReminderEmails.bind(null, false)}
                            on={currentSetting?.reminderEmails || false} />
                    </View>
                    <View style={styles.optionItem}>
                        <View style={styles.option}>
                            <Text style={{ fontWeight: '500', fontSize: 16 }}>Product Emails</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>Give feedback on Instagram.</Text>
                        </View>
                        <Switcher
                            onTurnOn={_onChangeProductEmails.bind(null, true)}
                            onTurnOff={_onChangeProductEmails.bind(null, false)}
                            on={currentSetting?.productEmail || false} />
                    </View>
                    <View style={styles.optionItem}>
                        <View style={styles.option}>
                            <Text style={{ fontWeight: '500', fontSize: 16 }}>News Emails</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>Give feedback on Instagram.</Text>
                        </View>
                        <Switcher
                            onTurnOn={_onChangeNewsEmails.bind(null, true)}
                            onTurnOff={_onChangeNewsEmails.bind(null, false)}
                            on={currentSetting?.newsEmails || false} />
                    </View>
                    <View style={styles.optionItem}>
                        <View style={styles.option}>
                            <Text style={{ fontWeight: '500', fontSize: 16 }}>Text(SMS) Messages</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>Give feedback on Instagram.</Text>
                        </View>
                        <Switcher
                            onTurnOn={_onChangeTextSMSMessages.bind(null, true)}
                            onTurnOff={_onChangeTextSMSMessages.bind(null, false)}
                            on={currentSetting?.textSMSMessages || false} />
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default EmailAndSMS

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    optionItem: {
        marginVertical: 5,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    option: {
        width: Dimensions.get('window').width - 30 - 35,
        paddingRight: 10,
        backgroundColor: '#fff',
    },
    optionsWrapper: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5
    }
})
