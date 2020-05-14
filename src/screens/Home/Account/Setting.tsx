import React, { useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack, navigation } from '../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../constants'
import { TextInput } from 'react-native-gesture-handler'
import { getTabBarHeight } from '../../../components/BottomTabBar'
import SettingComponents from './Setting/index'
export type SettingNavigation = {
    icon: string,
    name: string,
    component: JSX.Element,
    navigationName: string,
    child?: SettingNavigation[]
}
export const settingNavigationMap: SettingNavigation[] = [
    {
        icon: 'account-plus-outline',
        name: 'Follow and Invite Friends',
        navigationName: 'FollowFriendSetting',
        component: <SettingComponents.FollowFriends />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'f',
            }
        ]
    },
    {
        icon: 'bell-outline',
        name: 'Notifications',
        navigationName: 'NotificationsSetting',
        component: <SettingComponents.Notifications />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'h',
            }
        ]
    }, {
        icon: 'lock-outline',
        name: 'Privacy',
        navigationName: 'PrivacySetting',
        component: <SettingComponents.Privacy />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'g',
            }
        ]
    }, {
        icon: 'shield-check-outline',
        name: 'Security',
        navigationName: 'SecuritySetting',
        component: <SettingComponents.Security />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'e',
            }
        ]
    }, {
        icon: 'bullhorn-outline',
        name: 'Ads',
        navigationName: 'AdsSetting',
        component: <SettingComponents.Ads />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'd',
            }
        ]
    }, {
        icon: 'account-circle-outline',
        name: 'Account',
        navigationName: 'AccountSetting',
        component: <SettingComponents.Account />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'c',
            }
        ]
    },
    {
        icon: 'help-circle-outline',
        name: 'Help',
        navigationName: 'HelpSetting',
        component: <SettingComponents.Help />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'a',
            }
        ]
    }, {
        icon: 'alert-circle-outline',
        name: 'About',
        navigationName: 'AboutSetting',
        component: <SettingComponents.About />,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contact',
                component: <SettingComponents.FollowContacts />,
                navigationName: 'b',
            }
        ]
    }
]
const Setting = () => {
    const [result, setResult] = useState<SettingNavigation[]>([])
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const _onSearch = (q: string) => {
        if (q.length === 0) return (() => { setResult([]); setIsSearching(false) })()

        const temp: SettingNavigation[] = []
        q = q.toLocaleLowerCase()
        settingNavigationMap.map(settingNavigation => {
            if (settingNavigation.name.toLocaleLowerCase().indexOf(q) > -1) {
                temp.push(settingNavigation)
            }
            if (settingNavigation.child) {
                settingNavigation.child.map(settingChildNavigation => {
                    if (settingChildNavigation.name.toLocaleLowerCase().indexOf(q) > -1) {
                        temp.push(settingChildNavigation)
                    }
                })
            }
        })
        setResult(temp)
        setIsSearching(true)
    }
    return (
        <SafeAreaView >
            <NavigationBar title="Setting" callback={() => goBack()} />
            <View style={styles.container}>

                <ScrollView
                    bounces={false}
                >
                    <View style={styles.searchWrapper}>
                        <View style={{
                            width: SCREEN_WIDTH - 30,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderBottomColor: "#ddd",
                            borderBottomWidth: 1
                        }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Icon name="magnify" size={24} />
                            </View>
                            <TextInput
                                onChangeText={_onSearch}
                                autoFocus={false}
                                style={{
                                    width: SCREEN_WIDTH - 30 - 50,
                                    height: 40,
                                    fontSize: 16
                                }} />

                        </View>
                        {isSearching && <View style={styles.resultWrapper}>
                            <ScrollView >
                                {result.map((settingNavigation, index) => (
                                    <View style={{
                                        backgroundColor: '#000'
                                    }}>
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.9}
                                            style={styles.settingItem}>
                                            <Icon name={settingNavigation.icon} size={24} />
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: '400',
                                                marginLeft: 10,
                                            }}>{settingNavigation.name}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>}

                    </View>
                    {settingNavigationMap.map((settingNavigation, index) => (
                        <View style={{
                            backgroundColor: '#000'
                        }}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate(settingNavigation.navigationName)
                                }}
                                key={index}
                                activeOpacity={0.9}
                                style={styles.settingItem}>
                                <Icon name={settingNavigation.icon} size={24} />
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '400',
                                    marginLeft: 10,
                                }}>{settingNavigation.name}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <View
                        style={styles.settingItem}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500',
                        }}>Logins</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.settingItem}>
                        <Text style={{
                            fontSize: 16,
                            color: '#318bfb',
                            fontWeight: '400',
                        }}>Add Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.settingItem}>
                        <Text style={{
                            fontSize: 16,
                            color: '#318bfb',
                            fontWeight: '400',
                        }}>Log Out</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Setting

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        height: '100%',
    },
    searchWrapper: {
        zIndex: 999,
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        height: 50,
        backgroundColor: '#fff',
        width: SCREEN_WIDTH
    },
    resultWrapper: {
        backgroundColor: '#fff',
        zIndex: 999,
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - getTabBarHeight() - 44 - 50
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
