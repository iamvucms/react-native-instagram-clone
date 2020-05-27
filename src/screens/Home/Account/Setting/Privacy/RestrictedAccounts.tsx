import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { UserInfo } from '../../../../../reducers/userReducer'
import { useDispatch } from 'react-redux'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
import { store } from '../../../../../store'
import { firestore } from 'firebase'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
const RestrictedAccounts = (): JSX.Element => {
    const route = useRoute()
    const myUsername = store.getState().user.user.userInfo?.username
    const restrictedAccounts = store.getState().user.setting?.privacy?.restrictedAccounts?.restrictedAccounts
    const dispatch = useDispatch()
    const [query, setQuery] = useState<string>('')
    const [searching, setSearching] = useState<boolean>(false)
    const [restrictedList, setRestrictedList] = useState<string[]>(restrictedAccounts || ['vucms.user1'])
    const [restrictedUsers, setRestrictedUsers] = useState<UserInfo[]>([])
    const [result, setResult] = useState<UserInfo[]>([])
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

    const ref = useRef<{
        timeout: NodeJS.Timeout
    }>({ timeout: setTimeout(() => { }, 0) })
    useEffect(() => {
        clearTimeout(ref.current.timeout)
        ref.current.timeout = setTimeout(() => {
            findUsersByName(query).then(rs => {
                setResult(rs)
            })
        }, 500);

    }, [query])
    useEffect(() => {
        const result: UserInfo[] = []
        const ref = firestore()
        if (restrictedList.length === 0) return setRestrictedUsers(result)
        restrictedList.map((username, index) => {
            ref.collection('users').doc(username).get().then(rs => {
                result.push(rs.data() || {})
                if (index === restrictedList.length - 1) setRestrictedUsers(result)
            })
        })

    }, [restrictedList])
    const _onToggleRestrict = (username: string) => {
        if (restrictedList.indexOf(username) === -1) {
            setRestrictedList([...restrictedList, username])
            dispatch(UpdatePrivacySettingsRequest({
                restrictedAccounts: {
                    restrictedAccounts: [...restrictedList, username]
                }
            }))
        } else {
            const temp = [...restrictedList]
            temp.splice(temp.indexOf(username), 1)
            setRestrictedList(temp)
            dispatch(UpdatePrivacySettingsRequest({
                restrictedAccounts: {
                    restrictedAccounts: temp
                }
            }))
        }
    }
    const findUsersByName = async (q: string) => {
        let users: UserInfo[] = []
        const ref = firestore()
        const rq = await ref.collection('users').where(
            'keyword', 'array-contains', q
        ).get()
        rq.docs.map(x => {
            const user: UserInfo = x.data()
            users.push(user)
        })
        users = users.filter(u => u.username !== myUsername)
        return users
    }
    return (
        <SafeAreaView style={styles.container}>
            {searching && <View style={{
                width: '100%',
                height: SCREEN_HEIGHT,
                paddingTop: STATUS_BAR_HEIGHT,
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
                backgroundColor: '#fff'
            }}>
                <View style={styles.searchInput}>
                    <TouchableOpacity
                        onPress={setSearching.bind(null, false)}
                        style={{
                            height: 44,
                            width: 44,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <TextInput
                        autoCapitalize="none"
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search"
                        autoFocus={true}
                        style={{
                            width: SCREEN_WIDTH - 44,
                            height: 44,
                            fontSize: 16,
                        }} />
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    style={{
                        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - getTabBarHeight() - 44
                    }}>
                    {result.map((userX, index) => (
                        <UserItem
                            restrictList={restrictedList}
                            _onToggleRestrict={_onToggleRestrict}
                            userX={userX}
                            key={index}
                        />
                    ))}
                </ScrollView>
            </View>}
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    alignItems: 'center',
                    paddingVertical: 25,
                    borderBottomColor: '#ddd',
                    borderBottomWidth: 1
                }}>
                    <Text style={{
                        maxWidth: '85%',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        Protect yourself from unwanted interactions without having to block or unfollow people you know. <Text style={{
                            color: '#318bfb'
                        }}>Learn how it work.</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={setSearching.bind(null, true)}
                    activeOpacity={1}
                    style={styles.mockInputSearch}>
                    <View style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Icon name="magnify" size={24} color="#666" />
                    </View>
                    <Text style={{
                        fontSize: 16,
                        color: '#666'
                    }}>Search</Text>
                </TouchableOpacity>
                {restrictedUsers.map((userX, index) => (
                    <UserItem
                        restrictList={restrictedList}
                        _onToggleRestrict={_onToggleRestrict}
                        userX={userX}
                        key={index}
                    />
                ))}
            </ScrollView>
        </SafeAreaView >
    )
}

export default RestrictedAccounts

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    mockInputSearch: {
        borderRadius: 5,
        borderColor: '#666',
        borderWidth: 1,
        height: 40,
        margin: 15,
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
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    }
})
const UserItem = ({ userX, restrictList, _onToggleRestrict }: { restrictList: string[], userX: UserInfo, _onToggleRestrict: (username: string) => void }) => {
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
                        {userX.bio}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={_onToggleRestrict.bind(null, userX.username || '')}
                activeOpacity={0.8}
                style={{
                    ...styles.btnUnRestrict,
                    backgroundColor: restrictList.indexOf(userX.username || '') < 0 ? '#318bfb' : '#fff'
                }}>
                <Text style={{
                    fontWeight: '600',
                    color: restrictList.indexOf(userX.username || '') < 0 ? '#fff' : '#000',
                }}>{restrictList.indexOf(userX.username || '') < 0 ? 'Restrict' : 'Unrestrict'}</Text>
            </TouchableOpacity>
        </View>
    )
}
