import React, { useState, useEffect, SetStateAction } from 'react'
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
    const [content, setContent] = useState<JSX.Element[]>([])
    const user = useSelector(state => state.user.user)
    const isLiked = item.likes && item.likes?.indexOf(user.userInfo?.username || '') > -1
    const _onChangePageHandler = (page: number) => {
        setCurrentPage(page)
    }
    useEffect(() => {
        setContent(createFilterContent(item.content || ''))
    }, [item])
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
                    {item.source && item.source.length > 1 && <CirclePagination
                        maxPage={item.source?.length || 0}
                        currentPage={currentPage}
                    />}
                    <TouchableOpacity>
                        <Icons name="bookmark-outline" size={24} />
                    </TouchableOpacity>
                </View>
                {item.likes && <Text style={{
                    fontWeight: "bold",
                    marginVertical: 5,
                }}>{item.likes.length >= 1000 ?
                    (Math.round(item.likes.length / 1000) + 'k')
                    : item.likes.length} {item.likes.length === 1 ? 'like' : 'likes'}</Text>}

                <View style={{
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontWeight: "600",
                        marginVertical: 5,
                    }}>{item.ownUser.username} </Text>
                    {content.map(Jsx => Jsx)}
                </View>
                {item.comments && item.comments.length > 0 && < TouchableOpacity style={styles.btnViewCmt}>
                    <Text style={{
                        color: "#666",
                    }}>
                        View all {item.comments.length} comments
                    </Text>
                </TouchableOpacity>}
                <View>

                </View>
            </View>
        </View >
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
    },
    btnViewCmt: {
        marginVertical: 10
    }
})
function createFilterContent(content: string): JSX.Element[] {
    const matchedGroups: {
        match: string,
        index: number
    }[] = []
    content?.replace(/@[a-zA-Z0-9._]{4,}/g,
        (match, index) => {
            matchedGroups.push({ match, index })
            return match
        })
    let splitedContent: JSX.Element[] = (content?.split('') || [])
        .map((c, i) => <Text key={i}>{c}</Text>)
    let i = 0
    matchedGroups.map((match) => {
        splitedContent.splice(match.index - i + 1, match.match.length - 1)
        splitedContent[match.index - i] =
            <TouchableOpacity key={match.index - i}>
                <Text style={{
                    color: '#318bfb',
                    fontWeight: '500'
                }}>{match.match}</Text>
            </TouchableOpacity>
        i += match.match.length - 1
    })
    return splitedContent
}
