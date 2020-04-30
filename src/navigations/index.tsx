import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { useSelector } from '../reducers';
import Comment from '../screens/Root/Comment';
import { navigationRef } from './rootNavigation';
import RootTab from './RootTab';
export type SuperRootStackParamList = {
    RootTab: undefined,
    Comment: {
        postId: number
    }
};
const RootStack = createStackNavigator<SuperRootStackParamList>()
const index = (): JSX.Element => {
    const navigationOptions: StackNavigationOptions = {
        headerShown: false,
        gestureEnabled: false
    }
    return (
        <NavigationContainer ref={navigationRef}>
            <RootStack.Navigator
                initialRouteName='RootTab'
                screenOptions={navigationOptions}>
                <RootStack.Screen name="RootTab" component={RootTab} />
                <RootStack.Screen name="Comment" component={Comment} />
            </RootStack.Navigator>
        </NavigationContainer>
    )
}
export default index

