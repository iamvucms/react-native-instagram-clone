import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { useSelector } from '../reducers';
import AuthStack, { AuthStackParamList } from './AuthStack';
import HomeTab, { HomeTabParamList } from './HomeTab';
import { navigationRef } from './rootNavigation';
export type rootStackParamList = {
    AuthStack: undefined;
    HomeTab: undefined
};
export type commonParamList = AuthStackParamList & HomeTabParamList & rootStackParamList
const Stack = createStackNavigator<rootStackParamList>()
const index = (): JSX.Element => {
    const user = useSelector(state => state.user.user)
    const navigationOptions: StackNavigationOptions = {
        headerShown: false,
        gestureEnabled: false
    }
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={navigationOptions}>
                {!user.logined && < Stack.Screen name="AuthStack" component={AuthStack} />}
                {user.logined &&
                    <>
                        <Stack.Screen name="HomeTab" component={HomeTab} />
                    </>
                }
            </Stack.Navigator>
        </NavigationContainer>
    )
}
export default index

