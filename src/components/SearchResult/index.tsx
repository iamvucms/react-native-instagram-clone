import React, { useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import AccountGallery from '../AccountGallery'
import NavigationBar from '../NavigationBar'
import TopResult from './TopResult'
import Accounts from './Accounts'
import Tags from './Tags'
import Places from './Places'
export interface SearchResultProps {
    query: string
}
const Tab = createMaterialTopTabNavigator()
const SearchResult = ({ query }: SearchResultProps) => {
    useEffect(() => {
        // console.warn(query)
    }, [query])
    return (
        <View style={styles.container}>
            <Tab.Navigator>
                <Tab.Screen component={TopResult} name="Top" />
                <Tab.Screen component={Accounts} name="Accounts" />
                <Tab.Screen component={Tags} name="Tags" />
                <Tab.Screen component={Places} name="Places" />
            </Tab.Navigator>
        </View>
    )
}

export default SearchResult

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    }
})
