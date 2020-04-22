import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import HomeNavigationBar from '../../components/HomeNavigationBar'
const index = () => {
    return (
        <SafeAreaView style={styles.container}>
            <HomeNavigationBar />
        </SafeAreaView>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    }
})
