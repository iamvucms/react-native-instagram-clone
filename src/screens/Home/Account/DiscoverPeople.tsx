import React, { useEffect, useState } from 'react'
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { FetchExtraInfoRequest, ToggleFollowUserRequest, ToggleSendFollowRequest, UnSuggestionRequest } from '../../../actions/userActions'
import NavigationBar from '../../../components/NavigationBar'
import { ExtraSuggestionUserInfo, useSuggestion } from '../../../hooks/useSuggestion'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'


const DiscoverPeople = () => {
    const dispatch = useDispatch()
    const extraInfo = useSelector(state => state.user.extraInfo)
    const [suggests, setSuggests] = useSuggestion()
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        dispatch(FetchExtraInfoRequest())
    }, [])
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
    const _onRefresh = async () => {
        setLoading(true)
        await dispatch(FetchExtraInfoRequest())
        setLoading(false)
    }
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="Discover People"
                callback={goBack}
            />
            <FlatList
                refreshing={loading}
                onRefresh={_onRefresh}
                data={suggests}
                renderItem={({ item, index }) =>
                    <>
                        {index === 0 &&
                            <Text style={{
                                margin: 15,
                                fontSize: 16,
                                fontWeight: '500'
                            }}>All Suggestions</Text>
                        }
                        <SuggestItem   {...{
                            item, index,
                            onToggleFollow: _onToggleFollow
                        }} />
                    </>
                }
                keyExtractor={(item, index) => `${index}`}
            />
        </SafeAreaView>
    )
}

export default DiscoverPeople

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
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
                <Image
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