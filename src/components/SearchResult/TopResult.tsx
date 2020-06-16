import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { UserInfo, HashTag } from '../../reducers/userReducer'
import { useSelector } from '../../reducers'
import { firestore } from 'firebase'
import FastImage from 'react-native-fast-image'
import { MapBoxAddress, searchLocation } from '../../utils'
import { useDispatch } from 'react-redux'
import { FetchRecentSearchRequest } from '../../actions/userActions'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { navigate } from '../../navigations/rootNavigation'
type MixedUserInfo = UserInfo & {
    followType?: 1 | 2 | 3
}
const TopResult = () => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.userInfo)
    const myUsername = user?.username || ''
    const history = useSelector(state =>
        state.user.user.userInfo?.searchRecent) || []
    const [recentList, setRecentList] = useState<(MixedUserInfo | MapBoxAddress | HashTag)[]>([])

    useEffect(() => {
        dispatch(FetchRecentSearchRequest())
    }, [])
    useEffect(() => {
        if (history) {
            const ref = firestore()
            const fetchRecentTasks: Promise<MixedUserInfo | MapBoxAddress | HashTag>[] = history.map(async item => {
                let rq = null
                let data: MixedUserInfo | MapBoxAddress | HashTag = {}
                if (item.type === 1) {
                    rq = await ref.collection('users').doc(item.username).get()
                    data = rq.data() || {}
                } else if (item.type === 2) {
                    rq = await ref.collection('hashtags').doc(`${item.hashtag}`).get()
                    data = rq.data() || {}
                } else {
                    const rs = await searchLocation(item.address || '')
                    if (rs.length > 0) {
                        data = rs[0]
                    }
                }
                return data
            })
            Promise.all(fetchRecentTasks).then(result => {
                result = result.map(item => {
                    if (item.hasOwnProperty('username')) {
                        item = item as MixedUserInfo
                        if (item.requestedList && item.requestedList.indexOf(myUsername) > -1) {
                            item.followType = 3
                            return item
                        }
                        if (user?.followings && user.followings.indexOf(item.username || '') > -1) {
                            item.followType = 1
                        }
                        else item.followType = 2
                        return item
                    } else return item
                })
                setRecentList(result)
            })
        }
    }, [history])
    const _onViewResultDetail = (item: MixedUserInfo | MapBoxAddress | HashTag) => {
        if (item.hasOwnProperty('username')) {
            navigate('ProfileX', {
                username: (item as MixedUserInfo).username
            })
        } else if (item.hasOwnProperty('place_name')) {
            navigate('Location', {
                location: item
            })
        } else {
            navigate('Hashtag', {
                hashtag: item
            })

        }
    }
    return (
        <View style={styles.container}>
            <View>
                <Text style={{
                    margin: 15,
                    fontWeight: '700',
                    fontSize: 16
                }}>Recent</Text>
            </View>
            {recentList.map((item, index) => (
                <TouchableOpacity
                    onPress={() =>
                        _onViewResultDetail(item)
                    }
                    key={index} style={styles.userItem}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        {item.hasOwnProperty('username') ? (
                            <FastImage style={styles.avatar}
                                source={{
                                    uri: (item as MixedUserInfo).avatarURL,
                                }}
                            />
                        ) : (
                                <>
                                    {item.hasOwnProperty('place_name') ? (
                                        <View style={styles.circle}>
                                            <Icon name="map-marker-outline" size={30} />
                                        </View>
                                    ) : (
                                            <View style={styles.circle}>
                                                <Text style={{
                                                    fontSize: 30
                                                }}>#</Text>
                                            </View>
                                        )}
                                </>
                            )}
                        <View style={{ marginLeft: 10 }}>
                            {item.hasOwnProperty('username') ? (
                                <>
                                    <Text style={{
                                        fontWeight: '600'
                                    }}>{(item as MixedUserInfo).username}</Text>
                                    <Text style={{
                                        color: "#666",
                                        fontWeight: '500'
                                    }}>{(item as MixedUserInfo).fullname}<Text>
                                            {(item as MixedUserInfo).followType === 1 ? ' • Following' : (
                                                (item as MixedUserInfo).followType === 3 ? ' • Requested' : ''
                                            )
                                            }
                                        </Text>
                                    </Text>
                                </>
                            ) : (
                                    <>
                                        {item.hasOwnProperty('place_name') ? (
                                            <>
                                                <Text style={{
                                                    fontWeight: '600'
                                                }}>{(item as MapBoxAddress).place_name}</Text>
                                            </>
                                        ) : (
                                                <>
                                                    <Text style={{
                                                        fontWeight: '600'
                                                    }}>{(item as HashTag).name}</Text>
                                                    <Text style={{
                                                        color: "#666",
                                                        fontWeight: '500'
                                                    }}>{(item as HashTag).sources && (item as HashTag).sources?.length} posts
                                                    </Text>
                                                </>
                                            )}
                                    </>
                                )}
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default TopResult

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginVertical: 5
    },
    avatar: {
        height: 64,
        width: 64,
        borderRadius: 64,
        borderWidth: 0.3,
        borderColor: '#333'
    },
    circle: {
        height: 64,
        width: 64,
        borderRadius: 64,
        borderWidth: 1,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
