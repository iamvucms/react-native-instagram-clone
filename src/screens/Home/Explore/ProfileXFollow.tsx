import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { FetchProfileXRequest } from '../../../actions/profileXActions'
import { SCREEN_WIDTH } from '../../../constants'
import { navigate } from '../../../navigations/rootNavigation'
import { ProfileX } from '../../../reducers/profileXReducer'
import { store } from '../../../store'
import ProfileXFollower from './FollowTab/ProfileXFollower'
import ProfileXFollowing from './FollowTab/ProfileXFollowing'
import ProfileXMutual from './FollowTab/ProfileXMutual'
import ProfileXSuggestion from './FollowTab/ProfileXSuggestion'
type Params = {
    ProfileXFollow: {
        userX: ProfileX,
        type: 1 | 2
    }
}
type ProfileXFollowRouteProp = RouteProp<Params, 'ProfileXFollow'>
type ProfileXFollowProps = {
    route: ProfileXFollowRouteProp
}
const Tab = createMaterialTopTabNavigator()
const ProfileXFollow = ({ route }: ProfileXFollowProps) => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const dispatch = useDispatch()
    const { userX, type } = route.params

    return (
        <SafeAreaView style={styles.container}>
            <View style={{
                ...styles.profileHeader,
            }}>
                <View
                    style={styles.btnSwitchAccount}>
                    <TouchableOpacity
                        onPress={() => {
                            dispatch(FetchProfileXRequest(userX.username || ''))
                            navigate('ProfileX', {
                                username: userX.username
                            })
                        }}
                        style={styles.centerBtn}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <Text style={{
                        fontWeight: '500',
                        fontSize: 16
                    }}>{userX.username}</Text>
                </View>
            </View>
            <FollowTab {...{ userX, type }} />
        </SafeAreaView>
    )
}

export default ProfileXFollow

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgb(250,250,250)'
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        width: '100%'
    },
    btnSwitchAccount: {
        flexDirection: 'row',
        height: 44,
        paddingHorizontal: 10,
        alignItems: 'center'
    },
    centerBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
})
const FollowTab = ({ userX, type }: { userX: ProfileX, type: 1 | 2 }) => {
    const mutualCount = !!!userX.mutualFollowings ? '' : (
        userX.mutualFollowings.length < 1000 ? userX.mutualFollowings.length
            : Math.round(userX.mutualFollowings.length / 1000) + 'k'
    )
    const followerCount = !!!userX.followers ? '' : (
        userX.followers.length < 1000 ? userX.followers.length
            : Math.round(userX.followers.length / 1000) + 'k'
    )
    const followingCount = !!!userX.followings ? '' : (
        userX.followings.length < 1000 ? userX.followings.length
            : Math.round(userX.followings.length / 1000) + 'k'
    )
    return (
        <Tab.Navigator
            initialRouteName={
                type === 1 ? `${followerCount} Followers` : `${followingCount} Following`
            }
            tabBarOptions={{
                contentContainerStyle: {
                    backgroundColor: 'rgb(250,250,250)',
                },
                indicatorStyle: {
                    top: '100%',
                    backgroundColor: '#000',
                    height: 1
                },
                labelStyle: {
                    fontWeight: '500',
                    fontSize: 14,
                    textTransform: 'capitalize'
                },
                tabStyle: {
                    width: SCREEN_WIDTH / 3.5
                },
                bounces: false,
                scrollEnabled: true
            }} >
            <Tab.Screen name={`${mutualCount} Mutual`}
                children={() => <ProfileXMutual userX={userX} />} />
            <Tab.Screen name={`${followerCount} Followers`}
                children={() => <ProfileXFollower userX={userX} />} />
            <Tab.Screen name={`${followingCount} Following`}
                children={() => <ProfileXFollowing userX={userX} />} />
            <Tab.Screen name="Suggestion"
                children={() => <ProfileXSuggestion userX={userX} />} />
        </Tab.Navigator>
    )
}
