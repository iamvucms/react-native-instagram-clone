import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import React from 'react'
import { StyleSheet } from 'react-native'
import HomeIndex from '../screens/Home'
export type HomeTabParamList = {
    HomeIndex: undefined
};
const Tab = createBottomTabNavigator<HomeTabParamList>()
const HomeTab = () => {
    const navigationOptions: BottomTabNavigationOptions = {
        
    }
    return (
        <Tab.Navigator screenOptions={navigationOptions}>
            <Tab.Screen component={HomeIndex} name="HomeIndex" />
        </Tab.Navigator>
    )
}

export default HomeTab

const styles = StyleSheet.create({})
