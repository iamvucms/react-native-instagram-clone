import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import { store } from '../../../../../store'
import { UserInfo } from '../../../../../reducers/userReducer'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { firestore } from 'firebase'
type MutedUser = {
    user: UserInfo,
    mutedPost: boolean,
    mutedStory: boolean
}
const MutedAccounts = (): JSX.Element => {
    const route = useRoute()
    const mutedAccounts = store.getState().user.setting?.privacy?.mutedAccouts
    const [mutedPostAccounts, setMutedPostAccounts] = useState<string[]>(mutedAccounts?.posts || [])
    const [mutedStoryAccounts, setMutedStoryAccounts] = useState<string[]>(mutedAccounts?.story || [])
    const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([])
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
        let result: MutedUser[] = []
        const ref = firestore();
        const fetchMutedStoryUsers = () => {
            mutedStoryAccounts.map(async (username) => {
                const index2 = mutedPostAccounts.indexOf(username)
                if (index2 > -1) {
                    result = result.map(mutedUser => {
                        if (mutedUser.user.username === username) {
                            return {
                                ...mutedUser,
                                mutedStory: true
                            }
                        }
                        return mutedUser
                    })
                } else {
                    const rs = await ref.collection('users').doc(username).get()
                    const data: MutedUser = {
                        user: rs.data() || {},
                        mutedPost: false,
                        mutedStory: true
                    }
                    result.push(data)
                }
                setMutedUsers(result)
            })
        }
        mutedPostAccounts.map(async (username, index) => {
            const rs = await ref.collection('users').doc(username).get()
            const data: MutedUser = {
                user: rs.data() || {},
                mutedPost: true,
                mutedStory: false
            }
            result.push(data)
            if (index === mutedPostAccounts.length - 1) {
                fetchMutedStoryUsers()
            }
        })
        if (mutedPostAccounts.length === 0) fetchMutedStoryUsers()


    }, [mutedPostAccounts, mutedStoryAccounts])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                style={{
                    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - getTabBarHeight() - 44
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    marginVertical: 10,
                }}>
                    {mutedUsers.map((userX, index) => (
                        <TouchableOpacity style={styles.peopleItem}>
                            <Image style={{
                                width: 50,
                                height: 50,
                                borderRadius: 50,
                                marginRight: 10,
                                borderColor: '#ddd',
                                borderWidth: 1
                            }} source={{
                                uri: userX.user.avatarURL
                            }} />
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                    {userX.user.username}
                                </Text>
                                <Text style={{ color: '#666' }}>
                                    {userX.mutedPost && userX.mutedStory &&
                                        'Posts and story muted'}
                                    {userX.mutedPost && !userX.mutedStory &&
                                        'Post muted'}
                                    {!userX.mutedPost && userX.mutedStory &&
                                        'Story muted'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default MutedAccounts

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    peopleItem: {
        marginVertical: 5,
        flexDirection: 'row',
        paddingHorizontal: 15,
        alignItems: 'center'
    }
})
