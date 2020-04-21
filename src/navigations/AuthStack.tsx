import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Login from '../screens/Auth/Login'
import Register from '../screens/Auth/Register'
import ForgotPassword from '../screens/Auth/ForgotPassword'
import Welcome, { WelcomePropsRouteParams } from '../screens/Auth/Welcome'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
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
