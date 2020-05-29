import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import React from 'react'
import { StyleSheet } from 'react-native'
import ForgotPassword from '../screens/Auth/ForgotPassword'
import Login from '../screens/Auth/Login'
import Register from '../screens/Auth/Register'
import Welcome, { WelcomePropsRouteParams } from '../screens/Auth/Welcome'
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Welcome: WelcomePropsRouteParams;
};
const Stack = createStackNavigator<AuthStackParamList>()
const AuthStack = () => {
    const navigationOptions: StackNavigationOptions = {
        headerShown: false,
        gestureEnabled: false
    }
    return (
        <Stack.Navigator screenOptions={navigationOptions}>
            <Stack.Screen component={Login} name="Login" />
            <Stack.Screen component={Register} name="Register" />
            <Stack.Screen component={ForgotPassword} name="ForgotPassword" />
            <Stack.Screen component={Welcome} name="Welcome" />
        </Stack.Navigator>
    )
}

export default AuthStack

const styles = StyleSheet.create({})
