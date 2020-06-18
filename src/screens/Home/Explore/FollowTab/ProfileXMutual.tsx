import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import { ProfileX } from '../../../../reducers/profileXReducer'
import { firestore } from 'firebase'
import { store } from '../../../../store'
import { useSelector } from '../../../../reducers'
import FastImage from 'react-native-fast-image'
import { push, navigate } from '../../../../navigations/rootNavigation'
import { useDispatch } from 'react-redux'
import { ToggleFollowUserRequest, ToggleSendFollowRequest } from '../../../../actions/userActions'
import { useSuggestion, ExtraSuggestionUserInfo } from '../../../../hooks/useSuggestion'
export interface ProfileXMutualProps {
    userX: ProfileX
}
export type MixedProfileX = ProfileX & {
    followType?: 1 | 2 | 3,
}
const ProfileXMutual = ({ userX }: ProfileXMutualProps) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.userInfo)
    const [mutualUsers, setMutualUsers] = useState<MixedProfileX[]>([])
    const [mySuggestion, setMySuggestion] = useSuggestion(20)
    useEffect(() => {
        console.warn("reload")
        if (userX.mutualFollowings) {
            const mutualFollowings = [...userX.mutualFollowings]
            const ref = firestore()
            const fetchMutualUserTasks: Promise<MixedProfileX>[] = mutualFollowings
                .map(async usr => {
                    const rq = await ref.collection('users').doc(usr).get()
                    return rq.data() || {}
                })
            Promise.all(fetchMutualUserTasks).then(result => {
                result = result.map(usr => {
                    if ((usr.requestedList || []).indexOf(user?.username || '') > -1) {
                        usr.followType = 3
                        return usr
                    }
                    if ((user?.followings || []).indexOf(usr.username || '') > -1) {
                        usr.followType = 1
                    }
                    else usr.followType = 2
                    return usr
                })
                setMutualUsers([...result])
            })
        }
    }, [])
    const _onToggleFollow = (index: number) => {
        let temp = [...mutualUsers]
        if (temp[index].followType === 1) {
            dispatch(ToggleFollowUserRequest(temp[index].username || ''))
            temp[index].followType = 2
        } else if (temp[index].followType === 2) {
            if (temp[index].privacySetting?.accountPrivacy?.private) {
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
        setMutualUsers(temp)
    }
    const _onToggleFollowSuggestion = (index: number) => {
        let temp = [...mySuggestion]
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
        setMySuggestion(temp)
    }
    return (
        <View style={styles.container}>
            <Text style={{
                margin: 15,
                fontSize: 16,
                fontWeight: '500'
            }}>Followed by you</Text>
            <FlatList data={mutualUsers}
                renderItem={({ item, index }) => (
                    <UserItem
                        index={index}
                        onToggleFollow={_onToggleFollow}
                        userX={item} />
                )}
                keyExtractor={(item, index) => `${index}`}
                ListFooterComponent={
                    <FlatList
                        ListHeaderComponent={
                            <Text style={{
                                margin: 15,
                                fontSize: 16,
                                fontWeight: '500'
                            }}>Suggestions</Text>
                        }
                        data={mySuggestion}
                        renderItem={({ item, index }) => (
                            <UserItem
                                index={index}
                                onToggleFollow={_onToggleFollowSuggestion}
                                userX={item} />
                        )}
                        keyExtractor={(item, index) => `${index}`}
                        ListFooterComponent={
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
                        }
                    />
                }
            />
        </View>
    )
}

export default React.memo(ProfileXMutual)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff'
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        paddingHorizontal: 15
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 64,
        borderWidth: 0.3,
        borderColor: '#333',
    },
    btnFollow: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        borderColor: '#ddd',
        borderRadius: 5,
        borderWidth: 1
    },
})
interface UserItemProps {
    userX: MixedProfileX | ExtraSuggestionUserInfo,
    onToggleFollow: (index: number) => void,
    index: number,
    myUsername?: string
}
export const UserItem = ({ userX, index, onToggleFollow, myUsername }: UserItemProps) => {
    return (
        <TouchableOpacity
            onPress={() => {
                push('ProfileX', {
                    username: userX.username
                })
            }}
            style={styles.userItem}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <FastImage
                    style={styles.avatar}
                    source={{
                        uri: userX.avatarURL
                    }} />
                <View style={{
                    marginLeft: 10
                }}>
                    <Text style={{
                        fontWeight: "600"
                    }}>{userX.username}</Text>
                    <Text style={{
                        fontWeight: '500',
                        color: "#666"
                    }}>{userX.fullname}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={myUsername !== userX.username
                    ? onToggleFollow.bind(null, index) : () => { }}
                style={{
                    ...styles.btnFollow,
                    ...(userX.followType === 1 || userX.followType === 3 ? {} : {
                        borderWidth: 0,
                        backgroundColor: '#318bfb'
                    })
                }}>
                <Text style={{
                    fontWeight: '600',
                    ...(userX.followType === 1 || userX.followType === 3 ? {} : {
                        color: '#fff'
                    })
                }}>
                    {userX.followType === 1 ? 'Following' : (
                        userX.followType === 2 ? 'Follow' : 'Requested'
                    )}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}
