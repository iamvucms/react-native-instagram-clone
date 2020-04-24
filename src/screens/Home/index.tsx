import React from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native'
import HomeNavigationBar from '../../components/HomeNavigationBar'
import StoryPreviewList from '../../components/StoryPreviewList'
const index = () => {
    return (
        <SafeAreaView style={styles.container}>
            <HomeNavigationBar />
            <ScrollView>
                <StoryPreviewList />
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
