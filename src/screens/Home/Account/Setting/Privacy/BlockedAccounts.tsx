import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import { UserInfo } from '../../../../../reducers/userReducer'
import { firestore } from 'firebase'
import { store } from '../../../../../store'
import { useDispatch } from 'react-redux'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
const BlockedAccounts = (): JSX.Element => {
    const route = useRoute()
    const dipatch = useDispatch()
    const blockedAccounts = store.getState().user.setting?.privacy?.blockedAccounts
    const [blockList, setBlockList] = useState<string[]>(blockedAccounts?.blockedAccounts || [])
    const [blockedUsers, setBlockedUsers] = useState<UserInfo[]>([])
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
        const result: UserInfo[] = []
        const ref = firestore()
        if (blockList && blockList.length === 0)
            return setBlockedUsers(result)
        if (blockList !== undefined) {
            blockList.map(async (username, index) => {
                const rs = await ref.collection('users').doc(username).get()
                result.push(rs.data() || {})
                if (index === blockList.length - 1) setBlockedUsers(result)
            })
        }
    }, [blockList])
    const _unblock = (username: string) => {
        const temp = [...blockList]
        temp.splice(temp.indexOf(username), 1)
        setBlockList(temp)
        dipatch(UpdatePrivacySettingsRequest({
            blockedAccounts: {
                blockedAccounts: [...temp]
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
                    height: SCREEN_HEIGHT - getTabBarHeight() - STATUS_BAR_HEIGHT - 44
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                {blockedUsers.map((userX, index) => (
                    <UserItem key={index} userX={userX}
                        _unblock={_unblock} blockList={blockList} />
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

export default BlockedAccounts

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
    peopleItem: {
        marginVertical: 5,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    avatar: {
        marginRight: 10,
        height: 50,
        width: 50,
        borderRadius: 50,
        borderColor: '#ddd',
        borderWidth: 0.3,
    },
    btnUnRestrict: {
        borderRadius: 5,
        borderColor: '#ddd',
        borderWidth: 1,
        paddingVertical: 5,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center'
    },
})
const UserItem = ({ userX, blockList, _unblock }: { blockList: string[], userX: UserInfo, _unblock: (username: string) => void }) => {
    return (
        <View style={styles.peopleItem}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <Image
                    style={styles.avatar}
                    source={{
                        uri: userX.avatarURL
                    }} />
                <View style={{
                    width: SCREEN_WIDTH - 30 - 70 - 50 - 20
                }}>
                    <Text style={{
                        fontWeight: '600',
                        fontSize: 16
                    }}>{userX.username}</Text>
                    <Text numberOfLines={1} style={{ color: '#666', width: '90%' }}>
                        {userX.fullname}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={_unblock.bind(null, userX.username || '')}
                activeOpacity={0.8}
                style={{
                    ...styles.btnUnRestrict,
                    backgroundColor: blockList.indexOf(userX.username || '') < 0 ? '#318bfb' : '#fff'
                }}>
                <Text style={{
                    fontWeight: '600',
                    color: blockList.indexOf(userX.username || '') < 0 ? '#fff' : '#000',
                }}>{blockList.indexOf(userX.username || '') < 0 ? 'Block' : 'Unblock'}</Text>
            </TouchableOpacity>
        </View>
    )
}
