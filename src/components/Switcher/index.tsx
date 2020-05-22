import React, { useRef, useState, RefObject, MutableRefObject, useEffect } from 'react'
import { StyleSheet, Animated, View, TouchableOpacity } from 'react-native'
export interface SwitcherOptions {
    onTurnOn: () => void,
    onTurnOff: () => void,
    on: boolean
}
const index = ({ on, onTurnOn, onTurnOff }: SwitcherOptions) => {
    const _circleOffsetx = React.useMemo(() => new Animated.Value(0), [])
    const _onToggle = () => {
        if (on) {
            onTurnOff()
        } else {
            onTurnOn()
        }
    }
    useEffect(() => {
        Animated.timing(_circleOffsetx, {
            toValue: on ? 11 : 0,
            duration: 200,
            useNativeDriver: false
        }).start()
    }, [on])
    return (
        <TouchableOpacity
            onPress={_onToggle}
            activeOpacity={1}
            style={{
                ...styles.container,
                backgroundColor: on ? '#78b5ff' : 'gray'
            }}>
            <Animated.View style={{
                ...styles.circle,
                backgroundColor: on ? '#318bfb' : '#ddd',
                left: _circleOffsetx
            }} />
        </TouchableOpacity>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        height: 15,
        width: 35,
        borderRadius: 10,
        position: 'relative'
    },
    circle: {
        position: 'absolute',
        zIndex: 1,
        top: (15 - 24) / 2,
        height: 24,
        width: 24,
        borderRadius: 24,

    }
})
