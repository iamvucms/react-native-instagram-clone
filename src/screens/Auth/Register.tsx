import React, { useState, useEffect } from 'react'
import {
    StyleSheet, Text, View,
    TouchableOpacity, Image, TextInput,
    KeyboardAvoidingView, Keyboard,
    Animated,
    ScrollView,
    SafeAreaView
} from 'react-native'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { Formik, FormikProps, FormikValues, FormikHelpers } from 'formik'
import * as yup from 'yup'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Easing } from 'react-native'
import { navigation } from '../../navigations/rootNavigation'
import DatePicker, { MONTH_ALIAS } from '../../components/DatePicker'

export interface RegisterFormValuesStep1 {
    phone: string,
    email: string,
}
export interface RegisterFormValuesStep2 {
    fullname: string,
    password: string,
    savePassword: boolean
}
export interface RegisterFormValuesStep3 {
    date: number,
    month: number,
    year: number
}
const Register = () => {
    const _loadingDeg = new Animated.Value(0)
    const _loadingOpacity = new Animated.Value(0)
    const [email, setEmail] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [fullname, setFullname] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [birthday, setBirthday] = useState<RegisterFormValuesStep3>({
        date: 1,
        month: 1,
        year: 2020
    })
    const [step, setStep] = useState<number>(1)
    const [validating, setValidating] = useState<boolean>(false)
    const [currentTab, setCurrentTab] = useState<number>(1)
    const _onToggleTab = (type: number): void => setCurrentTab(type)
    const _onPressNextStep = (): void => {
    }
    const _onValidatedStep1 = (values: RegisterFormValuesStep1) => {
        setStep(step + 1)
        setEmail(values.email)
        setPhone(values.phone)
    }
    const _onValidatedStep2 = (values: RegisterFormValuesStep2): void => {
        setStep(step + 1)
        setFullname(values.fullname)
        setPassword(values.password)
    }
    const _onValidatedStep3 = (values: RegisterFormValuesStep3): void => {
        if (Math.floor(((new Date).getTime() - (new Date(`${MONTH_ALIAS[values.month]} ${values.date}, ${values.year}`).getTime())) / (1000 * 60 * 60 * 24 * 365)) > 5) {
            setBirthday(values)
            setStep(step + 1)
        }
    }
    const _startLoadingAnimation = (times: number) => {
        _loadingDeg.setValue(0)
        _loadingOpacity.setValue(1)
        setTimeout(() => {
            _loadingOpacity.setValue(0)
        }, 400 * times + 100)

        Animated.timing(_loadingDeg, {
            toValue: times,
            duration: 400 * times,
            useNativeDriver: true,
            easing: Easing.linear
        }).start()
    }
    const SchemaStep1 = yup.object().shape({
        phone: yup.string().when('email', {
            is: (email: string) => !email || currentTab === 1,
            then: yup.string().matches(/\d+/).required()
        }),
        email: yup.string().when('phone', {
            is: (phone: string) => !phone || currentTab === 2,
            then: yup.string().email().required()
        })
    }, [['phone', 'email']])
    const SchemaStep2 = yup.object().shape({
        fullname: yup.string().matches(/[a-zA-Z]+/).required(),
        password: yup.string().min(7, 'Password must be more than 6 character').required(),
        savePassword: yup.boolean().required()
    })
    const SchemaStep3 = yup.object().shape({
        date: yup.number().min(1).max(31).required(),
        month: yup.string().min(0).max(11).required(),
        year: yup.number().min(1900).max(2020).required()
    })
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="height" style={{
                ...styles.centerContainer,
                height: step > 1
                    ? step === 2
                        ? SCREEN_HEIGHT - 100 - STATUS_BAR_HEIGHT :
                        'auto'
                    : SCREEN_HEIGHT - 50 - STATUS_BAR_HEIGHT,
                width: step === 3 ? '100%' : 0.9 * SCREEN_WIDTH
            }}>
                {step === 1 && (
                    <Formik
                        validateOnBlur={false}
                        validateOnChange={false}
                        onSubmit={_onValidatedStep1}
                        validationSchema={SchemaStep1} initialValues={{
                            phone: '',
                            email: '',
                        }}>
                        {(formikProps: FormikProps<RegisterFormValuesStep1>) => (
                            <>
                                <View>
                                    <Image source={require('../../assets/icons/account.png')} />
                                </View>
                                <View style={styles.usernameTypesWrapper}>
                                    <View style={styles.navigationTabs}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={_onToggleTab.bind(null, 1)}
                                            style={{
                                                ...styles.navigationTab,
                                            }}>
                                            <Text style={{
                                                ...styles.tabTitle,
                                                color: currentTab === 1 ? '#000' : "#666"
                                            }}>PHONE</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={_onToggleTab.bind(null, 2)}
                                            style={{
                                                ...styles.navigationTab,
                                            }}>
                                            <Text style={{
                                                ...styles.tabTitle,
                                                color: currentTab === 2 ? '#000' : "#666"
                                            }}>EMAIL</Text>
                                        </TouchableOpacity>
                                        <View style={{
                                            ...styles.activeTypeLine,
                                            left: currentTab === 1 ? 0 : '50%'
                                        }} />
                                    </View>
                                    <View style={styles.usernameForm}>
                                        {currentTab === 1 && (<View style={styles.usePhone}>
                                            <View style={{
                                                ...styles.inputWrapper,
                                                borderColor: formikProps.touched.phone
                                                    && formikProps.errors.phone ? 'red' : '#ddd'
                                            }}>
                                                <TouchableOpacity style={styles.btnPhoneCode}>
                                                    <View style={styles.phoneCodeTitleWrapper}>
                                                        <Text style={{
                                                            fontWeight: '600',
                                                            color: '#666'
                                                        }}>VN +84</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TextInput
                                                    onBlur={formikProps.handleBlur('phone')}
                                                    onChangeText={(e) => {
                                                        formikProps.handleChange('phone')(e)
                                                        formikProps.setFieldTouched('phone', false, false)
                                                    }}
                                                    autoFocus={true}
                                                    placeholder="Phone"
                                                    keyboardType="number-pad"
                                                    returnKeyType="done"
                                                    style={styles.inputPhone}
                                                    value={formikProps.values.phone} />

                                                <TouchableOpacity
                                                    onPress={() => formikProps.setFieldValue('phone', '')}
                                                    style={styles.btnReset}>
                                                    {formikProps.values.phone.length > 0
                                                        && <Text>✕</Text>}
                                                </TouchableOpacity>
                                            </View>
                                            {formikProps.touched.phone
                                                && formikProps.errors.phone &&
                                                <Text style={styles.errorText}>
                                                    Please input a valid phone number.
                                            </Text>
                                            }
                                        </View>)}
                                        {currentTab === 2 && (<View style={styles.useEmail}>
                                            <View style={{
                                                ...styles.inputWrapper,
                                                borderColor: formikProps.touched.email
                                                    && formikProps.errors.email ? 'red' : '#ddd'
                                            }}>
                                                <TextInput
                                                    onBlur={formikProps.handleBlur('email')}
                                                    onChangeText={(e) => {
                                                        formikProps.handleChange('email')(e)
                                                        formikProps.setFieldTouched('email', false, false)
                                                    }}
                                                    autoFocus={true}
                                                    placeholder="Email"
                                                    keyboardType="email-address"
                                                    returnKeyType="done"
                                                    style={styles.input}
                                                    value={formikProps.values.email} />

                                                <TouchableOpacity
                                                    onPress={
                                                        () => formikProps
                                                            .setFieldValue('email', '')
                                                    }
                                                    style={styles.btnReset}>
                                                    {formikProps.values.email.length > 0
                                                        && <Text>✕</Text>}
                                                </TouchableOpacity>
                                            </View>
                                            {formikProps.touched.email
                                                && formikProps.errors.email &&
                                                <Text style={styles.errorText}>
                                                    Please input a valid email.
                                            </Text>
                                            }
                                        </View>)}
                                        <TouchableOpacity
                                            onPress={() => {
                                                _startLoadingAnimation(1)
                                                formikProps.handleSubmit()
                                            }}
                                            activeOpacity={0.8} style={styles.btnNextStep}>
                                            <Animated.Text style={{
                                                opacity: Animated.subtract(1, _loadingOpacity),
                                                fontWeight: '600',
                                                color: '#fff'
                                            }}>Next</Animated.Text>
                                            <Animated.Image
                                                style={{
                                                    ...styles.loadingIcon,
                                                    position: 'absolute',
                                                    opacity: _loadingOpacity,
                                                    transform: [
                                                        {
                                                            rotate: _loadingDeg
                                                                .interpolate({
                                                                    inputRange: [0, 100],
                                                                    outputRange: ['0deg',
                                                                        '36000deg']
                                                                })
                                                        }
                                                    ]
                                                }}
                                                source={
                                                    require('../../assets/icons/loading.png')
                                                } />

                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}

                    </Formik>
                )}
                {step === 2 && (
                    <Formik onSubmit={_onValidatedStep2}
                        validateOnBlur={false}
                        validateOnChange={false}
                        validationSchema={SchemaStep2}
                        initialValues={{
                            fullname: '',
                            password: '',
                            savePassword: true
                        }}
                    >
                        {(formikProps: FormikProps<RegisterFormValuesStep2>) => (
                            <View style={styles.step2Wrapper}>
                                <View style={styles.step2Title}>
                                    <Text style={{
                                        fontWeight: 'bold'
                                    }}>NAME AND PASSWORD</Text>
                                </View>
                                <View style={styles.step2FormWrapper}>
                                    <View style={styles.formGroupWrapper}>
                                        <View style={{
                                            ...styles.inputWrapper,
                                            borderColor: formikProps.touched.fullname
                                                && formikProps.errors.fullname ? 'red' : '#ddd'
                                        }}>
                                            <TextInput
                                                autoCorrect={false}
                                                autoCapitalize='none'
                                                onBlur={formikProps.handleBlur('fullname')}
                                                onChangeText={(e) => {
                                                    formikProps.handleChange('fullname')(e)
                                                    formikProps.setFieldTouched('fullname', false, false)
                                                    formikProps.setErrors({ fullname: undefined })
                                                }}
                                                autoFocus={true}
                                                placeholder="Full name"
                                                keyboardType="default"
                                                returnKeyType="done"
                                                style={styles.input}
                                                value={formikProps.values.fullname} />

                                            <TouchableOpacity
                                                onPress={
                                                    () => formikProps
                                                        .setFieldValue('fullname', '')
                                                }
                                                style={styles.btnReset}>
                                                {formikProps.values.fullname.length > 0
                                                    && <Text>✕</Text>}
                                            </TouchableOpacity>
                                        </View>
                                        {formikProps.touched.fullname
                                            && formikProps.errors.fullname &&
                                            <Text style={styles.errorText}>
                                                Please input your full name.
                                            </Text>
                                        }
                                    </View>
                                    <View style={styles.formGroupWrapper}>
                                        <View style={{
                                            ...styles.inputWrapper,
                                            borderColor: formikProps.touched.password
                                                && formikProps.errors.password ? 'red' : '#ddd'
                                        }}>
                                            <TextInput
                                                onBlur={formikProps.handleBlur('password')}
                                                onChangeText={(e) => {
                                                    formikProps.handleChange('password')(e)
                                                    formikProps
                                                        .setFieldTouched('password', false, false)
                                                    formikProps.setErrors({ fullname: undefined })
                                                }}
                                                secureTextEntry={true}
                                                placeholder="Password"
                                                keyboardType="default"
                                                returnKeyType="done"
                                                style={styles.input}
                                                value={formikProps.values.password} />

                                            <TouchableOpacity
                                                onPress={
                                                    () => formikProps
                                                        .setFieldValue('password', '')
                                                }
                                                style={styles.btnReset}>
                                                {formikProps.values.password.length > 0
                                                    && <Text>✕</Text>}
                                            </TouchableOpacity>
                                        </View>
                                        {formikProps.touched.password
                                            && formikProps.errors.password &&
                                            <Text style={styles.errorText}>
                                                Password must be more than 6 characters.
                                            </Text>
                                        }
                                        <TouchableOpacity
                                            style={styles.savePassword}
                                            activeOpacity={1}
                                            onPress={() => {
                                                formikProps.
                                                    setFieldValue('savePassword',
                                                        !formikProps.values.savePassword)
                                            }} >
                                            <View style={{
                                                ...styles.checkbox,
                                                backgroundColor: formikProps.values.savePassword
                                                    ? '#318bfb' : '#fff',
                                                borderColor: formikProps.values.savePassword
                                                    ? '#318bfb' : '#ddd',
                                            }}>
                                                <Text style={{
                                                    color: '#fff',
                                                    fontWeight: '600',
                                                }}>✓</Text>
                                            </View>
                                            <Text style={{
                                                color: '#666',
                                            }}>Save password</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            _startLoadingAnimation(1)
                                            formikProps.handleSubmit()
                                        }}
                                        activeOpacity={0.8} style={styles.btnNextStep}>
                                        <Animated.Text style={{
                                            opacity: Animated.subtract(1, _loadingOpacity),
                                            fontWeight: '600',
                                            color: '#fff'
                                        }}>Continue Without Syncing Contacts</Animated.Text>
                                        <Animated.Image
                                            style={{
                                                ...styles.loadingIcon,
                                                position: 'absolute',
                                                opacity: _loadingOpacity,
                                                transform: [
                                                    {
                                                        rotate: _loadingDeg
                                                            .interpolate({
                                                                inputRange: [0, 100],
                                                                outputRange: ['0deg',
                                                                    '36000deg']
                                                            })
                                                    }
                                                ]
                                            }}
                                            source={
                                                require('../../assets/icons/loading.png')
                                            } />

                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Text style={{
                                            fontWeight: '600',
                                            color: '#318bfb'
                                        }}>
                                            Continue Without Syncing Contacts
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Formik>
                )}
                {step === 3 && (
                    <ScrollView
                        bounces={false}
                        style={styles.step3ScrollView}>
                        <Formik
                            validateOnBlur={false}
                            validateOnChange={false}
                            onSubmit={_onValidatedStep3}
                            validationSchema={SchemaStep3}
                            initialValues={birthday}
                        >
                            {(formikProps: FormikProps<RegisterFormValuesStep3>) => (
                                <View style={styles.step3Wrapper}>
                                    <View>
                                        <Image style={styles.birthdayIcon}
                                            source={require('../../assets/images/rocket.png')} />
                                    </View>
                                    <Text style={{
                                        marginVertical: 15,
                                        fontWeight: '500',
                                        fontSize: 18
                                    }}>ADD BIRTHDAY</Text>
                                    <View style={{
                                        width: SCREEN_WIDTH * 0.7,
                                        marginBottom: 15,
                                    }}>
                                        <Text style={{
                                            textAlign: 'center'
                                        }}>
                                            This won't be part of your public profile.
                                            Why do I need to provide my birthday?
                                        </Text>
                                    </View>
                                    <View style={styles.birthdayInputWrapper}>
                                        <View style={styles.birthdayInput}>
                                            <Text>
                                                {MONTH_ALIAS[formikProps.values.month]} {formikProps.values.date}, {formikProps.values.year} </Text>
                                            <View style={styles.currentYear}>
                                                <Text style={{
                                                    color: isEnoughAge(formikProps) ? "#000" : 'red'
                                                }}>{getAges(formikProps)} Years Old</Text>
                                            </View>
                                        </View>
                                        {!isEnoughAge(formikProps) && (
                                            <Text style={{
                                                color: '#666',
                                                marginVertical: 2.5
                                            }}>You need to input your birthday.</Text>
                                        )}

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{
                                                marginVertical: 10,
                                                textAlign: 'center',
                                                color: '#666'
                                            }}>Use your own birthday, even if this account is for a bussiness, a pet or something else.</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            _startLoadingAnimation(1)
                                            formikProps.handleSubmit()
                                        }}
                                        activeOpacity={0.8}
                                        style={{
                                            ...styles.btnNextStep,
                                            width: SCREEN_WIDTH * 0.9
                                        }}>
                                        <Animated.Text style={{
                                            opacity: Animated.subtract(1, _loadingOpacity),
                                            fontWeight: '600',
                                            color: '#fff'
                                        }}>Next</Animated.Text>
                                        <Animated.Image
                                            style={{
                                                ...styles.loadingIcon,
                                                position: 'absolute',
                                                opacity: _loadingOpacity,
                                                transform: [
                                                    {
                                                        rotate: _loadingDeg
                                                            .interpolate({
                                                                inputRange: [0, 100],
                                                                outputRange: ['0deg',
                                                                    '36000deg']
                                                            })
                                                    }
                                                ]
                                            }}
                                            source={
                                                require('../../assets/icons/loading.png')
                                            } />

                                    </TouchableOpacity>
                                    <DatePicker
                                        defaultDate={1}
                                        defaultMonth="Jan"
                                        defaultYear={2020}
                                        onDateChange={(date: number) => {
                                            formikProps.handleChange('date')(`${date}`)
                                        }}
                                        onMonthIndexChange={(index: number) => {
                                            formikProps.handleChange('month')(`${index}`)
                                        }}
                                        onYearChange={(year: number) => {
                                            formikProps.handleChange('year')(`${year}`)
                                        }}
                                    />

                                </View>

                            )}
                        </Formik>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
            {
                step === 2 &&
                <View style={styles.syncContactDescription}>
                    <Text style={{
                        color: '#666',
                        fontSize: 12
                    }}>Your contacts will be periodically synced and stored on Instagram
                        servers to help you and others find friends, and to help us provide a better service.
                        To remove contact, go to Settings and disconnect.
                        <Text style={{
                            color: '#000'
                        }}> Learn More</Text>
                    </Text>
                </View>
            }
            {
                step === 1 && < TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={1}
                    style={styles.btnLogin}>
                    <Text style={{
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: '600'
                    }}>
                        <Text style={{
                            fontWeight: '500',
                            color: '#333'
                        }}>Already have account?
                            </Text> Login.</Text>
                </TouchableOpacity>
            }
        </SafeAreaView >
    )
}

