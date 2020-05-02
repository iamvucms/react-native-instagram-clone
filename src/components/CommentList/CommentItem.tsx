import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import { ExtraComment } from '../../reducers/commentReducer'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH } from '../../constants'
import { useSelector } from '../../reducers'
import { timestampToString } from '../../utils'
import { useDispatch } from 'react-redux'
import { ToggleLikeCommentRequest } from '../../actions/commentActions'
import ReplyCommentItem from './ReplyCommentItem'

export interface CommentItemProps {
    item: ExtraComment,
    onReply: (a: number, b: string) => void
}

const CommentItem = ({ item, onReply }: CommentItemProps) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user)
    const isLiked = item.likes?.indexOf(user.userInfo?.username || '') !== undefined
        && item.likes?.indexOf(user.userInfo?.username || '') > -1
    const _onToggleLikeComment = () => {
        if (item?.uid) {
            dispatch(ToggleLikeCommentRequest(item.uid))
        }
    }
    const _onReply = () => {
        if (item.uid && item.userId) {
            onReply(item.uid, item.userId)
        }
    }
    return (
        <View>
            <TouchableOpacity style={{
                ...styles.container,
            }}>
                <View style={{
                    flexDirection: 'row',
                    maxWidth: SCREEN_WIDTH - 30 - 30 - 30
                }}>
                    <TouchableOpacity>
                        <Image source={{
                            uri: item.ownUser?.avatarURL
                        }} style={styles.avatar} />
                    </TouchableOpacity>
                    <View style={{
                        marginLeft: 10
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap'
                        }}>
                            <TouchableOpacity>
                                <Text style={{ fontWeight: 'bold' }}>
                                    {item.ownUser?.username} </Text>
                            </TouchableOpacity>
                            <Text>{item.content}</Text>
                        </View>
                        <View>
                            <View style={styles.infoWrapper}>
                                <Text style={{
                                    color: '#666'
                                }}>{timestampToString(item.create_at?.toMillis() || 0)}</Text>
                                {item.likes && item.likes.length > 0
                                    && <Text style={{
                                        color: '#666',
                                        fontWeight: '600',
                                    }}>{item.likes.length} {item.likes.length < 2 ? 'like' : 'likes'}
                                    </Text>
                                }
                                <TouchableOpacity
                                    onPress={_onReply}
                                >
                                    <Text style={{
                                        color: '#666',
                                        fontWeight: '600',
                                    }}>Reply</Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                    </View>

                </View>
                <TouchableOpacity
                    onPress={_onToggleLikeComment}
                    style={styles.btnLove}>
                    <Icons name={isLiked ? "heart" : "heart-outline"} color={isLiked ? "red" : "#666"} size={20} />
                </TouchableOpacity>
            </TouchableOpacity>
            <View>
                {item.replies && item.replies.map((reply, index) => (
                    <ReplyCommentItem
                        onReply={onReply}
                        commentId={item.uid || 0}
                        key={index}
                        item={reply} />
                ))}
            </View>
        </View>
    )
}

export default React.memo(CommentItem)

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        minHeight: 44,
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    avatar: {
        height: 30,
        width: 30,
        borderRadius: 30,
        borderColor: '#333',
        borderWidth: 0.3
    },
    btnLove: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoWrapper: {
        marginVertical: 2,
        flexDirection: 'row',
        width: 160,
        justifyContent: 'space-between'
    }
})
