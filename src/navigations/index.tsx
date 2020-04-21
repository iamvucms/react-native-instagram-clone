import React, { useEffect } from 'react'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native';
import AuthStack, { AuthStackParamList } from './AuthStack'
import HomeTab, { HomeTabParamList } from './HomeTab'
import { navigationRef, navigation } from './rootNavigation';
import { useSelector } from '../reducers'
export type rootStackParamList = {
    AuthStack: undefined;
    HomeTab: undefined
};
export type commonParamList = AuthStackParamList & HomeTabParamList & rootStackParamList
const Stack = createStackNavigator<rootStackParamList>()
const index = (): JSX.Element => {
    const user = useSelector(state => state.user.user)
    useEffect(() => {
        if (user.logined) navigation.navigate('HomeTab')
        return () => {

        }
    }, [user])
    const navigationOptions: StackNavigationOptions = {
        headerShown: false,
        gestureEnabled: false
    }
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={navigationOptions}>
                <Stack.Screen name="AuthStack" component={AuthStack} />
                <Stack.Screen name="HomeTab" component={HomeTab} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
export default index