export default React.memo(Register)

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    centerContainer: {
        width: SCREEN_WIDTH * 0.9,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    usernameTypesWrapper: {
        width: '100%',
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    navigationTabs: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 0.5,
        position: 'relative'
    },
    activeTypeLine: {
        height: 1,
        width: '50%',
        backgroundColor: '#000',
        position: 'absolute',
        bottom: 0
    },
    navigationTab: {
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50
    },
    tabTitle: {
        fontWeight: '600'
    },
    usernameForm: {
        marginVertical: 20,
        width: '100%'
    },
    usePhone: {
        width: '100%'
    },
    useEmail: {
        width: '100%'
    },
    inputWrapper: {
        borderRadius: 5,
        overflow: 'hidden',
        borderColor: '#ddd',
        borderWidth: 1,
        width: '100%',
        position: 'relative',
    },
    input: {
        width: '100%',
        height: 44,
        paddingHorizontal: 15,
        backgroundColor: 'rgb(242,242,242)'
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
        width: '100%',
        height: 44,
        paddingRight: 44,
        paddingLeft: 90,
        backgroundColor: 'rgb(242,242,242)'
    },
    btnReset: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0
    },
    errorText: {
        color: 'red',
        marginVertical: 5,
    },
    btnNextStep: {
        width: '100%',
        height: 46,
        backgroundColor: '#318bfb',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        borderRadius: 5
    },

    //STEP2 STYLES
    step2Wrapper: {
        width: '100%'
    },
    step2Title: {
        marginVertical: 25,
        alignItems: 'center'
    },
    step2FormWrapper: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    formGroupWrapper: {
        marginVertical: 7.5,
        width: '100%'
    },
    savePassword: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    checkbox: {
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 18,
        width: 18,
        borderRadius: 2,
        borderWidth: 3
    },
    syncContactDescription: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 0.05 * SCREEN_WIDTH
    },
    //STEP 3 STYLES
    step3ScrollView: {
        width: '100%',
    },
    step3Wrapper: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20
    },
    birthdayIcon: {
        height: 64,
        width: 64
    },
    birthdayInputWrapper: {
        width: '100%',
        paddingHorizontal: 0.05 * SCREEN_WIDTH
    },
    birthdayInput: {
        position: 'relative',
        backgroundColor: 'rgb(242,242,242)',
        width: '100%',
        height: 44,
        justifyContent: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
    },
    currentYear: {
        position: 'absolute',
        paddingHorizontal: 15,
        height: 44,
        justifyContent: 'center',
        top: 0,
        right: 0
    },
    //
    btnLogin: {
        height: 50,
        borderTopColor: '#ddd',
        borderTopWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
function getAges(formikProps: FormikProps<RegisterFormValuesStep3>): React.ReactNode {
    return Math.floor(((new Date).getTime() - (new Date(`${MONTH_ALIAS[formikProps.values.month]} ${formikProps.values.date}, ${formikProps.values.year}`).getTime())) / (1000 * 60 * 60 * 24 * 365))
}

function isEnoughAge(formikProps: FormikProps<RegisterFormValuesStep3>) {
    return Math.floor(((new Date).getTime() - (new Date(`${MONTH_ALIAS[formikProps.values.month]} ${formikProps.values.date}, ${formikProps.values.year}`).getTime())) / (1000 * 60 * 60 * 24 * 365)) > 5
}

