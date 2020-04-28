import React, { useEffect, useRef, useState } from 'react'
import {
    Animated, NativeScrollEvent,
    NativeSyntheticEvent, RefreshControl,
    SafeAreaView, ScrollView, StyleSheet,
    Text, View
} from 'react-native'
import { useDispatch } from 'react-redux'
import { FetchPostListRequest, LoadMorePostListRequest } from '../../actions/postActions'
import { FetchStoryListRequest } from '../../actions/storyActions'
import HomeNavigationBar from '../../components/HomeNavigationBar'
import PostList from '../../components/PostList/'
import StoryPreviewList from '../../components/StoryPreviewList'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import { useSelector } from '../../reducers'
const index = () => {
    const dispatch = useDispatch()
    const postList = useSelector(state => state.postList)
    const _loadingDeg = new Animated.Value(0)
    const _scrollRef = useRef<ScrollView>(null)
    const [loadingMore, setLoadingMore] = useState<boolean>(false)
    const ref = useRef<{
        scrollHeight: number,
        preOffsetY: number
    }>({ scrollHeight: 0, preOffsetY: 0 })
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
        if (y > height - 1000
            && y > ref.current.preOffsetY
            && !loadingMore
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
        dispatch(FetchPostListRequest())
    }, [])
    const _onRefresh = async () => {
        setRefreshing(true)
        await dispatch(FetchStoryListRequest())
        await dispatch(FetchPostListRequest())
        setRefreshing(false)
    }

    return (
        <SafeAreaView style={styles.container}>

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
                <PostList data={postList} />
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

        </SafeAreaView >
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
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
