import React, { useState, useEffect, useRef } from 'react'
import {
    SafeAreaView, ScrollView, StyleSheet,
    NativeSyntheticEvent, NativeScrollEvent, RefreshControl, LayoutChangeEvent
} from 'react-native'
import HomeNavigationBar from '../../components/HomeNavigationBar'
import PostList from '../../components/PostList/'
import StoryPreviewList from '../../components/StoryPreviewList'
import { useDispatch } from 'react-redux'
import { FetchPostListRequest } from '../../actions/postActions'
import { useSelector } from '../../reducers'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import { FetchStoryListRequest } from '../../actions/storyActions'
const index = () => {
    const dispatch = useDispatch()
    const postList = useSelector(state => state.postList)
    const ref = useRef<{
        scrollHeight: number,
        preOffsetY: number
    }>({ scrollHeight: 0, preOffsetY: 0 })
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const _onScroll = ({ nativeEvent: {
        contentOffset: { y }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {

        if (y > ref.current.scrollHeight - 200 && y > ref.current.preOffsetY) {
            console.warn("reached")
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
    const _onLayoutHandler = ({ nativeEvent }: LayoutChangeEvent) => {
        ref.current.scrollHeight = nativeEvent.layout.height
    }
    return (
        <SafeAreaView style={styles.container}>

            <HomeNavigationBar />
            <ScrollView
                style={styles.scrollContainer}
                onLayout={_onLayoutHandler}
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
            </ScrollView>
        </SafeAreaView>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    scrollContainer: {
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - 80
    }
})
