import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Login from '../screens/Auth/Login'
import Register from '../screens/Auth/Register'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};
const Stack = createStackNavigator<AuthStackParamList>()
const AuthStack = () => {
    const navigationOptions: StackNavigationOptions = {
        headerShown: false
    }
    return (
        <Stack.Navigator screenOptions={navigationOptions}>
            <Stack.Screen component={Login} name="Login" />
            <Stack.Screen component={Register} name="Register" />
        </Stack.Navigator>
    )
}

export default AuthStack

const styles = StyleSheet.create({})
