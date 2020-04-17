import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Keyboard } from 'react-native'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants'
import { Formik, FormikProps, FormikValues, FormikHelpers } from 'formik'
import * as yup from 'yup'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'


export interface RegisterFormValues {
    phone: string,
    email: string,
    fullname: string,
    password: string
}
const Register = () => {
    const [step, setStep] = useState(1)
    const [currentTab, setCurrentTab] = useState(1)
    const _onToggleTab = (type: number): void => setCurrentTab(type)
    const _onValidated = (values: FormikValues) => console.warn(values)
    const _onPressNextStep = (): void => {

    }
    const Schema = yup.object().shape({
        phone: yup.number().min(8).when('email', {
            is: (email: string) => !email || currentTab === 1,
            then: yup.number().min(8).required()
        }),
        email: yup.string().email().when('phone', {
            is: (phone: string) => !phone || currentTab === 2,
            then: yup.string().email().required()
        }),
        fullname: yup.string().required(),
        password: yup.string()
            .required('No password provide')
            .matches(/[a-zA-Z]/)
            .min(8, 'Password is not strong')
    }, [['phone', 'email']])
    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior="height" style={styles.centerContainer}>
                <Formik
                    validateOnChange={false}
                    onSubmit={_onValidated}
                    validationSchema={Schema} initialValues={{
                        phone: '',
                        email: '',
                        fullname: '',
                        password: ''
                    }}>
                    {(formikProps: FormikProps<RegisterFormValues>) => (
                        <>
                            {console.warn(formikProps.values.phone)}
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
                                                <Text>X</Text>
                                            </TouchableOpacity>
                                        </View>
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
                                                style={styles.inputMail}
                                                value={formikProps.values.email} />

                                            <TouchableOpacity
                                                onPress={() => formikProps.setFieldValue('email', '')}
                                                style={styles.btnReset}>
                                                <Text>X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>)}
                                    <TouchableOpacity
                                        onPress={() => {
                                            formikProps.handleSubmit()
                                            _onPressNextStep()
                                        }}
                                        activeOpacity={0.8} style={styles.btnNextStep}>
                                        <Text style={{
                                            fontWeight: '600',
                                            color: '#fff'
                                        }}>Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}

                </Formik>
            </KeyboardAvoidingView>
            <TouchableOpacity
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
        </View>
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
        height: SCREEN_HEIGHT - 50,
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
    inputMail: {
        width: '100%',
        height: 44,
        paddingHorizontal: 15,
        backgroundColor: 'rgb(242,242,242)'
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
    btnNextStep: {
        height: 46,
        backgroundColor: '#318bfb',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        borderRadius: 5
    },
    btnLogin: {
        height: 50,
        borderTopColor: '#ddd',
        borderTopWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
