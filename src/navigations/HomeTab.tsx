import {
    createBottomTabNavigator,
    BottomTabBarOptions, BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs'
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import HomeIndex from '../screens/Home'
import Explore from '../screens/Home/Explore'
import Creator from '../screens/Home/Creator'
import Activity from '../screens/Home/Activity'
import Account from '../screens/Home/Account'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
export type HomeTabParamList = {
    HomeIndex: undefined,
    Explore: undefined,
    Creator: undefined,
    Activity: undefined,
    Account: undefined
};
const Tab = createBottomTabNavigator<HomeTabParamList>()
const HomeTab = () => {
    
    const tabBarOptions: BottomTabBarOptions = {
        showLabel: false
    }
    const navigationOptions: BottomTabNavigationOptions = {

    }
    return (
        <Tab.Navigator tabBarOptions={tabBarOptions} screenOptions={navigationOptions}>
            <Tab.Screen
                options={{
                    tabBarIcon: ({ focused }) => <Icon name="home"
                        size={30} color={focused ? '#000' : '#ddd'} />
                }} component={HomeIndex} name="HomeIndex" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="magnify"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={Explore} name="Explore" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="plus-box"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={Creator} name="Creator" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="heart"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={Activity} name="Activity" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="account"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={Account} name="Account" />
        </Tab.Navigator>
    )
}

export default HomeTab

const styles = StyleSheet.create({})
