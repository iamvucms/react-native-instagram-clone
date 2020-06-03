import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Animated, Text, View, SafeAreaView, Image, TouchableOpacity, KeyboardAvoidingView, AlertButton, Alert } from 'react-native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack } from '../../../navigations/rootNavigation'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT, SCREEN_WIDTH } from '../../../constants'
import { useSelector } from '../../../reducers'
import MaterialInput from '../../../components/MaterialInput'
import { store } from '../../../store'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'
import { UpdateUserInfoRequest } from '../../../actions/userActions'
import { firestore } from 'firebase'
const EditProfile = () => {
    const dispatch = useDispatch()
    const fixedUser = store.getState().user.user.userInfo
    const [fullname, setFullname] = useState<string>(fixedUser?.fullname || '')
    const [username, setUsername] = useState<string>(fixedUser?.username || '')
    const [bio, setBio] = useState<string>(fixedUser?.bio || '')
    const [website, setWebsite] = useState<string>(fixedUser?.website || '')
    const [showModal, setShowModal] = useState<boolean>(false)
    const user = useSelector(state => state.user.user.userInfo)
    const _topOffsetMainContent = React.useMemo(() => new Animated.Value(1), [])
    const [updating, setUpdating] = useState<boolean>(false)
    const _loadingDeg = React.useMemo(() => new Animated.Value(0), [])
    const [usernameError, setUsernameError] = useState<string>('')
    const ref = useRef<{ timeout: NodeJS.Timeout }>({
        timeout: setTimeout(() => { }, 0)
    })
    /**
     * 1: general information
     * 2: email
     * 3: phone
     * 4: gender
     */
    useEffect(() => {
        return () => {
            _loadingDeg.stopAnimation()
            setUpdating(false)
        }
    }, [])
    useEffect(() => {
        clearTimeout(ref.current.timeout)
        ref.current.timeout = setTimeout(() => {
            checkExistUsername(username, user?.username, setUsernameError)
        }, 300);
    }, [username])
    const [inputFor, setInputFor] = useState<number>(1)

    const _onAnimateMainContent = () => {
        Animated.timing(_topOffsetMainContent, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
        }).start()
    }
    const _confirmGoBack = () => {
        if (inputFor !== 1) {
            setInputFor(1)
        } else {
            ///
            goBack()
        }

    }
    const _onDone = async () => {
        if (inputFor === 1) {
            setUpdating(true)
            await dispatch(UpdateUserInfoRequest({
                fullname,
                username,
                website,
                bio,
            }))
            setUpdating(false)
        }
    }
    const _animateLoading = () => {
        Animated.timing(_loadingDeg, {
            toValue: 1,
            useNativeDriver: true,
            duration: 300
        }).start(() => {
            if (updating) {
                _loadingDeg.setValue(0)
                _animateLoading()
            }
        })
    }
    return (
        <SafeAreaView>
            <View style={styles.customNavigationBar}>
                <NavigationBar title="Edit Profile" callback={_confirmGoBack} />
                <TouchableOpacity
                    disabled={updating}
                    onPress={_onDone}
                    style={styles.btnSave}>
                    {!updating ? <Image style={{
                        width: 20,
                        height: 20
                    }} source={require("../../../assets/icons/correct.png")} /> :
                        <Animated.Image
                            onLayout={_animateLoading}
                            style={{
                                width: 20,
                                height: 20,
                                transform: [{
                                    rotate: _loadingDeg.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg']
                                    })
                                }]
                            }} source={require("../../../assets/icons/waiting.png")} />
                    }

                </TouchableOpacity>
            </View>

            {showModal && <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowModal(false)}
                style={styles.modalWraper}>
                <View style={{
                    backgroundColor: '#fff',
                    width: '90%'
                }}>
                    <View style={{ backgroundColor: "#000" }}>
                        <View style={{
                            ...styles.changePhotoOptionItem,
                            borderBottomColor: '#ddd',
                            borderBottomWidth: 1
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600'
                            }}>Change Profile Photo</Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.changePhotoOptionItem}>
                            <Text style={{
                                fontSize: 16,
                            }}>New Profile Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.changePhotoOptionItem}>
                            <Text style={{
                                fontSize: 16,
                            }}>Remove Profile Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
            }<KeyboardAvoidingView
                behavior="padding"
                style={{
                    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
                }}>
                {inputFor === 1 && <Animated.ScrollView
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
                            <FastImage style={{
                                width: 92,
                                height: 92,
                                borderRadius: 92
                            }} source={{
                                uri: user?.avatarURL
                            }} />
                            <TouchableOpacity
                                onPress={() => setShowModal(true)}
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
                                errorMsg={usernameError.length > 0 ? usernameError : undefined}
                                autoCapitalize="none"
                                name="Username"
                                value={username}
                                onChangeText={setUsername}
                            />
                            <MaterialInput
                                containerStyle={{
                                    marginVertical: 10
                                }}
                                autoCapitalize="none"
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
                }
                {inputFor === 2 &&
                    <View>
                    </View>}
                {inputFor === 3 &&
                    <View>
                    </View>}
                {inputFor === 4 &&
                    <View>
                    </View>}
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
export default EditProfile

const styles = StyleSheet.create({
    modalWraper: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    changePhotoOptionItem: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        height: 44,
        justifyContent: 'center'
    },
    customNavigationBar: {
        position: 'relative'
    },
    btnSave: {
        position: 'absolute',
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
        right: 0,
        top: 0,
    },
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
function checkExistUsername(usr: string, curUsername: string | undefined,
    setUsernameError: React.Dispatch<React.SetStateAction<string>>, ) {
    if (usr === curUsername) return setUsernameError("");
    const pattern = /^[a-zA-Z0-9._]{4,}$/g
    if (!pattern.test(usr)) return setUsernameError("Username is not available.")

    firestore().collection('users')
        .where('username', '==', usr.trim())
        .get()
        .then(snap => {
            if (snap.size > 0) {
                setUsernameError("Username is existed.")
            } else
                setUsernameError('')
        }).catch(e => e)
}