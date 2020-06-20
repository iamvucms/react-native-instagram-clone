import { firestore } from 'firebase'
import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { FetchRecentSearchRequest, RemoveRecentSearchRequest, PushRecentSearchRequest } from '../../actions/userActions'
import { navigate } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'
import { HashTag, SearchItem } from '../../reducers/userReducer'
import { MixedProfileX } from '../../screens/Home/Explore/FollowTab/ProfileXMutual'
import { MapBoxAddress, searchLocation } from '../../utils'
import { STATUS_BAR_HEIGHT, SCREEN_HEIGHT } from '../../constants'
import { getTabBarHeight } from '../BottomTabBar'

export interface TopResult {
    resultData: (MixedProfileX | HashTag | MapBoxAddress)[],
    recentList: (MixedProfileX | HashTag | MapBoxAddress)[],
    searching?: boolean
}
const TopResult = ({ resultData, recentList, searching }: TopResult) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.userInfo)
    const myUsername = user?.username || ''
    const history = useSelector(state =>
        state.user.user.userInfo?.searchRecent) || []
    useEffect(() => {
        dispatch(FetchRecentSearchRequest())
    }, [])


    return (
        <View style={styles.container}>

            {!searching &&
                <FlatList
                    style={listStyle}
                    ListHeaderComponent={
                        <View>
                            <Text style={{
                                margin: 15,
                                fontWeight: '700',
                                fontSize: 16
                            }}>Recent</Text>
                        </View>}
                    data={recentList}
                    renderItem={({ item, index }) =>
                        <ResultItem showRemoveBtn={true}
                            searchItem={history[index]}
                            item={item}
                            key={index} />
                    }
                    keyExtractor={(item, index) => `${index}`}
                />
            }
            {searching &&
                <FlatList
                    style={listStyle}
                    ListHeaderComponent={
                        <View>
                            <Text style={{
                                margin: 15,
                                fontWeight: '700',
                                fontSize: 16
                            }}>Results</Text>
                        </View>}
                    data={resultData}
                    renderItem={({ item, index }) =>
                        <ResultItem item={item} key={index} />
                    }
                    keyExtractor={(item, index) => `${index}`}
                />
            }
        </View>
    )
}

export default React.memo(TopResult)
export const listStyle = {
    maxHeight: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - getTabBarHeight() - 100
}
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
    },
    centerBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
export interface ResultItemProps {
    item: MixedProfileX & HashTag | MapBoxAddress,
    showRemoveBtn?: boolean,
    searchItem?: SearchItem
}
export const ResultItem = React.memo(
    ({ showRemoveBtn, searchItem, item }: ResultItemProps) => {
        const dispatch = useDispatch()
        const _onViewResultDetail = (item: MixedProfileX & HashTag | MapBoxAddress) => {
            if (item.hasOwnProperty('username')) {
                navigate('ProfileX', {
                    username: (item as MixedProfileX).username
                })
                dispatch(PushRecentSearchRequest({
                    type: 1,
                    username: (item as MixedProfileX).username
                }))
            } else if (item.hasOwnProperty('place_name')) {
                navigate('Location', {
                    address: item
                })
                dispatch(PushRecentSearchRequest({
                    type: 3,
                    address: (item as MapBoxAddress).id
                }))
            } else {
                navigate('Hashtag', {
                    hashtag: (item as HashTag).name
                })
                dispatch(PushRecentSearchRequest({
                    type: 2,
                    hashtag: (item as HashTag).name
                }))
            }
        }
        const _onRemoveRecent = () => {
            if (searchItem) dispatch(RemoveRecentSearchRequest(searchItem))
        }
        return (
            <TouchableOpacity
                onPress={() =>
                    _onViewResultDetail(item)
                } style={styles.userItem}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    {item.hasOwnProperty('username') ? (
                        <FastImage style={styles.avatar}
                            source={{
                                uri: (item as MixedProfileX).avatarURL,
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
                                }}>{(item as MixedProfileX).username}</Text>
                                <Text style={{
                                    color: "#666",
                                    fontWeight: '500'
                                }}>{(item as MixedProfileX).fullname}<Text>
                                        {(item as MixedProfileX).followType === 1 ? ' • Following' : (
                                            (item as MixedProfileX).followType === 3 ? ' • Requested' : ''
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
                {showRemoveBtn && <TouchableOpacity
                    onPress={_onRemoveRecent}
                    style={styles.centerBtn}>
                    <Text>✕</Text>
                </TouchableOpacity>}

            </TouchableOpacity>
        )
    }
)