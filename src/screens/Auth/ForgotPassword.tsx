import React, { useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Animated } from 'react-native'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { auth, firestore } from 'firebase'
import NavigationBar from '../../components/NavigationBar'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { commonParamList } from '../../navigations/RootTab'

type ForgotPasswordRouteProp = RouteProp<commonParamList, 'ForgotPassword'>

type ForgotPasswordNavigationProp = StackNavigationProp<commonParamList, 'ForgotPassword'>

type ForgotPasswordProps = {
    navigation: ForgotPasswordNavigationProp,
    route: ForgotPasswordRouteProp
}
const ForgotPassword = ({ navigation }: ForgotPasswordProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [sendingReset, setSendingReset] = useState<boolean>(false)
    const [sentReset, setSentReset] = useState(false)
    const [usernameError, setUsernameError] = useState<boolean>(false)
    const [username, setUsername] = useState<string>('')
    const _loadingDeg = new Animated.Value(0)
    const _loadingDeg2 = new Animated.Value(0)
    const { _loadingDegAnimation2, _loadingDegAnimation } =
        getAnimationActions(_loadingDeg, loading, _loadingDeg2, sendingReset)
    const _checkExistUsername = async () => {
        setLoading(true)
        const usersRef = firestore().collection('users')
        const emailCheck = await usersRef
            .where('email', '==', username).get()
        const usernameCheck = await usersRef
            .where('username', '==', username).get()
        const phoneCheck = await usersRef
            .where('phone', '==', username).get()
        if (emailCheck.size + usernameCheck.size + phoneCheck.size === 0) {
            setUsernameError(true)
            setLoading(false)
        } else {
            setLoading(false)
            setUsernameError(false)
            setSentReset(true)
            setSendingReset(true)
            if (emailCheck.size > 0) {
                await auth()
                    .sendPasswordResetEmail(emailCheck.docs[0].data().email)
            } else if (usernameCheck.size > 0) {
                await auth()
                    .sendPasswordResetEmail(usernameCheck.docs[0].data().email)
            } else if (phoneCheck.size > 0) {
                // await auth().sendPasswordResetEmail
            }
            setSendingReset(false)

        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <NavigationBar title={sentReset ? 'Access Account' : 'Login Help'}
                    callback={() => navigation.goBack()}
                />
            </View>
            {sentReset ?
                <View style={styles.afterSentContainer}>
                    <View style={styles.infoLine}>
                        <Icon name="email" size={24} />
                        <Text style={{
                            marginLeft: 10,
                            fontWeight: '500'
                        }}>{sendingReset ? 'Sending Email' : 'Sent Email'}</Text>
                        {sendingReset && <Animated.Image onLayout={_loadingDegAnimation2} style={{
                            marginLeft: 10,
                            height: 24,
                            width: 24,
                            transform: [
                                {
                                    rotate: _loadingDeg2
                                        .interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg',
                                                '360deg']
                                        })
                                }
                            ]
                        }} source={require('../../assets/icons/waiting.png')} />}
                    </View>
                    <TouchableOpacity activeOpacity={0.8} style={styles.infoLine}>
                        <Icon name="facebook" size={24} />
                        <Text style={{
                            marginLeft: 10,
                            fontWeight: '500'
                        }}>Login with Facebook</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} style={styles.sendingDescription}>
                        <Text style={{
                            fontWeight: "300"
                        }}>An email has been sent to your account's email address. Please check your email to continue. If you are still having problems
                        , please visit the <Text style={{
                                fontWeight: '500'
                            }}>
                                Help Center</Text></Text>
                    </TouchableOpacity>
                </View>
                :
                <View style={styles.centerContainer}>
                    <View>
                        <Text style={{
                            fontSize: 24,
                            textAlign: 'center'
                        }}>Find Your Account</Text>
                        <Text style={{
                            marginVertical: 20,
                            color: '#666',
                            textAlign: 'center'
                        }}>Enter your Instagram username or the email or phone number linked to account.</Text>
                    </View>
                    <View style={styles.formWrapper}>
                        <View style={{
                            ...styles.inputWrapper,
                            borderColor: usernameError ? 'red' : '#ddd'
                        }}>
                            <TextInput
                                value={username}
                                onChangeText={(e: string) => setUsername(e)}
                                autoFocus={true}
                                placeholder="Username, email or phone"
                                autoCapitalize="none"
                                style={styles.input} />
                        </View>
                        <TouchableOpacity
                            onPress={_checkExistUsername}
                            activeOpacity={0.8}
                            style={styles.btnNext}>
                            {!loading && <Text style={{
                                fontWeight: '600',
                                color: '#fff'
                            }}>Next</Text>}
                            {loading && <Animated.Image
                                onLayout={_loadingDegAnimation}
                                style={{
                                    ...styles.loadingIcon,
                                    position: 'absolute',
                                    transform: [
                                        {
                                            rotate: _loadingDeg
                                                .interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg',
                                                        '360deg']
                                                })
                                        }
                                    ]
                                }}
                                source={require('../../assets/icons/loading.png')} />}
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
            }
            <TouchableOpacity activeOpacity={1} style={styles.bottomHelp}>
                <Text style={{
                    color: '#318bfb'
                }}>Need more help?</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default ForgotPassword
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - 50
    },
    afterSentContainer: {
        width: '100%',
        padding: 20,
        height: '100%'
    },
    infoLine: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5
    },
    sendingDescription: {
        marginVertical: 10
    },
    formWrapper: {
        width: SCREEN_WIDTH * 0.9,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnNext: {
        marginVertical: 20,
        width: '100%',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#318bfb',
        borderRadius: 5
    },
    inputWrapper: {
        width: '100%',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(242,242,242)',
        borderColor: '#ddd',
        borderWidth: 1,
        overflow: 'hidden',
        borderRadius: 5
    },
    input: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 15
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
    loadingIcon: {
        width: 36,
        height: 36,
    },
    bottomHelp: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
function getAnimationActions(_loadingDeg: Animated.Value, loading: boolean, _loadingDeg2: Animated.Value, sendingReset: boolean) {
    const _loadingDegAnimation = () => {
        Animated.timing(_loadingDeg, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            if (loading) {
                _loadingDeg.setValue(0)
                _loadingDegAnimation()
            }
        })
    }
    const _loadingDegAnimation2 = () => {
        Animated.timing(_loadingDeg2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            if (sendingReset) {
                _loadingDeg2.setValue(0)
                _loadingDegAnimation2()
            }
        })
    }
    return { _loadingDegAnimation2, _loadingDegAnimation }
}

