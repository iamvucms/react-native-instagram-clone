import {
    createBottomTabNavigator,
    BottomTabBarOptions, BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs'
import React, { useEffect } from 'react'
import { StyleSheet, Text } from 'react-native'
import HomeIndex from '../screens/Home'
import Explore from '../screens/Home/Explore'
import Creator from '../screens/Home/Creator'
import Activity from '../screens/Home/Activity'
import Account from '../screens/Home/Account'
import SettingNavigationx from '../screens/Home/Account/Setting/index'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TabBarComponent } from '../components/BottomTabBar'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import Setting from '../screens/Home/Account/SettingIndex'
import { settingNavigationMap } from '../constants'
import Follow from '../screens/Home/Account/Follow'
export type HomeTabParamList = {
    HomeIndex: undefined,
    Explore: undefined,
    Creator: undefined,
    Activity: undefined,
    Account: undefined,
    Follow: {
        type: 1 | 2
    }
};
const Stack = createStackNavigator()
const AccountStack = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: false
        }}>
            <Stack.Screen component={Account} name="AccountIndex" />
            <Stack.Screen component={Setting} name="Setting" />
            <Stack.Screen options={{
                ...TransitionPresets.ModalSlideFromBottomIOS,
            }} component={Follow} name="Follow" />
            <Stack.Screen component={SettingNavigationx.Logout} name="Logout" />
            <Stack.Screen component={SettingNavigationx.AddAccount} name="AddAccount" />
            {settingNavigationMap.map((settingNavigation, index) => (
                <>
                    <Stack.Screen key={index} component={settingNavigation.component} name={settingNavigation.navigationName} />
                    {settingNavigation.child && settingNavigation.child.map((childSettingNavigation, index) => (
                        <>
                            {childSettingNavigation.navigationName === 'FollowContact' ? (
                                <Stack.Screen options={{
                                    cardStyle: { backgroundColor: 'transparent' },
                                    ...TransitionPresets.ModalSlideFromBottomIOS,
                                    animationEnabled: false
                                }} component={childSettingNavigation.component} name={childSettingNavigation.navigationName} />
                            ) : (
                                    <Stack.Screen component={childSettingNavigation.component} name={childSettingNavigation.navigationName} />
                                )}
                        </>
                    ))}
                </>
            ))}
            <Stack.Screen component={SettingNavigationx.BlockedComments} name="BlockedComments" />
            <Stack.Screen component={SettingNavigationx.HideStoryFrom} name="HideStoryFrom" />
        </Stack.Navigator>
    )
}
const Tab = createBottomTabNavigator<HomeTabParamList>()
const HomeTab = () => {

    const tabBarOptions: BottomTabBarOptions = {
        showLabel: false,
    }
    const navigationOptions: BottomTabNavigationOptions = {

    }
    return (
        <Tab.Navigator tabBar={TabBarComponent} tabBarOptions={tabBarOptions} screenOptions={navigationOptions}>
            <Tab.Screen
                options={{
                    tabBarIcon: ({ focused }) => <Icon name="home"
                        size={30} color={focused ? '#000' : '#ddd'} />
                }} component={HomeIndex} name="HomeIndex" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="magnify"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={Explore} name="Explore" />
            <Tab.Screen
                listeners={({ navigation, route }) => ({
                    tabPress: e => {
                        e.preventDefault();
                        navigation.navigate('GalleryChooser');
                    },
                })}
                options={{
                    tabBarIcon: ({ focused }) => <Icon name="plus-box"
                        size={30} color={'#ddd'} />
                }} component={Creator} name="Creator" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="heart"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={Activity} name="Activity" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="account"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={AccountStack} name="Account" />
        </Tab.Navigator>
    )
}

export default HomeTab

const styles = StyleSheet.create({})
