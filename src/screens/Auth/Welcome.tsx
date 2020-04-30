import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, AlertButton, Animated, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { RegisterRequest } from '../../actions/userActions'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { commonParamList } from '../../navigations/RootTab'
import { RegisterFormValuesStep1, RegisterFormValuesStep2, RegisterFormValuesStep3 } from './Register'

export type WelcomePropsRouteParams = RegisterFormValuesStep3
    & RegisterFormValuesStep2 & RegisterFormValuesStep1
type WelcomePropsRouteProp = RouteProp<commonParamList, 'Welcome'>

type WelcomeNavigationProp = StackNavigationProp<commonParamList, 'Welcome'>

type WelcomeProps = {
    navigation: WelcomeNavigationProp,
    route: WelcomePropsRouteProp
}
const Welcome = ({ navigation, route }: WelcomeProps) => {
    const dispatch = useDispatch()
    // const user = useSelector(state => state.user.user)
    const [usernameError, setUsernameError] = useState<boolean>(false)
    const [chagingUsername, setChagingUsername] = useState<boolean>(false)
    const [username, setUsername] = useState(route.params.email.split('@')[0])
    const _loadingDeg = new Animated.Value(0)
    const [loading, setLoading] = useState<boolean>(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout>()
    useEffect(() => {
        const usr: string = route.params.email.split('@')[0]
        checkExistUsername(usr, setUsernameError, setChagingUsername)
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        }
    }, [])
    // useEffect(() => {
    //     if (user.logined) {
    //         navigation.navigate('HomeTab')
    //     }
    //     return () => {
    //         //
    //     }
    // }, [user])
    const _animationLoadingDeg = () => {
        Animated.timing(_loadingDeg, {
            useNativeDriver: true,
            toValue: 1,
            duration: 400
        }).start(() => {
            _loadingDeg.setValue(0)
            if (loading) _animationLoadingDeg()
        })
    }
    const _validateUsername = (usrname: string) => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            checkExistUsername(usrname, setUsernameError)
        }, 200);

    }
    const _onRegister = async () => {
        if (usernameError) return;
        setLoading(true)
        await dispatch(RegisterRequest({
            ...route.params,
            username,
        }))
        setLoading(false)

    }
    const _onClickChangeUsername = (): void => {
        setChagingUsername(true)
    }
    return (
        <SafeAreaView style={styles.container}>
            {loading && <View style={styles.loadingWrapper}>
                <View style={styles.loading}>
                    <Animated.Image onLayout={_animationLoadingDeg} style={{
                        width: 30,
                        height: 30,
                        marginRight: 10,
                        transform: [
                            {
                                rotate: _loadingDeg.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                })
                            }
                        ]
                    }} source={require('../../assets/icons/waiting.png')} />
                    <Text style={{
                        fontWeight: '500'
                    }}>Registering...</Text>
                </View>
            </View>
            }
            <View style={styles.centerContainer}>
                <View>
                    <Text style={{
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>{chagingUsername ? 'CHANGE USERNAME' : 'WELCOME TO INSTAGRAM,'} </Text>
                    {!chagingUsername && <Text style={{
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>@{username}</Text>}
                    <View style={{
                        marginVertical: 10,
                        width: SCREEN_WIDTH * 0.8
                    }}>
                        {!chagingUsername && <Text style={{
                            color: '#666',
                            textAlign: 'center'
                        }}>Find people to follow and start sharing photos.</Text>}
                        <Text style={{
                            color: '#666',
                            textAlign: 'center'
                        }}>{chagingUsername ? 'Pick username for your account. You can always change it later.' : 'You can change you username anytime.'}</Text>
                    </View>
                </View>
                {chagingUsername &&
                    <>
                        <View style={styles.usernameInputWrapper}>
                            <TextInput
                                autoCapitalize="none"
                                onChangeText={e => {
                                    setUsername(e.toLowerCase())
                                    _validateUsername(e.toLowerCase())
                                }
                                }
                                value={username}
                                style={styles.input}></TextInput>
                            <View style={styles.validIcon}>
                                {usernameError
                                    ? <Text style={{ color: 'red' }}>✕</Text>
                                    : <Text style={{ color: 'green' }}>✓</Text>}
                            </View>

                        </View>
                        {usernameError && <Text style={{
                            width: SCREEN_WIDTH * 0.9,
                            color: 'red',
                            marginVertical: 3
                        }}>You can't not use this username.</Text>}
                    </>
                }
                <TouchableOpacity
                    onPress={_onRegister}
                    activeOpacity={0.8}
                    style={styles.btnNext}>
                    <Text style={{
                        fontWeight: '600',
                        color: '#fff'
                    }}>Next</Text>
                </TouchableOpacity>
                {!chagingUsername && <TouchableOpacity
                    onPress={_onClickChangeUsername}
                    activeOpacity={0.8}>
                    <Text style={{
                        fontWeight: '600',
                        color: '#318bfb'
                    }}>Change username</Text>
                </TouchableOpacity>}

            </View>
            <View style={styles.bottomInfo}>
                <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: '#666'
                }}>By clicking Next, you agree to our <Text style={{
                    color: '#000',
                }}>
                        Terms, Data Policy and Cookies Policy</Text></Text>
            </View>
        </SafeAreaView>
    )
}
export default Welcome

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    centerContainer: {
        width: '100%',
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 100,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    },
    bottomInfo: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25
    },
    btnNext: {
        width: SCREEN_WIDTH * 0.9,
        height: 46,
        backgroundColor: '#318bfb',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        borderRadius: 5
    },
    loadingWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 99
    },
    loading: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 5,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    usernameInputWrapper: {
        height: 44,
        width: SCREEN_WIDTH * 0.9,
        backgroundColor: 'rgb(242,242,242)',
        borderRadius: 5,
        overflow: 'hidden',
        borderColor: '#ddd',
        borderWidth: 1,
        marginTop: 10
    },
    input: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 15,
        paddingRight: 44 + 15,
    },
    validIcon: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        width: 44,
        top: 0,
        right: 0
    }
})
function checkExistUsername(usr: string, setUsernameError: React.Dispatch<React.SetStateAction<boolean>>, setChagingUsername?: React.Dispatch<React.SetStateAction<boolean>>) {
    const pattern = /^[a-zA-Z0-9._]{4,}$/g
    if (!pattern.test(usr)) return setUsernameError(true)
    firestore().collection('users')
        .where('username', '==', usr.trim())
        .get()
        .then(snap => {
            if (snap.size > 0) {
                setUsernameError(true)
                if (setChagingUsername) {
                    const buttonGroup: AlertButton[] = [
                        {
                            text: 'Choose another username',
                            onPress: () => setChagingUsername(true)
                        }
                    ]
                    Alert.alert('Username has been already used',
                        'Try to use another username', buttonGroup
                    )
                }
            }
            else
                setUsernameError(false)
        }).catch(e => e)
}

