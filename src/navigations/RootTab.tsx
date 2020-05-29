import { createMaterialTopTabNavigator, MaterialTopTabBarOptions, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import React from 'react';
import { useSelector } from '../reducers';
import Direct from '../screens/Others/Direct';
import PhotoTaker from '../screens/Others/PhotoTaker';
import AuthStack, { AuthStackParamList } from './AuthStack';
import HomeTab, { HomeTabParamList } from './HomeTab';
export type rootStackParamList = {
    AuthStack: undefined;
    HomeTab: undefined,
    PhotoTaker: undefined,
    Direct: undefined,
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

