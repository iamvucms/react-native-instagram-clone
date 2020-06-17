import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity } from 'react-native'
import { MixedProfileX, UserItem } from './ProfileXMutual'
import { useDispatch } from 'react-redux'
import { ToggleFollowUserRequest, ToggleSendFollowRequest } from '../../../../actions/userActions'
import { ProfileX } from '../../../../reducers/profileXReducer'
import { firestore } from 'firebase'
import { useSelector } from '../../../../reducers'
import { SCREEN_WIDTH } from '../../../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
export interface ProfileXMutualProps {
    userX: ProfileX
}
const ProfileXFollower = ({ userX }: ProfileXMutualProps) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.userInfo)
    const [query, setQuery] = useState<string>('')
    const [followerUsers, setFollowerUsers] = useState<MixedProfileX[]>([])
    const [filteredFollowerUsers, setFiltredFollowerUsers] = useState<MixedProfileX[]>([])
    const ref = useRef<{
        queryTimeout: NodeJS.Timeout
    }>({ queryTimeout: setTimeout(() => { }, 0) })
    useEffect(() => {
        if (userX.followers) {
            const followers = [...userX.followers]
            const index = followers.indexOf(user?.username || '')
            if (index > -1) {
                followers.splice(index, 1)
            }
            const ref = firestore()
            const fetchFollowerUserTasks: Promise<MixedProfileX>[] = followers
                .map(async usr => {
                    const rq = await ref.collection('users').doc(usr).get()
                    return rq.data() || {}
                })
            Promise.all(fetchFollowerUserTasks).then(result => {
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
                setFollowerUsers([...result])
                setFiltredFollowerUsers([...result])
            })
        }
    }, [])
    useEffect(() => {
        clearTimeout(ref.current.queryTimeout)
        if (query.length > 0) {
            ref.current.queryTimeout = setTimeout(() => {
                const followers = [...followerUsers]
                const temp = followers.filter(usr => (usr.username || '')
                    .indexOf(query) > -1)
                setFiltredFollowerUsers(temp)
            }, 300)
        } else setFiltredFollowerUsers([...followerUsers])
    }, [query])
    const _onToggleFollow = (index: number) => {
        let temp = [...followerUsers]
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
        setFollowerUsers(temp)
    }
    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <View style={styles.searchWrapper}>
                        <View style={styles.centerBtn}>
                            <Icon name="magnify" size={20} color="#666" />
                        </View>
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            autoCapitalize="none"
                            placeholder="Search"
                            style={styles.textInput}
                        />
                    </View>
                }
                data={filteredFollowerUsers}
                renderItem={({ item, index }) => (
                    <UserItem
                        index={index}
                        onToggleFollow={_onToggleFollow}
                        userX={item} />
                )}
                keyExtractor={(item, index) => `${index}`}
            />
        </View>
    )
}

export default ProfileXFollower

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        width: "100%",
        height: '100%'
    },
    searchWrapper: {
        height: 44,
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: "#318bfb",
        marginVertical: 15
    },
    centerBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        width: SCREEN_WIDTH - 30 - 44,
        height: '100%'
    }
})
