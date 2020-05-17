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
    icon?: string,
    name: string,
    component: () => JSX.Element,
    navigationName: string,
    child?: SettingNavigation[]
}
export const settingNavigationMap: SettingNavigation[] = [
    {
        icon: 'account-plus-outline',
        name: 'Follow and Invite Friends',
        navigationName: 'FollowFriendSetting',
        component: SettingComponents.FollowFriends,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contacts',
                component: SettingComponents.FollowContacts,
                navigationName: 'FollowContact',
            },
            {
                icon: 'email-outline',
                name: 'Invite Friends by Email',
                component: SettingComponents.InviteByEmail,
                navigationName: 'InviteByEmail',
            },
            {
                icon: 'comment-outline',
                name: 'Invite Friends by SMS',
                component: SettingComponents.InviteBySMS,
                navigationName: 'InviteBySMS',
            },
            {
                icon: 'share-outline',
                name: 'Invite Friends by...',
                component: SettingComponents.InviteByOther,
                navigationName: 'InviteByOther',
            }
        ]
    },
    {
        icon: 'bell-outline',
        name: 'Notifications',
        navigationName: 'NotificationsSetting',
        component: SettingComponents.Notifications,
        child: [
            {
                name: 'Posts, Stories and Comments',
                component: SettingComponents.PostStoryComment,
                navigationName: 'PostStoryComment',
            }, {
                name: 'Following and Followers',
                component: SettingComponents.FollowingFollower,
                navigationName: 'FollowingFollower',
            }, {
                name: 'Direct Messages',
                component: SettingComponents.DirectMessages,
                navigationName: 'DirectMessages',
            }, {
                name: 'Live and IGTV',
                component: SettingComponents.LiveIGTV,
                navigationName: 'LiveIGTV',
            }, {
                name: 'From Instagram',
                component: SettingComponents.FromInstagram,
                navigationName: 'FromInstagram',
            }, {
                name: 'SMS and Email',
                component: SettingComponents.EmailAndSMS,
                navigationName: 'EmailAndSMS',
            }
        ]
    }, {
        icon: 'lock-outline',
        name: 'Privacy',
        navigationName: 'PrivacySetting',
        component: SettingComponents.Privacy,
        child: [
            {
                icon: 'comment-outline',
                name: 'Comments',
                component: SettingComponents.Comments,
                navigationName: 'Comments',
            },
            {
                icon: 'tooltip-image-outline',
                name: 'Tags',
                component: SettingComponents.Tags,
                navigationName: 'Tags',
            },
            {
                icon: 'plus-outline',
                name: 'Story',
                component: SettingComponents.Story,
                navigationName: 'StoryPrivacy',
            },
            {
                icon: 'account-check-outline',
                name: 'Activity Status',
                component: SettingComponents.ActivityStatus,
                navigationName: 'ActivityStatus',
            },
            {
                icon: 'lock',
                name: 'Account Privacy',
                component: SettingComponents.AccountPrivacy,
                navigationName: 'AccountPrivacy',
            },
            {
                icon: 'eye-off-outline',
                name: 'Restricted Accounts',
                component: SettingComponents.RestrictedAccounts,
                navigationName: 'RestrictedAccounts',
            },
            {
                icon: 'block-helper',
                name: 'Blocked Accounts',
                component: SettingComponents.BlockedAccounts,
                navigationName: 'BlockedAccounts',
            },
            {
                icon: 'bell-off-outline',
                name: 'Muted Accounts',
                component: SettingComponents.MutedAccounts,
                navigationName: 'MutedAccounts',
            },
            {
                icon: 'account-star',
                name: 'Close Friends',
                component: SettingComponents.CloseFriends,
                navigationName: 'CloseFriends1',
            },
            {
                icon: 'account-multiple-outline',
                name: 'Accounts You Follow',
                component: SettingComponents.AccountYouFollow,
                navigationName: 'Account YouFollow',
            }
        ]
    }, {
        icon: 'shield-check-outline',
        name: 'Security',
        navigationName: 'SecuritySetting',
        component: SettingComponents.Security,
        child: [
            {
                icon: 'key-variant',
                name: 'Password',
                component: SettingComponents.Password,
                navigationName: 'PasswordModify',
            }, {
                icon: 'crosshairs',
                name: 'Login Activity',
                component: SettingComponents.LoginActivity,
                navigationName: 'LoginActivity',
            }, {
                icon: 'account-clock-outline',
                name: 'Saved Login Info',
                component: SettingComponents.SavedLoginInfo,
                navigationName: 'SavedLoginInfo',
            }, {
                icon: 'two-factor-authentication',
                name: 'Two Factor Authentication',
                component: SettingComponents.TwoFactor,
                navigationName: 'TwoFactor',
            }, {
                icon: 'email-outline',
                name: 'Email From Instagram',
                component: SettingComponents.EmailFromInstagram,
                navigationName: 'EmailFromInstagram',
            }
        ]
    }, {
        icon: 'bullhorn-outline',
        name: 'Ads',
        navigationName: 'AdsSetting',
        component: SettingComponents.Ads,
        child: [
            {
                name: 'Ad Activity',
                component: SettingComponents.AdActivity,
                navigationName: 'AdActivity',
            },
            {
                name: 'About Ads',
                component: SettingComponents.AboutAds,
                navigationName: 'AboutAds',
            }
        ]
    }, {
        icon: 'account-circle-outline',
        name: 'Account',
        navigationName: 'AccountSetting',
        component: SettingComponents.Account,
        child: [
            {
                name: 'Your Activity',
                component: SettingComponents.YourActivity,
                navigationName: 'YourActivity',
            },
            {
                name: 'Saved',
                component: SettingComponents.Saved,
                navigationName: 'Saved',
            },
            {
                name: 'Close Friends',
                component: SettingComponents.CloseFriends,
                navigationName: 'CloseFriends',
            }, {
                name: 'Language',
                component: SettingComponents.Language,
                navigationName: 'Language',
            }, {
                name: 'Browser Autofill',
                component: SettingComponents.BrowserAutofill,
                navigationName: 'BrowserAutofill',
            }, {
                name: 'Contacts Syncing',
                component: SettingComponents.ContactSync,
                navigationName: 'ContactSync',
            }, {
                name: 'Linked Accounts',
                component: SettingComponents.LinkedAccounts,
                navigationName: 'LinkedAccounts',
            }, {
                name: 'Request Verification',
                component: SettingComponents.RequestVerification,
                navigationName: 'RequestVerification',
            },
            {
                name: `Posts You've Liked`,
                component: SettingComponents.PostYouLiked,
                navigationName: 'PostYouLiked',
            }
        ]
    },
    {
        icon: 'help-circle-outline',
        name: 'Help',
        navigationName: 'HelpSetting',
        component: SettingComponents.Help,
        child: [
            {
                name: 'Report a Problem',
                component: SettingComponents.ReportProblem,
                navigationName: 'ReportProblem',
            },
            {
                name: 'Help Center',
                component: SettingComponents.HelpCenter,
                navigationName: 'HelpCenter',
            },
            {
                name: 'Privacy and Security Help',
                component: SettingComponents.PrivacySecurityHelp,
                navigationName: 'PrivacySecurityHelp',
            }
        ]
    }, {
        icon: 'alert-circle-outline',
        name: 'About',
        navigationName: 'AboutSetting',
        component: SettingComponents.About,
        child: [
            {
                name: 'App Updates',
                component: SettingComponents.AppUpdate,
                navigationName: 'AppUpdate',
            }, {
                name: 'Data Policy',
                component: SettingComponents.DataPolicy,
                navigationName: 'DataPolicy',
            }, {
                name: 'Term of Use',
                component: SettingComponents.Term,
                navigationName: 'Term',
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
        <SafeAreaView style={{ backgroundColor: '#fff' }}>
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
                                    <View
                                        key={index}
                                        style={{
                                            backgroundColor: '#000'
                                        }}>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={styles.settingItem}>
                                            {settingNavigation.icon &&
                                                <Icon name={settingNavigation.icon} size={24} />}
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
                        <View
                            key={index}
                            style={{
                                backgroundColor: '#000'
                            }}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate(settingNavigation.navigationName)
                                }}

                                activeOpacity={0.9}
                                style={styles.settingItem}>
                                {settingNavigation.icon &&
                                    <Icon name={settingNavigation.icon} size={24} />}
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
                        onPress={() => navigation.navigate('AddAccount')}
                        activeOpacity={0.9}
                        style={styles.settingItem}>
                        <Text style={{
                            fontSize: 16,
                            color: '#318bfb',
                            fontWeight: '400',
                        }}>Add Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Logout')}
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
