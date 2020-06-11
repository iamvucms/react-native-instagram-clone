import { firestore } from 'firebase'
import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'
import { FetchExtraInfoRequest, RemoveFollowerRequest, ToggleFollowUserRequest } from '../../../actions/userActions'
import NavigationBar from '../../../components/NavigationBar'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { UserInfo } from '../../../reducers/userReducer'
import { store } from '../../../store'
import { Post } from '../../../reducers/postReducer'
const RecentFollowerInteraction = () => {
    const dispatch = useDispatch()
    const [list, setList] = useState<UserInfo[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const extraInfo = useSelector(state => state.user.extraInfo)
    const username = store.getState().user.user.userInfo?.username
    useEffect(() => {
        dispatch(FetchExtraInfoRequest())
    }, [])
    useEffect(() => {
        if (extraInfo) {
            const ref = firestore()
            ref.collection('posts')
                .where('userId', '==', username)
                .limit(10)
                .orderBy('create_at', 'desc')
                .get().then(rs => {
                    let interactionList: string[] = []
                    rs.docs.map(post => {
                        const data: Post = post.data()
                        data.likes?.map(usr =>
                            interactionList.push(usr)
                        )
                        data.commentList?.map(usr =>
                            interactionList.push(usr)
                        )
                    })
                    interactionList = Array.from(new Set(interactionList))
                        .filter(usr => usr !== username)
                    const taskFollowers: Promise<UserInfo>[] = interactionList.map(async userX => {
                        const rq = await ref.collection('users').doc(userX).get()
                        const info: UserInfo = rq.data() || {}
                        return info
                    })
                    Promise.all(taskFollowers).then(result => {
                        setList(result)
                    })

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
            <NavigationBar title="Recent Interacted With"
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

export default RecentFollowerInteraction

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
