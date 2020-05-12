import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack } from '../../../navigations/rootNavigation'
const Setting = () => {
    return (
        <SafeAreaView>
            <NavigationBar title="Setting" callback={() => goBack()} />
        </SafeAreaView>
    )
}

export default Setting

const styles = StyleSheet.create({})
