import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSuggestion, ExtraSuggestionUserInfo } from '../../../hooks/useSuggestion'
import { navigate } from '../../../navigations/rootNavigation'
import FastImage from 'react-native-fast-image'
import { UserInfo } from '../../../reducers/userReducer'
import { useSelector } from '../../../reducers'
import { firestore } from 'firebase'
import { useDispatch } from 'react-redux'
import { UnSuggestionRequest, ToggleFollowUserRequest, ToggleSendFollowRequest, FetchExtraInfoRequest } from '../../../actions/userActions'
import { FlatList } from 'react-native-gesture-handler'
import { Notification } from '../../../reducers/notificationReducer'
import { useIsFocused } from '@react-navigation/native'
import { FetchNotificationListRequest } from '../../../actions/notificationActions'
import NotificationItem from '../../../components/NotificationItem'

const index = () => {
    const dispatch = useDispatch()
    const focused = useIsFocused()
    const extraInfo = useSelector(state => state.user.extraInfo)
    const [suggests, setSuggests] = useSuggestion(20)
    const notifications = useSelector(state => state.notifications)
    const [lastRequest, setLastRequest] = useState<UserInfo>({})
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        if (focused) {
            dispatch(FetchNotificationListRequest())
        }
    }, [focused])
    useEffect(() => {
        if (extraInfo) {
            const ref = firestore()
            const requestedUsrname = [...extraInfo.requestedList].pop()
            if (requestedUsrname) {
                ref.collection('users').doc(requestedUsrname).get().then(rs => {
                    setLastRequest(rs.data() || {})
                })
            }
        }
        return () => {
        }
    }, [extraInfo?.requestedList])
    const _onRefresh = () => {
        setLoading(true)
       console.warn("xxx")
    }
    const _onToggleFollow = (index: number) => {
        let temp = [...suggests]
        if (temp[index].followType === 1) {
            dispatch(ToggleFollowUserRequest(temp[index].username || ''))
            temp[index].followType = 2
        } else if (temp[index].followType === 2) {
            if (temp[index].private) {
                dispatch(ToggleSendFollowRequest(temp[index].username || ''))
                temp[index].followType = 3
            } else {
                dispatch(ToggleFollowUserRequest(temp[index].username || ''))
                temp[index].followType = 1
            }
        } else {
            dispatch(ToggleSendFollowRequest(temp[index].username || ''))
            temp[index].followType = 2
        }
        setSuggests(temp)
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: '600'
                }}>Activity</Text>
            </View>
            <FlatList
                data={notifications}
                refreshing={loading}
                onRefresh={_onRefresh}
                ListHeaderComponent={<>
                    {lastRequest.hasOwnProperty('username') &&
                        <TouchableOpacity
                            onPress={() => navigate('ActivityFollowRequests')}
                            style={styles.requestListWrapper}>
                            <View style={{
                                height: 40,
                                width: 40,
                                marginRight: 10,
                            }}>
                                <FastImage
                                    source={{
                                        uri: lastRequest.avatarURL
                                    }}
                                    style={{
                                        height: 40,
                                        width: 40,
                                        borderRadius: 40,
                                        borderColor: '#333',
                                        borderWidth: 0.3
                                    }} />
                                <View style={styles.requestNumber}>
                                    <Text style={{
                                        color: '#fff',
                                        fontWeight: "bold"
                                    }}>{extraInfo?.requestedList.length}</Text>
                                </View>
                            </View>
                            <View>
                                <Text>Follow Request</Text>
                                <Text style={{
                                    color: "#666"
                                }}>Approve or ignore requests</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </>
                }
                renderItem={({ item, index }) => (
                    <NotificationItem {...{ item, key: index }} />
                )}
                keyExtractor={(item, index) => `${index}`}
                ListFooterComponent={
                    <View>
                        <Text style={{
                            margin: 15,
                            fontSize: 16,
                            fontWeight: '500'
                        }}>Suggestions For You</Text>
                        {suggests.map((item, index) => (
                            <SuggestItem key={index}   {...{
                                item, index,
                                onToggleFollow: _onToggleFollow
                            }} />
                        ))}
                        <TouchableOpacity
                            style={{
                                padding: 15
                            }}
                            onPress={() => navigate('DiscoverPeople')}
                        >
                            <Text style={{
                                color: '#318bfb'
                            }}>See All Suggestions</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView >
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        height: 44,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    requestListWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 15,
    },
    requestNumber: {
        position: 'absolute',
        height: 18,
        width: 18,
        borderRadius: 18,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        right: 0
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        paddingHorizontal: 15
    },
    infoWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    requestAvatar: {
        marginRight: 10,
        height: 40,
        width: 40,
        borderRadius: 20,
        borderColor: "#333",
        borderWidth: 0.3
    },
    requestBtnGroups: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    btnRequest: {
        borderColor: '#ddd',
        width: 80,
        height: 24,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnFollow: {
        borderColor: '#ddd',
        width: 100,
        height: 30,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
const SuggestItem = ({ item, index, onToggleFollow }: { onToggleFollow: (index: number) => void, item: ExtraSuggestionUserInfo, index: number }) => {
    const dispatch = useDispatch()
    const _onUnSuggestion = () => {
        dispatch(UnSuggestionRequest(item.username || ''))
    }
    return (
        <TouchableOpacity
            onPress={() => navigate('ProfileX', {
                username: item.username
            })}
            style={styles.requestItem}>
            <View style={styles.infoWrapper}>
                <FastImage
                    style={styles.requestAvatar}
                    source={{
                        uri: item.avatarURL
                    }} />
                <View>
                    <Text style={{
                        fontWeight: '600'
                    }}>{item.username}</Text>
                    <Text style={{
                        fontWeight: '600', color: '#666'
                    }}>{item.fullname}</Text>
                    {item.type !== 4 &&
                        <Text style={{
                            color: '#666'
                        }}>{item.type === 1 ? 'Recent Interacted With You' : (
                            item.type === 2 ? 'Follows You' : (
                                item.type === 3 ? 'Followed by your followings' : ''
                            )
                        )}</Text>
                    }
                </View>
            </View>
            <View style={styles.requestBtnGroups}>
                <TouchableOpacity
                    onPress={() => onToggleFollow(index)}
                    style={{
                        ...styles.btnFollow,
                        ...(item.followType === 1 || item.followType === 3 ? {
                            borderWidth: 1
                        } : {
                                borderWidth: 0,
                                backgroundColor: '#318bfb'
                            }
                        )
                    }}>
                    <Text style={{
                        fontWeight: '600',
                        color: (item.followType === 1 || item.followType === 3)
                            ? '#000' : '#fff'
                    }}>{item.followType === 1 ? 'Following' : (
                        item.followType === 2 ? 'Follow' : 'Requested'
                    )}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={_onUnSuggestion}
                    style={{
                        marginLeft: 15,
                    }}>
                    <Text>✕</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}