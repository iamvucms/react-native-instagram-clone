import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { ProfileX } from '../../../reducers/profileXReducer'
import { RouteProp } from '@react-navigation/native'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import ProfileXMutual from './FollowTab/ProfileXMutual'
import ProfileXFollower from './FollowTab/ProfileXFollower'
import ProfileXFollowing from './FollowTab/ProfileXFollowing'
import ProfileXSuggestion from './FollowTab/ProfileXSuggestion'
import { useDispatch } from 'react-redux'
import { FetchProfileXRequest } from '../../../actions/profileXActions'
import { SCREEN_WIDTH } from '../../../constants'
import { store } from '../../../store'
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
    const defaultParams = React.useMemo(() => ({
        userX
    }), [])
    const FollowTab = () => {
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
            <Tab.Navigator tabBarOptions={{
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
                <Tab.Screen name={`${mutualCount} Mutual`} component={ProfileXMutual
                    .bind(null, defaultParams)} />
                <Tab.Screen name={`${followerCount} Followers`} component={ProfileXFollower
                    .bind(null, defaultParams)} />
                <Tab.Screen name={`${followingCount} Following`} component={ProfileXFollowing
                    .bind(null, defaultParams)} />
                <Tab.Screen name="Suggestion" component={ProfileXSuggestion
                    .bind(null, defaultParams)} />
            </Tab.Navigator>
        )
    }
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
                            goBack()
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
            <FollowTab />
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
