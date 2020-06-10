import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { UserInfo } from '../../../reducers/userReducer'
import FastImage from 'react-native-fast-image'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT, SCREEN_WIDTH } from '../../../constants'
import { getTabBarHeight } from '../../../components/BottomTabBar'
import { useSelector } from '../../../reducers'
import { store } from '../../../store'
import { firestore } from 'firebase'
import { useDispatch } from 'react-redux'
import { RemoveFollowerRequest, ToggleFollowUserRequest, FetchExtraInfoRequest } from '../../../actions/userActions'
type MixedUserInfo = UserInfo & {
    isFollowed?: boolean
}
const AccountYouDontFollowBack = () => {
    const dispatch = useDispatch()
    const [list, setList] = useState<MixedUserInfo[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const extraInfo = useSelector(state => state.user.extraInfo)
    const username = store.getState().user.user.userInfo?.username
    useEffect(() => {
        dispatch(FetchExtraInfoRequest())
    }, [])
    useEffect(() => {
        if (extraInfo) {
            const followerUsrnames = [...extraInfo.followers]
            const follwingUsrnames = [...extraInfo.followings]
            const dontFollowUsrnames = [...followerUsrnames.filter(usr =>
                follwingUsrnames.indexOf(usr) < 0)]
            followerUsrnames.splice(extraInfo.followers.indexOf(username || ""), 1)
            follwingUsrnames.splice(extraInfo.followings.indexOf(username || ""), 1)
            const ref = firestore()
            const taskFollowers: Promise<UserInfo>[] = followerUsrnames.map(async userX => {
                const rq = await ref.collection('users').doc(userX).get()
                const info: UserInfo = rq.data() || {}
                return info
            })
            Promise.all(taskFollowers).then(result => {
                const dontFollowBackUsers = [...result.filter(usr =>
                    dontFollowUsrnames.indexOf(usr.username || '') > -1
                )]
                setList(dontFollowBackUsers)
            })
        }
    }, [extraInfo])
    const _onRemove = (index: number) => {
        setSelectedIndex(index)
    }
    const _onConfirmRemoveFollower = (username: string) => {
        dispatch(RemoveFollowerRequest(username))
        setSelectedIndex(-1)
    }
    const _onToggleFollow = (username: string) => {
        dispatch(ToggleFollowUserRequest(username))
        let temp = [...list]
        temp = temp.map(usr => {
            if (usr.username === username) {
                if (usr.isFollowed) usr.isFollowed = false
                else usr.isFollowed = true
                return usr
            }
            return usr
        })
        setList(temp)
    }
    return (
        <SafeAreaView style={styles.container}>
            {selectedIndex > -1 &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={setSelectedIndex.bind(null, -1)}
                    style={styles.confirmWrapper}>
                    <View style={styles.confirmBox}>
                        <FastImage style={styles.avatar} source={{ uri: list[selectedIndex].avatarURL }} />
                        <Text style={{
                            marginTop: 15,
                            fontSize: 20,
                            fontWeight: '600'
                        }}>Remove Follower?</Text>
                        <Text style={{
                            color: "#666",
                            textAlign: 'center',
                            marginBottom: 20,
                        }}>
                            Instagram won't tell {list[selectedIndex].username} they were removed from your followers.
                        </Text>
                        <TouchableOpacity
                            onPress={() => _onConfirmRemoveFollower(list[selectedIndex].username || '')}
                            style={styles.btnConfirm}>
                            <Text style={{
                                color: '#318bfb',
                                fontSize: 16,
                                fontWeight: '600'
                            }}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={setSelectedIndex.bind(null, -1)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            <NavigationBar title="Account You Don't Follow Back"
                callback={goBack}
            />
            <FlatList
                data={list}
                renderItem={({ item, index }) =>
                    <TouchableOpacity
                        onPress={() => navigate('ProfileX', {
                            username: item.username
                        })}
                        style={styles.userItem}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <FastImage
                                style={styles.avatar}
                                source={{
                                    uri: item.avatarURL
                                }} />
                            <View style={{
                                marginLeft: 10
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <Text>{item.username}</Text>
                                    <Text> • </Text>
                                    <TouchableOpacity
                                        onPress={() => _onToggleFollow(item.username || '')}
                                    >
                                        <Text style={{
                                            color: '#318bfb',
                                            fontWeight: '500'
                                        }}>{item.isFollowed ? 'Following' : 'Follow'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{
                                    fontWeight: '500',
                                    color: '#666'
                                }}>{item.fullname}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={_onRemove.bind(null, index)}
                            style={styles.btnRemove}>
                            <Text style={{
                                fontWeight: "500"
                            }}>Remove</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                }
                keyExtractor={(item, index) => `${index}`}
            />
        </SafeAreaView>
    )
}

export default AccountYouDontFollowBack

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: "#fff"
    },
    userItem: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5
    },
    btnRemove: {
        height: 30,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5
    },
    avatar: {
        height: 64,
        width: 64,
        borderRadius: 32,
        borderColor: "#333",
        borderWidth: 0.3
    },
    confirmWrapper: {
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(0,0,0,0.3)',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        paddingTop: 15,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    btnConfirm: {
        borderTopColor: '#ddd',
        borderTopWidth: 0.5,
        height: 44,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
