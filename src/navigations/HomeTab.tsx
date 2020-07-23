import { BottomTabBarOptions, BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import React from 'react'
import { StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TabBarComponent } from '../components/BottomTabBar'
import CustomNotificationIcon from '../components/CustomTabIcons/CustomNotificationIcon'
import { settingNavigationMap } from '../constants'
import HomeIndex from '../screens/Home'
import Account from '../screens/Home/Account'
import AccountYouDontFollowBack from '../screens/Home/Account/AccountYouDontFollowBack'
import Follow from '../screens/Home/Account/Follow'
import FollowRequests from '../screens/Home/Account/FollowRequests'
import RecentFollowerInteraction from '../screens/Home/Account/RecentFollowerInteraction'
import RecentFollowingInteraction from '../screens/Home/Account/RecentFollowingInteraction'
import SettingNavigationx from '../screens/Home/Account/Setting/index'
import Setting from '../screens/Home/Account/SettingIndex'
import Activity from '../screens/Home/Activity'
import Creator from '../screens/Home/Creator'
import Explore from '../screens/Home/Explore'
import CustomAccountIcon from '../components/CustomTabIcons/CustomAccountIcon'
import Location from '../screens/Home/Explore/Location'
import Hashtag from '../screens/Home/Explore/Hashtag'
import ProfileX from '../screens/Home/Explore/ProfileX'
import ProfileXFollow from '../screens/Home/Explore/ProfileXFollow'
import Archive from '../screens/Home/Account/Archive'
import Saved from '../screens/Home/Account/Setting/Account/Saved'
import SavedCollection from '../screens/Home/Account/Setting/Account/SavedCollection'
import AddSavedCollection from '../screens/Home/Account/Setting/Account/AddSavedCollection'
import EditSavedCollection from '../screens/Home/Account/Setting/Account/EditSavedCollection'
import AddToSavedCollection from '../screens/Home/Account/Setting/Account/AddToSavedCollection'
import CreateHighlight from '../screens/Home/Account/CreateHighlight'
import ImageClass from '../screens/Home/Explore/ImageClass'
export type HomeTabParamList = {
    HomeIndex: undefined,
    Explore: undefined,
    Creator: undefined,
    Activity: undefined,
    Account: undefined,
    Follow: {
        type: 1 | 2
    }
};
const Stack = createStackNavigator()
const AccountStack = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: false
        }}>
            <Stack.Screen component={Account} name="AccountIndex" />
            <Stack.Screen name="ProfileX" component={ProfileX} />
            <Stack.Screen name="ProfileXFollow" component={ProfileXFollow} />
            <Stack.Screen component={Setting} name="Setting" />
            <Stack.Screen component={CreateHighlight} name="CreateHighlight" />
            <Stack.Screen options={{
                ...TransitionPresets.ModalSlideFromBottomIOS,
            }} component={Follow} name="Follow" />
            <Stack.Screen component={FollowRequests} name="FollowRequests" />
            <Stack.Screen component={RecentFollowingInteraction} name="RecentFollowingInteraction" />
            <Stack.Screen component={RecentFollowerInteraction} name="RecentFollowerInteraction" />
            <Stack.Screen component={Archive} name="Archive" />
            <Stack.Screen component={AccountYouDontFollowBack} name="AccountYouDontFollowBack" />
            <Stack.Screen component={SettingNavigationx.AddAccount} name="AddAccount" />
            {settingNavigationMap.map((settingNavigation, index) => (
                <React.Fragment key={index}>
                    <Stack.Screen component={settingNavigation.component} name={settingNavigation.navigationName} />
                    {settingNavigation.child && settingNavigation.child.map((childSettingNavigation, index2) => (
                        <React.Fragment key={index2}>
                            {childSettingNavigation.navigationName === 'FollowContact' ? (
                                <Stack.Screen options={{
                                    cardStyle: { backgroundColor: 'transparent' },
                                    ...TransitionPresets.ModalSlideFromBottomIOS,
                                    animationEnabled: false
                                }} component={childSettingNavigation.component} name={childSettingNavigation.navigationName} />
                            ) : (
                                    <Stack.Screen component={childSettingNavigation.component} name={childSettingNavigation.navigationName} />
                                )}
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
            <Stack.Screen component={SettingNavigationx.BlockedComments} name="BlockedComments" />
            <Stack.Screen component={SettingNavigationx.HideStoryFrom} name="HideStoryFrom" />
        </Stack.Navigator>
    )
}

const ActivityStack = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: false
        }}>
            <Stack.Screen name="ActiviyIndex" component={Activity} />
            <Stack.Screen name="ActiviyFollow" component={Follow} />
            <Stack.Screen name="ActivityFollowRequests" component={FollowRequests} />
        </Stack.Navigator>
    )
}
const ExploreStack = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: false
        }}>
            <Stack.Screen name="Explore" component={Explore} />
            <Stack.Screen name="Location" component={Location} />
            <Stack.Screen name="Hashtag" component={Hashtag} />
            <Stack.Screen name="ProfileX" component={ProfileX} />
            <Stack.Screen name="ProfileXFollow" component={ProfileXFollow} />
            <Stack.Screen name="ImageClass" component={ImageClass} />
        </Stack.Navigator>
    )
}
const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: false
        }}>
            <Stack.Screen component={HomeIndex} name="HomeIndex" />
            <Stack.Screen name="Hashtag" component={Hashtag} />
            <Stack.Screen name="ProfileX" component={ProfileX} />
            <Stack.Screen name="ProfileXFollow" component={ProfileXFollow} />
            <Stack.Screen name="Saved" component={Saved} />
            <Stack.Screen name="SavedCollection" component={SavedCollection} />
            <Stack.Screen name="EditSavedCollection" component={EditSavedCollection} />
            <Stack.Screen name="AddSavedCollection" component={AddSavedCollection} />
            <Stack.Screen name="AddToSavedCollection" component={AddToSavedCollection} />
        </Stack.Navigator>
    )
}
const Tab = createBottomTabNavigator<HomeTabParamList>()
const HomeTab = () => {
    const tabBarOptions: BottomTabBarOptions = {
        showLabel: false,
    }
    const navigationOptions: BottomTabNavigationOptions = {

    }
    return (
        <Tab.Navigator tabBar={TabBarComponent} tabBarOptions={tabBarOptions} screenOptions={navigationOptions}>
            <Tab.Screen
                options={{
                    tabBarIcon: ({ focused }) => <Icon name="home"
                        size={30} color={focused ? '#000' : '#ddd'} />
                }} component={HomeStack} name="HomeIndex" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <Icon name="magnify"
                    size={30} color={focused ? '#000' : '#ddd'} />
            }} component={ExploreStack} name="Explore" />
            <Tab.Screen
                listeners={({ navigation, route }) => ({
                    tabPress: e => {
                        e.preventDefault();
                        navigation.navigate('GalleryChooser');
                    },
                })}
                options={{
                    tabBarIcon: ({ focused }) => <Icon name="plus-box"
                        size={30} color={'#ddd'} />
                }} component={Creator} name="Creator" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <CustomNotificationIcon focused={focused} />
            }} component={ActivityStack} name="Activity" />
            <Tab.Screen options={{
                tabBarIcon: ({ focused }) => <CustomAccountIcon focused={focused} />
            }} component={AccountStack} name="Account" />
        </Tab.Navigator>
    )
}

export default HomeTab

const styles = StyleSheet.create({})
