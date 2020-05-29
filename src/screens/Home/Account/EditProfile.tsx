import React, { useState } from 'react'
import { StyleSheet, Animated, Text, View, SafeAreaView, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack } from '../../../navigations/rootNavigation'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../constants'
import { useSelector } from '../../../reducers'
import MaterialInput from '../../../components/MaterialInput'
import { store } from '../../../store'
const EditProfile = () => {
    const fixedUser = store.getState().user.user.userInfo
    const [fullname, setFullname] = useState<string>(fixedUser?.fullname || '')
    const [username, setUsername] = useState<string>(fixedUser?.username || '')
    const [bio, setBio] = useState<string>(fixedUser?.bio || '')
    const [website, setWebsite] = useState<string>(fixedUser?.website || '')
    const user = useSelector(state => state.user.user.userInfo)
    const _topOffsetMainContent = React.useMemo(() => new Animated.Value(1), [])
    const _onAnimateMainContent = () => {
        Animated.timing(_topOffsetMainContent, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
        }).start()
    }
    const _confirmGoBack = () => {
        goBack()
    }
    return (
        <SafeAreaView>
            <NavigationBar title="Edit Profile" callback={_confirmGoBack} />

            <KeyboardAvoidingView
                behavior="padding"
                style={{
                    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
                }}>
                <Animated.ScrollView
                    style={{
                        ...styles.mainContent,
                        height: '100%',
                        transform: [{
                            translateY: _topOffsetMainContent.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44]
                            })
                        }]
                    }}
                    onLayout={_onAnimateMainContent}>
                    <View style={styles.wrapper}>
                        <View style={styles.chooseAvatar}>
                            <Image style={{
                                width: 92,
                                height: 92,
                                borderRadius: 92
                            }} source={{
                                uri: user?.avatarURL
                            }} />
                            <TouchableOpacity
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    fontSize: 18,
                                    marginVertical: 10,
                                    color: '#318bfb'
                                }}>Change Profile Photo</Text>
                            </TouchableOpacity>
                        </View>
                        <View >
                            <MaterialInput
                                containerStyle={{
                                    marginVertical: 10
                                }}
                                name="Fullname"
                                value={fullname}
                                onChangeText={setFullname}
                            />
                            <MaterialInput
                                containerStyle={{
                                    marginVertical: 10
                                }}
                                name="Username"
                                value={username}
                                onChangeText={setUsername}
                            />
                            <MaterialInput
                                containerStyle={{
                                    marginVertical: 10
                                }}
                                name="Website"
                                value={website}
                                onChangeText={setWebsite}
                            />
                            <MaterialInput
                                containerStyle={{
                                    marginVertical: 10
                                }}
                                name="Bio"
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>
                        <View style={styles.infoFormWrapper}>
                            <Text style={{
                                fontWeight: '500',
                                fontSize: 16
                            }}>Profile Information</Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.infoItem}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#666'
                                }}>
                                    E-mail Address
                                </Text>
                                <View style={{
                                    marginTop: 2,
                                    paddingBottom: 5,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#ddd"
                                }}>
                                    <Text>{user?.email}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.infoItem}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#666'
                                }}>
                                    Phone number
                                </Text>
                                <View style={{
                                    marginTop: 2,
                                    paddingBottom: 5,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#ddd"
                                }}>
                                    <Text>{user?.phone}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.infoItem}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#666'
                                }}>
                                    Gender
                                </Text>
                                <View style={{
                                    marginTop: 2,
                                    paddingBottom: 5,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#ddd"
                                }}>
                                    <Text>{user?.gender == 0 ? 'Male'
                                        : (user?.gender === 1 ? 'Female'
                                            : 'Prefer Not to Say')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
export default EditProfile

const styles = StyleSheet.create({
    mainContent: {
        zIndex: 1,
        backgroundColor: '#fff',
        width: "100%",
    },
    wrapper: {
        padding: 15,
    },
    chooseAvatar: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoFormWrapper: {
        marginTop: 30,
    },
    infoItem: {
        marginVertical: 10
    }
})
