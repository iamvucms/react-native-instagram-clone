import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { navigation, goBack, navigate } from '../../navigations/rootNavigation'
import { SCREEN_WIDTH } from '../../constants'
import { SuperRootStackParamList } from '../../navigations'
import { RouteProp } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { UnfollowRequest, AddPostArchiveRequest, RemovePostArchiveRequest } from '../../actions/userActions'
import { store } from '../../store'
import { UpdatePostRequest } from '../../actions/postActions'
import { sharePost } from '../../utils'
import { firestore } from 'firebase'
import { Post } from '../../reducers/postReducer'
import { useSelector } from '../../reducers'
import { PostArchive } from '../../reducers/userReducer'
type PostOptionsRouteProp = RouteProp<SuperRootStackParamList, 'PostOptions'>
type PostOptionsProps = {
    route: PostOptionsRouteProp
}
const PostOptions = ({ route }: PostOptionsProps) => {
    const user = store.getState().user.user.userInfo
    const item = route.params.item
    const setPost = route.params.setPost
    const archivePosts = useSelector(state => state.user.archive?.posts || [])
    const post = setPost ? item : useSelector(state => state.postList).filter(post => post.uid === item.uid)[0] || {}
    const dispatch = useDispatch()
    const _onUnfollow = () => {
        dispatch(UnfollowRequest(post.ownUser?.username || ``))
    }
    const _toggleNotification = async () => {
        const rq = await firestore().collection('posts')
            .doc(`${post.uid}`).get()
        const onlinePost: Post = rq.data() || {}
        const notifications: string[] = onlinePost.notificationUsers || []
        const index = notifications.indexOf(user?.username || '')
        if (index > -1) {
            notifications.splice(index, 1)
        } else notifications.push(user?.username || '')
        if (setPost) {
            rq.ref.update({
                notificationUsers: [...notifications]
            })
            const temp = { ...post }
            temp.notificationUsers = [...notifications]
            setPost(temp)
        } else dispatch(UpdatePostRequest(post.uid || 0, {
            notificationUsers: [...notifications]
        }))
        goBack()
    }
    const _onArchive = async () => {
        const postArchive: PostArchive = {
            uid: item.uid as number,
            create_at: new Date().getTime(),
            previewUri: (item.source || [])[0]?.uri as string,
            multiple: !!item.source && item.source.length > 1
        }
        await dispatch(AddPostArchiveRequest([postArchive]))
        goBack()
    }
    const _onRemoveBoth = async () => {
        navigate('AccountIndex')
        await dispatch(RemovePostArchiveRequest(item.uid as number))
    }
    const _onRemoveArchive = async () => {
        navigate('AccountIndex')
        await dispatch(RemovePostArchiveRequest(item.uid as number))
    }
    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => navigation.goBack()}
            style={{
                ...styles.container,
            }}>
            <View style={styles.mainOptions}>
                {!!archivePosts.find(x => x.uid === item.uid) ? (
                    <>
                        <View style={{ backgroundColor: "#000" }}>
                            <TouchableOpacity
                                onPress={_onRemoveArchive}
                                activeOpacity={0.8}
                                style={styles.optionItem}>
                                <Text>Show on Profile</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ backgroundColor: "#000" }}>
                            <TouchableOpacity
                                onPress={_onRemoveBoth}
                                activeOpacity={0.8}
                                style={styles.optionItem}>
                                <Text>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                        <>
                            {user?.username !== item.userId &&
                                <View style={{ backgroundColor: "#000" }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.optionItem}>
                                        <Text>Report...</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            <View style={{ backgroundColor: "#000" }}>
                                <TouchableOpacity
                                    onPress={_toggleNotification}
                                    activeOpacity={0.8}
                                    style={styles.optionItem}>
                                    <Text>Turn {(post.notificationUsers
                                        && post.notificationUsers?.indexOf(user?.username || '')
                                        > -1) ? 'Off' : 'On'
                                    } Post Notifications</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ backgroundColor: "#000" }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        Clipboard.setString('https://instagram.com/' + item.uid)
                                    }}
                                    activeOpacity={0.8}
                                    style={styles.optionItem}>
                                    <Text>Copy Link</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ backgroundColor: "#000" }}>
                                <TouchableOpacity
                                    onPress={() => sharePost(post)}
                                    activeOpacity={0.8}
                                    style={styles.optionItem}>
                                    <Text>Share to...</Text>
                                </TouchableOpacity>
                            </View>
                            {user?.username === item.userId &&
                                <View style={{ backgroundColor: "#000" }}>
                                    <TouchableOpacity
                                        onPress={_onArchive}
                                        activeOpacity={0.8}
                                        style={styles.optionItem}>
                                        <Text>Archive</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            {user?.username !== item.userId &&
                                <View style={{ backgroundColor: "#000" }}>
                                    <TouchableOpacity
                                        onPress={_onUnfollow}
                                        activeOpacity={0.8}
                                        style={styles.optionItem}>
                                        <Text>Unfollow</Text>
                                    </TouchableOpacity>
                                </View>
                            }

                            {user?.username !== item.userId &&
                                <View style={{ backgroundColor: "#000" }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.optionItem}>
                                        <Text>Mute</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        </>
                    )}
            </View>
        </TouchableOpacity>
    )
}

export default PostOptions

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: "100%",
        justifyContent: "center",
        alignItems: 'center'
    },
    mainOptions: {
        width: SCREEN_WIDTH * 0.6,
        borderRadius: 5,
        padding: 5,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 20,

        elevation: 7,
    },
    optionItem: {
        backgroundColor: '#fff',
        height: 44,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 10
    }
})
