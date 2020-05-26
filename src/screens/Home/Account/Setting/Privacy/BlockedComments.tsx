import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Dimensions, Image } from 'react-native'
import NavigationBar from '../../../../../components/NavigationBar'
import { goBack } from '../../../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import { useDispatch } from 'react-redux'
import { firestore, database } from 'firebase'
import { UserInfo } from '../../../../../reducers/userReducer'
import { generateUsernameKeywords } from '../../../../../utils'
import { useSelector } from '../../../../../reducers'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { store } from '../../../../../store'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
const BlockedComments = () => {
    const dispatch = useDispatch()
    const myUsername = store.getState().user.user.userInfo?.username
    const blockedComments = useSelector(state =>
        state.user.setting?.privacy?.comments?.blockUsers)
    const [focused, setFocused] = useState<boolean>(false)
    const [fetching, setFetching] = useState<boolean>(false)
    const [query, setQuery] = useState<string>('')
    const [blockList, setBlockList] = useState<string[]>(blockedComments || [])
    const [blockedUsers, setBlockedUsers] = useState<UserInfo[]>([])
    const [result, setResult] = useState<UserInfo[]>([])
    const ref = useRef<{
        timeout: NodeJS.Timeout
    }>({ timeout: setTimeout(() => { }, 0) })
    useEffect(() => {
        clearTimeout(ref.current.timeout)
        ref.current.timeout = setTimeout(() => {
            setFetching(true)
            findUsersByName(query).then(rs => {
                setFetching(false)
                setResult(rs)
            })

        }, 500);

    }, [query])
    useEffect(() => {
        const result: UserInfo[] = []
        const ref = firestore()
        if (blockList.length === 0) return setBlockedUsers(result)
        blockList.map((username, index) => {
            ref.collection('users').doc(username).get().then(rs => {
                result.push(rs.data() || {})
                if (index === blockList.length - 1) setBlockedUsers(result)
            })
        })

    }, [blockList])
    const _onChangeText = (q: string) => {
        setQuery(q)

    }
    const _onToggleBlock = (username: string) => {
        if (blockList.indexOf(username) === -1) {
            setBlockList([...blockList, username])
            dispatch(UpdatePrivacySettingsRequest({
                comments: {
                    blockUsers: [...blockList, username]
                }
            }))
        } else {
            const temp = [...blockList]
            temp.splice(temp.indexOf(username), 1)
            setBlockList(temp)
            dispatch(UpdatePrivacySettingsRequest({
                comments: {
                    blockUsers: temp
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
            <NavigationBar title="Blocked Commenters" callback={goBack} />
            <View style={{
                ...styles.searchWrapper,
                borderColor: focused ? '#318bfb' : '#ddd'
            }}>
                <View style={{
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Icon color="#666"
                        name="magnify" size={20} />
                </View>
                <TextInput
                    autoCapitalize="none"
                    value={query}
                    onChangeText={_onChangeText}
                    onFocus={() => setFocused(true)} style={styles.textInput} />
                {focused &&
                    <TouchableOpacity
                        onPress={setQuery.bind(null, '')}
                        style={{
                            width: 44,
                            height: 44,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Text style={{ color: '#666' }}>✖</Text>
                    </TouchableOpacity>}
            </View>
            <ScrollView
                style={{
                    backgroundColor: '#fff',
                    height: SCREEN_HEIGHT -
                        STATUS_BAR_HEIGHT - getTabBarHeight() - 44 - 60
                }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {result.map((userx, index) => (
                    <UserItem
                        key={index}
                        userx={userx}
                        _onToggleBlock={_onToggleBlock}
                        blockList={blockList} />
                ))}
                {result.length === 0 && blockedUsers.map((userx, index) => (
                    <UserItem
                        key={index}
                        userx={userx}
                        _onToggleBlock={_onToggleBlock}
                        blockList={blockList} />
                ))}
                {result.length === 0 && blockList.length === 0 && (
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: SCREEN_HEIGHT -
                            STATUS_BAR_HEIGHT - getTabBarHeight() - 44 - 60
                    }}>
                        <Text style={{
                            paddingHorizontal: 15,
                            color: '#666',
                        }}>
                            People won't be notified when you block them. Any new comments they make on your posts won't be visible to anyone but them.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView >
    )
}

export default BlockedComments

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },

    searchWrapper: {
        height: 44,
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 15,
        marginVertical: 10,
        borderBottomWidth: 1,
    },
    peopleItem: {
        paddingHorizontal: 15,
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textInput: {
        height: 44,
        width: Dimensions.get('window').width - 30 - 88
    },
    btnBlock: {
        alignItems: 'center',
        backgroundColor: '#318bfb',
        paddingVertical: 7.5,
        borderRadius: 5,
    }
})
//USER ITEM
export const UserItem = ({
    userx,
    blockList,
    _onToggleBlock
}: {
    _onToggleBlock: (username: string) => void
    blockList: string[]
    userx: UserInfo
}) => {
    return (
        <View style={styles.peopleItem}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <Image style={{
                    height: 50,
                    width: 50,
                    borderColor: '#ddd',
                    borderWidth: 0.5,
                    borderRadius: 50
                }} source={{
                    uri: userx.avatarURL,
                }} />
                <View style={{
                    marginHorizontal: 10
                }}>
                    <Text style={{
                        fontWeight: '600',
                        fontSize: 16
                    }}>{userx.username}</Text>
                    <Text style={{
                        width: SCREEN_WIDTH - 30 - 50 - 20 - blockList.indexOf(userx.username || '')
                            > -1 ? 70 : 60
                    }} numberOfLines={1}>{userx.bio}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={_onToggleBlock.bind(null, userx.username || '')}
                activeOpacity={0.8}
                style={{
                    ...styles.btnBlock,
                    backgroundColor: blockList.indexOf(userx.username || '')
                        > -1 ? '#ddd' : '#318bfb',
                    width: blockList.indexOf(userx.username || '')
                        > -1 ? 70 : 60,
                }}>
                <Text style={{
                    fontWeight: 'bold',
                    color: blockList.indexOf(userx.username || '')
                        > -1 ? '#000' : '#fff',

                }}>{blockList.indexOf(userx.username || '')
                    > -1 ? 'Unblock' : 'Block'}</Text>
            </TouchableOpacity>
        </View>

    )
}