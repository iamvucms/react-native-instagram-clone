import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack'
import { navigationRef } from './rootNavigation';
type rootStackParamList = {
    AuthStack: undefined;
};
const Stack = createStackNavigator<rootStackParamList>()
const index = (): JSX.Element => {
    const navigationOptions: StackNavigationOptions = {
        headerShown: false
    }
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={navigationOptions}>
                <Stack.Screen name="AuthStack" component={AuthStack} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default index

const styles = StyleSheet.create({})
