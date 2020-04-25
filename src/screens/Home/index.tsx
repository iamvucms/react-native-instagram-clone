import React from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native'
import HomeNavigationBar from '../../components/HomeNavigationBar'
import StoryPreviewList from '../../components/StoryPreviewList'
import PostList from '../../components/PostList/'
const index = () => {
    return (
        <SafeAreaView style={styles.container}>
            <HomeNavigationBar />
            <ScrollView>
                <StoryPreviewList />
                <PostList />
            </ScrollView>
        </SafeAreaView>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    }
})
