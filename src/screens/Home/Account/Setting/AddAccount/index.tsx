import { useRoute } from '@react-navigation/native'
import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { settingNavigationMap } from '../../Setting'
const index = (): JSX.Element => {
    return (
        <SafeAreaView style={styles.container}>

        </SafeAreaView>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    settingItem: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
