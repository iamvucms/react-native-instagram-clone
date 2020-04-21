import React, { useState, useRef, useEffect } from 'react'
import {
    StyleSheet, Text,
    SafeAreaView, TouchableOpacity,
    View, Image, TextInput, Animated
} from 'react-native'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT, SCREEN_WIDTH } from '../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { navigation } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'
import { useDispatch } from 'react-redux'
import { LoginRequest, userLoginWithEmail } from '../../actions/userActions'
import { Dispatch } from 'redux'
import { userAction } from 'src/reducers/userReducer'
import { ThunkDispatch } from 'redux-thunk'
const Login = (): JSX.Element => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [hidePassword, sethidePassword] = useState(true)
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [allowLogin, setallowLogin] = useState(false)
    const _loadingDeg = new Animated.Value(0)
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
    const {
        _onChangeUsername,
        _onChangePassword,
        _onPressToggleHidePassword,
        _onLogin,
        _onPressRegister } = getEventHandlers(sethidePassword,
            hidePassword, password, setallowLogin,
            setUsername, username, setPassword, setLoading, dispatch)
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
                    }}>Logining...</Text>
                </View>
            </View>
            }
            <View style={styles.languageChooser}>
                <TouchableOpacity style={styles.btnCurLanguage}>
                    <Text style={styles.curLanguage}>Tieng Viet (Viet Nam)</Text>
                    <Icon name="chevron-down" size={20} color="#333" />
                </TouchableOpacity>
            </View>
            <View style={styles.centerContainer}>
                <View style={styles.logoWrapper}>
                    <Image
                        resizeMode="contain"
                        style={styles.logo}
                        source={require('../../assets/images/logo.png')} />
                </View>
                <View style={styles.loginForm}>
                    <View style={styles.textInputWrapper}>
                        <TextInput autoCapitalize="none" value={username} onChangeText={_onChangeUsername} placeholder="Username"
                            style={styles.input} />
                    </View>
                    <View style={styles.textInputWrapper}>
                        <TextInput value={password}
                            onChangeText={_onChangePassword}
                            secureTextEntry={hidePassword}
                            placeholder="Password" style={styles.input} />
                        <TouchableOpacity
                            style={styles.hidePasswordIcon}
                            onPress={_onPressToggleHidePassword}
                        >
                            {hidePassword ? (
                                <Icon name="eye-off-outline" size={20}
                                    color="#333" />
                            ) : (
                                    <Icon name="eye-outline" color="#318bfb"
                                        size={20} />
                                )
                            }
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={_onLogin}
                        disabled={!allowLogin}
                        activeOpacity={0.6} style={{
                            ...styles.btnLogin,
                            opacity: allowLogin ? 1 : 0.6
                        }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#fff',
                            fontWeight: '500'
                        }}>Login</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.otherOptionsWrapper}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotPassword}
                        activeOpacity={1}>
                        <Text style={{
                            textAlign: 'center',
                            fontSize: 12,
                            fontWeight: '600'
                        }}>
                            <Text style={{
                                fontWeight: '500',
                                color: '#333'
                            }}>Did your forget your login information?
                            </Text> Get helping to login.</Text>
                    </TouchableOpacity>
                    <View style={styles.divideLine}>
                        <View style={styles.ORtextWrapper}>
                            <Text style={{
                                color: '#333',
                                fontWeight: '600'
                            }}>OR</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.btnLoginWithFacebook}>
                        <Icon name="facebook" color="#318bfb" size={20} />
                        <Text style={{
                            color: '#318bfb',
                            fontWeight: 'bold'
                        }}>Login with Facebook</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                onPress={_onPressRegister}
                activeOpacity={1}
                style={styles.registerWrapper}>
                <Text style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: '600'
                }}>
                    <Text style={{
                        fontWeight: '500',
                        color: '#333'
                    }}>Don't have account?
                            </Text> Register now.</Text>
            </TouchableOpacity>
        </SafeAreaView >
    )
}

export default Login
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: SCREEN_HEIGHT
    },
    languageChooser: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnCurLanguage: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    curLanguage: {
        color: '#333'
    },
    centerContainer: {
        height: SCREEN_HEIGHT - 50 - 40 - STATUS_BAR_HEIGHT,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoWrapper: {
        marginBottom: 20
    },
    logo: {
        height: 64,
        overflow: 'hidden'
    },
    loginForm: {
        width: SCREEN_WIDTH * 0.9,
    },
    textInputWrapper: {
        position: 'relative',
        width: '100%',
        height: 44,
        borderRadius: 5,
        borderColor: '#ddd',
        borderWidth: 1,
        marginVertical: 7.5
    },
    hidePasswordIcon: {
        position: 'absolute',
        height: 30,
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        right: 5,
        top: (44 - 30) / 2
    },
    input: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 15
    },
    btnLogin: {
        marginTop: 7.5,
        width: '100%',
        height: 44,
        borderRadius: 5,
        backgroundColor: '#318bfb',
        justifyContent: 'center',
        alignItems: 'center'
    },
    otherOptionsWrapper: {
        width: SCREEN_WIDTH * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotPassword: {
        width: SCREEN_WIDTH * 0.8,
        marginVertical: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    divideLine: {
        marginVertical: 10,
        position: 'relative',
        height: 2,
        width: '100%',
        backgroundColor: '#ddd',
    },
    ORtextWrapper: {
        width: 40,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        top: (2 - 20) / 2,
        left: (SCREEN_WIDTH * 0.9 - 40) / 2,
        position: 'absolute',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    btnLoginWithFacebook: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    registerWrapper: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: '#ddd',
        borderTopWidth: 1
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
})
function getEventHandlers(sethidePassword: React.Dispatch<React.SetStateAction<boolean>>, hidePassword: boolean, password: string, setallowLogin: React.Dispatch<React.SetStateAction<boolean>>, setUsername: React.Dispatch<React.SetStateAction<string>>, username: string, setPassword: React.Dispatch<React.SetStateAction<string>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, dispatch: ThunkDispatch<{}, {}, userAction>) {
    const _onPressToggleHidePassword = (): void => {
        sethidePassword(!hidePassword)
    }
    const _onChangeUsername = (text: string): void => {
        allowLoginCheck(text, password, setallowLogin)
        setUsername(text)
    }
    const _onChangePassword = (text: string): void => {
        allowLoginCheck(username, text, setallowLogin)
        setPassword(text)
    }
    const _onPressRegister = (): void => {
        navigation.navigate('Register')
    }
    const _onLogin = async () => {
        setLoading(true)
        const loginData: userLoginWithEmail = {
            email: username,
            password,
        }
        await dispatch(LoginRequest(loginData))
        setLoading(false)
    }
    return { _onChangeUsername, _onChangePassword, _onPressToggleHidePassword, _onLogin, _onPressRegister }
}

function allowLoginCheck(username: string, password: string, setallowLogin: React.Dispatch<React.SetStateAction<boolean>>) {
    if (username.length > 0 && password.length > 0)
        setallowLogin(true)
    else
        setallowLogin(false)
}

