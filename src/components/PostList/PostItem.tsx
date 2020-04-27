import React, { useState } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import PhotoShower from './PhotoShower'
import { ExtraPost } from '../../reducers/postReducer'
import { useSelector } from '../../reducers'
import CirclePagination from '../CirclePagination'

export interface PostItemProps {
    item: ExtraPost
}
const PostItem = ({ item }: PostItemProps) => {
    const [currentPage, setCurrentPage] = useState<number>(1)
    const user = useSelector(state => state.user.user)
    const isLiked = item.likes && item.likes?.indexOf(user.userInfo?.username || '') > -1
    const _onChangePageHandler = (page: number) => {
        setCurrentPage(page)
    }
    const matchedGroups: {
        match: string,
        index: number
    }[] = []
    item.content?.replace(/@[a-zA-Z0-9._]{4,}/g,
        (match, index) => {
            matchedGroups.push({ match, index })
            return ''
        })
    let splitedContent: JSX.Element[] = (item.content?.split('') || [])
        .map(c => <Text>{c}</Text>)
    const completedContent = splitedContent?.map((c, index) => {
        matchedGroups.map(match => {
            if (index === match.index) {
                splitedContent[index] = <TouchableOpacity>
                    <Text style={{
                        color: '#318bfb'
                    }}>{match.match}</Text>
                </TouchableOpacity>
                splitedContent.splice(index + 1, match.match.length - 1)
            }
        })
        return c
    })
    console.warn(completedContent)
    return (
        <View style={styles.container}>
            <View style={styles.postHeader}>
                <View
                    style={styles.infoWrapper}>
                    <TouchableOpacity>
                        <Image style={styles.avatar}
                            source={{ uri: item.ownUser.avatarURL }} />
                    </TouchableOpacity>
                    <Text style={{
                        fontWeight: '600'
                    }}>{item.ownUser.username}</Text>
                </View>
                <TouchableOpacity>
                    <Icons name="dots-vertical" size={24} />
                </TouchableOpacity>
            </View>
            <View style={styles.body}>
                <PhotoShower onChangePage={_onChangePageHandler} sources={item.source} />
            </View>
            <View style={styles.reactionsWrapper}>
                <View style={styles.reactions}>
                    <View style={styles.lReactions}>
                        <TouchableOpacity>
                            <Icons name={isLiked
                                ? "heart" : "heart-outline"}
                                size={24}
                                color={
                                    isLiked ? 'red' : '#000'
                                } />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icons name="comment-outline" size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icons name="share-variant" size={24} />
                        </TouchableOpacity>
                    </View>
                    <CirclePagination
                        maxPage={item.source?.length || 0}
                        currentPage={currentPage}
                    />
                    <TouchableOpacity>
                        <Icons name="bookmark-outline" size={24} />
                    </TouchableOpacity>
                </View>
                {item.likes && <Text style={{
                    fontWeight: "bold",
                    marginVertical: 5,
                }}>{item.likes.length} likes</Text>}
                <Text style={{
                    fontWeight: "600",
                    marginVertical: 5,
                }}>{item.ownUser.username} <Text style={{
                    fontWeight: '400'
                }}>
                        {completedContent.map(jsx => jsx)}
                    </Text>
                </Text>
            </View>
        </View>
    )
}

export default React.memo(PostItem)

const styles = StyleSheet.create({
    container: {

    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderTopColor: '#ddd',
        borderTopWidth: 0.5,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5,
    },
    infoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    body: {

    },
    avatar: {
        borderColor: '#ddd',
        borderWidth: 0.3,
        height: 30,
        width: 30,
        borderRadius: 30,
        marginRight: 10,
    },
    reactionsWrapper: {
        padding: 10
    },
    reactions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    lReactions: {
        flexDirection: 'row',
        width: 24.3 * 3 + 15,
        justifyContent: 'space-between'
    }
})
