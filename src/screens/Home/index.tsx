import React, { useEffect, useRef, useState } from 'react'
import {
    Animated, NativeScrollEvent,
    NativeSyntheticEvent, RefreshControl,
    SafeAreaView, ScrollView, StyleSheet,
    Text, View, KeyboardAvoidingView, Keyboard, TextInput,
    TouchableOpacity
} from 'react-native'
import { useDispatch } from 'react-redux'
import { FetchPostListRequest, LoadMorePostListRequest } from '../../actions/postActions'
import { FetchStoryListRequest } from '../../actions/storyActions'
import HomeNavigationBar from '../../components/HomeNavigationBar'
import PostList from '../../components/PostList/'
import StoryPreviewList from '../../components/StoryPreviewList'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import CommentInputPopup from '../../components/CommentInputPopup'
import { useSelector } from '../../reducers'
const index = () => {
    const dispatch = useDispatch()
    const postList = useSelector(state => state.postList)
    const user = useSelector(state => state.user.user)
    const _loadingDeg = new Animated.Value(0)
    const _scrollRef = useRef<ScrollView>(null)
    const [loadingMore, setLoadingMore] = useState<boolean>(false)
    const _commentInputRef = useRef<TextInput>(null)
    const [showCommentInput, setShowCommentInput] = useState<boolean>(false)
    const ref = useRef<{
        scrollHeight: number,
        preOffsetY: number,
        currentCommentId: number,
        commentContents: {
            id: number, content: string
        }[]
    }>({
        scrollHeight: 0, preOffsetY: 0,
        commentContents: [], currentCommentId: 0
    })
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const _startAnimateLoading = () => {
        Animated.timing(_loadingDeg, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
        }).start(() => {
            _loadingDeg.setValue(0)
            _startAnimateLoading()
        })
    }
    const _onScroll = ({ nativeEvent: {
        contentOffset: { y }, contentSize: { height }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (y / height > 0.45
            && y > ref.current.preOffsetY
            && !loadingMore && !refreshing
        ) {
            (async () => {
                setLoadingMore(true)
                await dispatch(LoadMorePostListRequest())
                setLoadingMore(false)
            })()
        }
        ref.current.preOffsetY = y
    }
    useEffect(() => {
        (async () => {
            setRefreshing(true)
            await dispatch(FetchStoryListRequest())
            await dispatch(FetchPostListRequest())
            setRefreshing(false)
        })()
    }, [user])
    useEffect(() => {
        Keyboard.addListener('keyboardDidHide', () => {
            setShowCommentInput(false)
        })
        // dispatch(FetchPostListRequest())
    }, [])
    const _onRefresh = async () => {
        setRefreshing(true)
        await dispatch(FetchStoryListRequest())
        await dispatch(FetchPostListRequest())
        setRefreshing(false)
    }
    const _showCommentInput = React.useCallback((id: number, prefix?: string) => {
        if (id !== 0) {
            const check = ref.current.commentContents.every((x, index) => {
                if (x.id === id) {
                    if (prefix) {
                        ref.current.commentContents[index].content = prefix
                    }
                    return false
                }
                return true
            })
            if (check) {
                ref.current.commentContents.push({
                    id: id,
                    content: prefix || ''
                })
            }
            ref.current.currentCommentId = id
            setShowCommentInput(true)
        }
    }, [])
    const _setCommentContents = (id: number, content: string) => {
        ref.current.commentContents.filter(x => x.id === id)[0].content = content
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.keyboardAvoidingViewContainer} behavior="height">
                <HomeNavigationBar />
                <ScrollView
                    ref={_scrollRef}
                    style={styles.scrollContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={_onRefresh}
                        />
                    }
                    scrollEventThrottle={10}
                    onScroll={_onScroll}
                    showsVerticalScrollIndicator={false}
                >
                    <StoryPreviewList />
                    <PostList showCommentInput={_showCommentInput} data={postList} />
                    <View style={{
                        ...styles.loadingIcon,
                        opacity: loadingMore ? 1 : 0
                    }}>
                        {loadingMore && <>
                            <Animated.Image
                                onLayout={_startAnimateLoading}
                                style={{
                                    width: 30,
                                    height: 30,
                                    transform: [
                                        {
                                            rotate: _loadingDeg.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '360deg']
                                            })
                                        }
                                    ]
                                }}
                                source={require('../../assets/icons/waiting.png')} />
                            <Text style={{
                                fontWeight: '500',
                                marginLeft: 5
                            }}>Loading more...</Text></>}
                    </View>

                </ScrollView>
                {showCommentInput && <CommentInputPopup
                    onDone={setShowCommentInput.bind(null, false)}
                    setCommentContents={_setCommentContents}
                    id={ref.current.currentCommentId}
                    preValue={ref.current.commentContents
                        .filter(x => x.id === ref.current.currentCommentId)[0]?.content || ""}
                    commentInputRef={_commentInputRef} />}
            </KeyboardAvoidingView>
        </SafeAreaView >
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    keyboardAvoidingViewContainer: {
        position: "relative"
    },
    scrollContainer: {
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - 80
    },
    loadingIcon: {
        position: 'relative',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})
