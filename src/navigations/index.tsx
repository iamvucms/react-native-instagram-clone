import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import { ExtraPost } from '../reducers/postReducer';
import PostOptions from '../screens/Others/PostOptions';
import Comment from '../screens/Root/Comment';
import { navigationRef } from './rootNavigation';
import RootTab from './RootTab';
import EditProfile from '../screens/Home/Account/EditProfile';
export type SuperRootStackParamList = {
    RootTab: undefined,
    Comment: {
        postId: number
    },
    PostOptions: {
        item: ExtraPost
    },
    EditProfile: undefined
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
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="PostOptions" component={PostOptions} />
                <RootStack.Screen options={{
                    animationEnabled: false,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="EditProfile" component={EditProfile} />
            </RootStack.Navigator>
        </NavigationContainer>
    )
}
export default index

