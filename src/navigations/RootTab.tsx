import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabBarOptions
} from '@react-navigation/material-top-tabs'
import React from 'react';
import { useSelector } from '../reducers';
import AuthStack, { AuthStackParamList } from './AuthStack'
import HomeTab, { HomeTabParamList } from './HomeTab'
import PhotoTaker from '../screens/Others/PhotoTaker'
import Comment from '../screens/Root/Comment'
import Direct from '../screens/Others/Direct'
import { navigationRef } from './rootNavigation';
export type rootStackParamList = {
    AuthStack: undefined;
    HomeTab: undefined,
    PhotoTaker: undefined,
    Direct: undefined,
    Comment: undefined,
};
export type commonParamList = AuthStackParamList & HomeTabParamList & rootStackParamList
const RootTab = createMaterialTopTabNavigator<rootStackParamList>()
const index = (): JSX.Element => {
    const user = useSelector(state => state.user.user)
    const navigationOptions: MaterialTopTabNavigationOptions = {
    }
    const tabBarOptions: MaterialTopTabBarOptions = {
        indicatorContainerStyle: {
            display: 'none'
        },
        tabStyle: {
            display: 'none'
        }
    }
    return (
        <RootTab.Navigator
            initialRouteName={user.logined ? 'HomeTab' : 'AuthStack'}
            screenOptions={navigationOptions}
            tabBarOptions={tabBarOptions}>
            {!user.logined &&
                <RootTab.Screen name="AuthStack" component={AuthStack} />
            }
            {user.logined &&
                <>
                    <RootTab.Screen name="PhotoTaker" component={PhotoTaker} />
                    <RootTab.Screen name="HomeTab" component={HomeTab} />
                    <RootTab.Screen name="Direct" component={Direct} />
                </>
            }

        </RootTab.Navigator>
    )
}
export default index

