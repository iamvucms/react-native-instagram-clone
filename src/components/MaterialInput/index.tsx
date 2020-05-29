import React, { useRef, useState, useEffect } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View, Animated, TextInputProps, StyleProp, ViewStyle } from 'react-native'
export interface InputProps extends TextInputProps {
    value: string,
    onChangeText: React.Dispatch<React.SetStateAction<string>>,
    name: string,
    containerStyle?: StyleProp<ViewStyle>,
    errorMsg?: string
}
const MaterialInput = ({
    errorMsg,
    containerStyle,
    value,
    name,
    onChangeText,
    ...rest
}: InputProps) => {
    const ref = useRef<{ value: string, animated: boolean }>({ value: '', animated: false })
    const inputRef = useRef<TextInput>(null)
    const _labelAnimationValue = React.useMemo(() => new Animated.Value(0), [])
    useEffect(() => {
        ref.current.value = value
        if (value.length > 0 && !ref.current.animated) {
            ref.current.animated = true
            Animated.timing(_labelAnimationValue, {
                duration: 200,
                toValue: 1,
                useNativeDriver: false
            }).start(() => { })
        }
    }, [value])
    const _onFocusInput = () => {
        inputRef.current && inputRef.current.focus()
        if (ref.current.value.length === 0) {
            ref.current.animated = true
            Animated.timing(_labelAnimationValue, {
                duration: 200,
                toValue: 1,
                useNativeDriver: false
            }).start(() => { })
        }
    }
    const _onBlurInput = () => {
        if (ref.current.value.length === 0) {
            ref.current.animated = false
            Animated.timing(_labelAnimationValue, {
                duration: 200,
                toValue: 0,
                useNativeDriver: false
            }).start(() => { })
        }
    }
    return (
        <View style={[containerStyle, {
            height: 66
        }]}>
            <View style={styles.inputContainer}>
                <TextInput
                    {...rest}
                    value={value}
                    onFocus={_onFocusInput}
                    onBlur={_onBlurInput}
                    onChangeText={onChangeText}
                    ref={inputRef} style={styles.textInput} />
                <Animated.View
                    style={{
                        ...styles.label,
                        top: _labelAnimationValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['25%', '-50%']
                        }),
                        left: _labelAnimationValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0]
                        }),
                    }}>
                    <TouchableOpacity
                        onPress={_onFocusInput}
                        style={{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                        }}
                        activeOpacity={1}>
                        <Animated.Text style={{

                            fontSize: _labelAnimationValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [16, 12]
                            }),
                            color: errorMsg ? 'red' : "#999"
                        }}>
                            {name}
                        </Animated.Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View >
    )
}

export default MaterialInput

const styles = StyleSheet.create({
    inputContainer: {
        marginTop: 22,
        zIndex: 0,
        backgroundColor: "#fff",
        height: 44,
        width: '100%',
        borderBottomColor: '#ddd',
        borderBottomWidth: 2
    },
    label: {
        position: 'absolute',
        justifyContent: 'center',
        width: '100%',
        height: '50%',
    },
    textInput: {
        fontSize: 16,
        height: '100%',
    }
})
