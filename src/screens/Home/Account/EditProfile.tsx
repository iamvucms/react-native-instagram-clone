import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'
import { UpdateUserInfoRequest } from '../../../actions/userActions'
import MaterialInput from '../../../components/MaterialInput'
import NavigationBar from '../../../components/NavigationBar'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT, DEFAULT_PHOTO_URI } from '../../../constants'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { store } from '../../../store'
import Radio from '../../../components/Radio'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Yup, { string } from 'yup'
import { useSelector } from '../../../reducers'
const EditProfile = () => {
    const dispatch = useDispatch()
    const preUser = store.getState().user.user.userInfo
    const [fullname, setFullname] = useState<string>(preUser?.fullname || '')
    const [username, setUsername] = useState<string>(preUser?.username || '')
    const [bio, setBio] = useState<string>(preUser?.bio || '')
    const [website, setWebsite] = useState<string>(preUser?.website || '')
    const user = useSelector(state => state.user.user.userInfo)
    const [email, setEmail] = useState<string>(user?.email || '')
    const [phone, setPhone] = useState<string>(user?.phone || '')
    const [gender, setGender] = useState<0 | 1 | 2>(user?.gender || 0)
    const [showModal, setShowModal] = useState<boolean>(false)
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
    const [inputFor, setInputFor] = useState<1 | 2 | 3 | 4>(1)

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
            setEmail(user?.email || '')
            setPhone(user?.phone || '')
            setGender(user?.gender || 0)
        } else {
            goBack()
        }
    }
    const _onDone = async () => {
        setUpdating(true)
        switch (inputFor) {
            case 1:
                await dispatch(UpdateUserInfoRequest({
                    fullname,
                    username,
                    website,
                    bio,
                }))
                goBack()
                break;
            case 2:
                if (email === user?.email) {
                    setInputFor(1)
                } else {
                    const emailValidation = string().email()
                    emailValidation.validate(email).then(validatedEmail => {
                        firestore().collection('users').where('email', '==', validatedEmail)
                            .get().then(rs => {
                                if (rs.size > 0) {
                                    Alert.alert('Email is used', 'Another people used this email!')
                                } else {
                                    dispatch(UpdateUserInfoRequest({
                                        email: validatedEmail
                                    }))
                                    setInputFor(1)
                                }
                            })
                    }).catch(err => {
                        Alert.alert('Email is not valid!', 'You need input a vaild email')
                    })
                }
                break;
            case 3:
                if (phone === user?.phone) {
                    setInputFor(1)
                } else {
                    const phoneValidation = string().min(6).matches(/[0-9]{6,}/)
                    phoneValidation.validate(phone).then(validatedPhone => {
                        firestore().collection('users').where('phone', '==', validatedPhone)
                            .get().then(rs => {
                                if (rs.size > 0) {
                                    Alert.alert('Phone number is used', 'Another people used this phone number!')
                                } else {
                                    dispatch(UpdateUserInfoRequest({
                                        phone: validatedPhone
                                    }))
                                    setInputFor(1)
                                }
                            })
                    }).catch(err => {
                        Alert.alert('Phone number is not valid!', 'You need input a vaild phone number')
                    })
                }
                break;
            case 4:
                await dispatch(UpdateUserInfoRequest({
                    gender
                }))
                setInputFor(1)
                break;
        }
        setUpdating(false)
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
    const _removeProfilePhoto = async () => {
        await dispatch(UpdateUserInfoRequest({
            avatarURL: DEFAULT_PHOTO_URI
        }))
        goBack()
    }
    return (
        <SafeAreaView>
            <View style={styles.customNavigationBar}>
                <NavigationBar title={inputFor === 1 ? "Edit Profile" : (
                    inputFor === 2 ? 'Change Email' : (
                        inputFor === 3 ? 'Phone Number' : 'Gender'
                    )
                )} callback={_confirmGoBack} />
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
                            onPress={() => navigate('GalleryChooser', { isChooseProfilePhoto: true })}
                            activeOpacity={0.9}
                            style={styles.changePhotoOptionItem}>
                            <Text style={{
                                fontSize: 16,
                            }}>New Profile Photo</Text>
                        </TouchableOpacity>

                        {user?.avatarURL !== DEFAULT_PHOTO_URI &&
                            <TouchableOpacity
                                onPress={_removeProfilePhoto}
                                activeOpacity={0.9}
                                style={styles.changePhotoOptionItem}>
                                <Text style={{
                                    fontSize: 16,
                                }}>Remove Profile Photo</Text>
                            </TouchableOpacity>
                        }
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
                                onPress={() => setInputFor(2)}
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
                                onPress={() => setInputFor(3)}
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
                                onPress={() => setInputFor(4)}
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
                                    <Text>{user?.gender == 0 ? 'Famale'
                                        : (user?.gender === 1 ? 'Male'
                                            : 'Prefer Not to Say')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.ScrollView>
                }
                {inputFor === 2 &&
                    <View style={styles.popupScreen}>
                        <View style={styles.emailInputWrapper}>
                            <View style={{
                                height: '100%',
                                width: 44,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Icon name="email-outline" size={30} />
                            </View>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                autoCapitalize="none"
                                style={{
                                    width: SCREEN_WIDTH - 30 - 44,
                                    height: '100%'
                                }} />
                        </View>
                    </View>}
                {inputFor === 3 &&
                    <View style={styles.popupScreen}>
                        <View style={{
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: '600',
                                marginVertical: 20
                            }}>Enter Your Phone Number</Text>
                            <View style={{
                                ...styles.inputWrapper,
                            }}>
                                <TouchableOpacity style={styles.btnPhoneCode}>
                                    <View style={styles.phoneCodeTitleWrapper}>
                                        <Text style={{
                                            fontWeight: '600',
                                            color: '#318BFB'
                                        }}>VN +84</Text>
                                    </View>
                                </TouchableOpacity>
                                <TextInput
                                    onChangeText={setPhone}
                                    autoFocus={true}
                                    placeholder="Phone"
                                    keyboardType="number-pad"
                                    returnKeyType="done"
                                    style={styles.inputPhone}
                                    value={phone} />
                            </View>
                        </View>
                    </View>}
                {inputFor === 4 &&
                    <View style={styles.popupScreen}>
                        <Radio
                            labels={['Female', 'Male', 'Prefer Not to Say']}
                            values={[0, 1, 2]}
                            defaultSelected={gender}
                            onChange={setGender}
                        />
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
    },
    popupScreen: {
        paddingTop: 10,
        height: SCREEN_HEIGHT - 44 - STATUS_BAR_HEIGHT,
        width: '100%',
        backgroundColor: "#fff"
    },
    emailInputWrapper: {
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        height: 44,
        flexDirection: 'row',
        borderBottomColor: '#318bfb',
        borderBottomWidth: 1
    },
    inputWrapper: {
        borderRadius: 5,
        overflow: 'hidden',
        borderColor: '#ddd',
        borderWidth: 1,
        width: SCREEN_WIDTH - 30,
        position: 'relative',
    },
    loadingIcon: {
        width: 36,
        height: 36,
    },
    btnPhoneCode: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        width: 80,
    },
    phoneCodeTitleWrapper: {
        paddingVertical: 5,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
        paddingHorizontal: 10
    },
    inputPhone: {
        fontSize: 16,
        width: '100%',
        height: 44,
        paddingRight: 44,
        paddingLeft: 90,
        backgroundColor: 'rgb(242,242,242)'
    },
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