import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Animated, FlatList, View } from 'react-native'
import CommentItem from './CommentItem'
import PostContentItem from './PostContentItem'
import { useSelector } from '../../reducers'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import { useDispatch } from 'react-redux'
import {
    FetchCommentListRequest,
    ResetCommentList,
    LoadMoreCommentListRequest
} from '../../actions/commentActions'
export interface CommentListProps {
    postId: number
}
const index = ({ postId }: CommentListProps) => {
    const dispatch = useDispatch()
    const comment = useSelector(state => state.comment)
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [loadingMore, setLoadingMore] = useState<boolean>(false)
    const ref = useRef<{
        allowLoadMore: boolean
    }>({ allowLoadMore: false })
    const scrollRef = useRef<FlatList>(null)
    useEffect(() => {
        (async () => {
            ref.current.allowLoadMore = false
            setRefreshing(true)
            await dispatch(ResetCommentList())
            await dispatch(FetchCommentListRequest(postId))
            setRefreshing(false)
            ref.current.allowLoadMore = true
        })()

        return () => {
        }
    }, [])
    useEffect(() => {
        if (comment.scrollDown) {
            ref.current.allowLoadMore = false
            scrollRef.current?.scrollToEnd()
            setTimeout(() => {
                ref.current.allowLoadMore = true
            }, 1000);
        }
    }, [comment])
    const _onRefresh = async () => {
        if (!refreshing) {
            ref.current.allowLoadMore = false
            setRefreshing(true)
            await dispatch(FetchCommentListRequest(postId))
            setRefreshing(false)
            ref.current.allowLoadMore = true
        }
    }
    const _onLoadMore = async () => {
        if (!loadingMore && ref.current.allowLoadMore) {
            setLoadingMore(true)
            await dispatch(LoadMoreCommentListRequest(postId))
            setLoadingMore(false)
        }
    }
    const FooterComponent = ({ loading }: { loading: boolean }) => {
        const _loadingDeg = new Animated.Value(0)
        const _onAnimateLoading = () => {

            Animated.timing(_loadingDeg, {
                toValue: 5,
                duration: 400 * 5,
                useNativeDriver: true
            }).start()
        }
        return (
            <View style={{
                marginBottom: 85,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {loading && <Animated.Image
                    onLayout={_onAnimateLoading}
                    style={{
                        height: 30,
                        width: 30,
                        transform: [
                            {
                                rotate: _loadingDeg.interpolate({
                                    inputRange: [0, 5],
                                    outputRange: ['0deg', '1800deg']
                                })
                            }
                        ]
                    }}
                    source={require('../../assets/icons/waiting.png')} />}
            </View>
        )
    }
    return (
        <FlatList
            ref={scrollRef}
            style={{
                height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
            }}
            refreshing={refreshing}
            onRefresh={_onRefresh}
            ListHeaderComponent={() => <PostContentItem item={comment.post} />}
            ListFooterComponent={() => <FooterComponent loading={loadingMore} />}
            renderItem={({ item, index }) => <CommentItem item={item} />}
            keyExtractor={(item, index) => `${index}`}
            data={comment.comments}
            onEndReached={_onLoadMore}
            onEndReachedThreshold={0.5}
        >
        </FlatList>
    )
}

export default React.memo(index)

const styles = StyleSheet.create({})
