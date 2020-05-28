import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_HEIGHT, STATUS_BAR_HEIGHT, SCREEN_WIDTH } from '../../../../../constants'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { store } from '../../../../../store'
import { useSelector } from '../../../../../reducers'
import { UserInfo } from '../../../../../reducers/userReducer'
import { firestore } from 'firebase'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
import { findUsersByName } from '../../../../../utils'
const HideStoryFrom = (): JSX.Element => {
    const dispatch = useDispatch()
    const myUsername = store.getState().user.user.userInfo?.username
    const hideStoryFrom = useSelector(state =>
        state.user.setting?.privacy?.story?.hideStoryFrom)
    const [query, setQuery] = useState<string>('')
    const [hideList, setHideList] = useState<string[]>(hideStoryFrom || ['vucms.user1'])
    const [hideUsers, setHideUsers] = useState<UserInfo[]>([])
    const [result, setResult] = useState<UserInfo[]>([])
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
        if (hideList.length === 0) return setHideUsers(result)
        hideList.map((username, index) => {
            ref.collection('users').doc(username).get().then(rs => {
                result.push(rs.data() || {})
                if (index === hideList.length - 1) setHideUsers(result)
            })
        })

    }, [hideList])
    const _onToggleHide = (username: string) => {
        if (hideList.indexOf(username) === -1) {
            setHideList([...hideList, username])
            dispatch(UpdatePrivacySettingsRequest({
                story: {
                    hideStoryFrom: [...hideList, username]
                }
            }))
        } else {
            const temp = [...hideList]
            temp.splice(temp.indexOf(username), 1)
            setHideList(temp)
            dispatch(UpdatePrivacySettingsRequest({
                story: {
                    hideStoryFrom: temp
                }
            }))
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="Hide Story From" callback={() => {
                navigation.goBack()
            }} />
            <View style={styles.searchBar}>
                <View style={{
                    height: 40,
                    width: 40,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Icon name="magnify" size={24} />
                </View>
                <TextInput
                    autoCapitalize="none"
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search"
                    style={{
                        fontSize: 16,
                        width: SCREEN_WIDTH - 30 - 40,
                        height: '100%',
                    }} />
            </View>
            <ScrollView
                style={{
                    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT
                        - getTabBarHeight() - 70
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                {result.map((userX, index) => (
                    <UserItem
                        _onToggleHide={_onToggleHide}
                        hideList={hideList}
                        userX={userX}
                        key={index} />
                ))}
                {result.length === 0 && hideUsers.map((userX, index) => (
                    <UserItem
                        _onToggleHide={_onToggleHide}
                        hideList={hideList}
                        userX={userX}
                        key={index} />
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

export default HideStoryFrom

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 40,
        borderRadius: 5,
        margin: 15,
        borderColor: '#666',
        borderWidth: 1
    },
    peopleItem: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5
    },
    avatar: {
        marginRight: 10,
        borderWidth: 0.3,
        borderColor: '#ddd',
        width: 50,
        height: 50,
        borderRadius: 50
    },
    pureCircle: {
        width: 24,
        height: 24,
        borderRadius: 24,
        borderColor: '#ddd',
        borderWidth: 2
    }
})
const UserItem = ({ userX, hideList, _onToggleHide }: { _onToggleHide: (username: string) => void, userX: UserInfo, hideList: string[] }) => {
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
                    }}
                />
                <View>
                    <Text style={{
                        fontSize: 16
                    }}>{userX.username}</Text>
                    <Text style={{
                        fontWeight: 'bold',
                        color: '#666',
                    }}>{userX.fullname}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={_onToggleHide.bind(null, userX.username || '')}
            >
                {hideList.indexOf(userX.username || '') > -1 ? (
                    <Image style={{
                        width: 24,
                        height: 24
                    }} source={require('../../../../../assets/icons/check.png')} />
                ) : (
                        <View style={styles.pureCircle} />
                    )}


            </TouchableOpacity>
        </View>

    )
}
