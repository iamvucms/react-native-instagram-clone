import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

const PhotoTaker = () => {
    const focused = useIsFocused()
    return (
        <View>
            {!focused ? <View></View > :
                (
                    <View></View>
                )}
        </View>
    )
}

export default PhotoTaker

const styles = StyleSheet.create({})
