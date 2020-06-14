import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { ExtraNotification, notificationTypes } from '../../reducers/notificationReducer'
import FastImage from 'react-native-fast-image'
import { SCREEN_WIDTH } from '../../constants'
import { navigate } from '../../navigations/rootNavigation'
import { timestampToString } from '../../utils'

export interface NotificationItemProps {
    item: ExtraNotification
}
const NotificationItem = ({ item }: NotificationItemProps) => {
    const froms = [...(item.froms || [])]
    let content = ''
    switch (item.type) {
        case notificationTypes.LIKE_MY_COMMENT:
            content = 'liked your comment.'
            break
        case notificationTypes.LIKE_MY_POST:
            content = 'liked your photo.'
            break
        case notificationTypes.COMMENT_MY_POST:
            content = `commented: ${item.commentInfo?.content}`
            break
        case notificationTypes.FOLLOW_ME:
            content = `started following you.`
            break
        case notificationTypes.LIKE_MY_REPLY:
            content = `like your comment.`
            break
        case notificationTypes.REPLY_MY_COMMENT:
            content = `commented: ${item.replyInfo?.content}`
            break
        case notificationTypes.SOMEONE_POSTS:
            content = `${item.postInfo?.userId} posted new photo.`
            break
        case notificationTypes.SOMEONE_LIKE_SOMEONE_POST:
            content = `liked your following post.`
            break
        case notificationTypes.SOMEONE_COMMENT_SOMEONE_POST:
            content = `commented: ${item.commentInfo?.content}`
            break
    }
    const _onViewNotification = () => {
        switch (item.type) {
            case notificationTypes.LIKE_MY_COMMENT:
                navigate('Comment', {
                    postId: item.postId,
                    showFullPost: true,
                })
                break
            case notificationTypes.LIKE_MY_POST:
                navigate('PostDetail', {
                    postId: item.postId
                })
                break
            case notificationTypes.COMMENT_MY_POST:
                navigate('Comment', {
                    postId: item.postId,
                    showFullPost: true,
                })
                break
            case notificationTypes.FOLLOW_ME:
                navigate('ActiviyFollow', { type: 1 })
                break
            case notificationTypes.LIKE_MY_REPLY:
                navigate('Comment', {
                    postId: item.postId
                })
                break
            case notificationTypes.REPLY_MY_COMMENT:
                navigate('Comment', {
                    postId: item.postId
                })
                break
            case notificationTypes.SOMEONE_POSTS:
                navigate('PostDetail', {
                    postId: item.postId
                })
                break
            case notificationTypes.SOMEONE_LIKE_SOMEONE_POST:
                navigate('PostDetail', {
                    postId: item.postId
                })
                break
            case notificationTypes.SOMEONE_COMMENT_SOMEONE_POST:
                navigate('Comment', {
                    postId: item.postId,
                    showFullPost: true,
                })
                break
        }
    }
    return (
        <TouchableOpacity
            onPress={_onViewNotification}
            style={styles.container}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <View style={styles.fromPreviewWrapper}>
                    {item.previewFroms && <>
                        {item.previewFroms.length > 1 && (
                            <>
                                <FastImage style={styles.avatar}
                                    source={{ uri: item.previewFroms[1].avatarURL }}
                                />
                                <FastImage style={{
                                    ...styles.avatar,
                                    transform: [{
                                        translateX: 10
                                    },
                                    {
                                        translateY: -30
                                    }]
                                }}
                                    source={{ uri: item.previewFroms[0].avatarURL }}
                                />
                            </>
                        )}
                        {item.previewFroms.length === 1 && (
                            <>
                                <FastImage style={{
                                    ...styles.avatar,
                                    height: 50,
                                    width: 50
                                }}
                                    source={{ uri: item.previewFroms[0].avatarURL }}
                                />

                            </>
                        )}
                    </>}
                </View>
                <View style={{
                    ...styles.contentWrapper,
                    width: SCREEN_WIDTH - 50 - 30 - (item.postInfo ? 50 : 0),
                }}>
                    <Text numberOfLines={3}>
                        <Text style={{
                            fontWeight: '600'
                        }}>{froms.splice(0, 2).join(', ')} </Text>
                        {froms.length > 0 &&
                            <Text> and {froms.length} {froms.length > 1 ? 'others' : 'other'} </Text>
                        }
                        <Text>{content} </Text>
                        {item.create_at &&
                            <Text style={{
                                color: '#666'
                            }}>{timestampToString(item.create_at.toMillis())}</Text>
                        }

                    </Text>
                </View>
            </View>
            {item.postInfo && item.postInfo.source &&
                <TouchableOpacity
                    onPress={() => navigate('PostDetail', {
                        postId: item.postId
                    })}
                    style={{
                        borderColor: '#ddd',
                        borderWidth: 0.3
                    }}>
                    <FastImage source={{
                        uri: item.postInfo.source[0].uri
                    }}
                        style={{
                            width: 50,
                            height: 50,
                        }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>}
        </TouchableOpacity>
    )
}

export default NotificationItem

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        flexDirection: 'row',
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    fromPreviewWrapper: {
        height: 50,
        width: 50
    },
    avatar: {
        height: 38,
        width: 38,
        borderRadius: 38,
        borderColor: '#fff',
        borderWidth: 2
    },
    contentWrapper: {

        paddingHorizontal: 10
    }
})
