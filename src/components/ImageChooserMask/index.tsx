import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Mask, Rect, Circle } from 'react-native-svg'

const ImageChooserMask = (
    { width, height, maskColor }:
        { maskColor: string, width: number, height: number }) => {
    return (
        <View style={{
            width,
            height,
            flexDirection: 'row',
            flexWrap: 'wrap',
            borderColor: maskColor,
            borderWidth: 1,
        }}>
            {[0, 0, 0, 0, 0, 0, 0, 0, 0].map((x, index) => (
                <View key={index} style={{
                    width: width / 3 - 2 / 3,
                    height: height / 3 - 2 / 3,
                    borderColor: maskColor,
                    borderWidth: 1
                }} />
            ))}
        </View>
    )
}

export default ImageChooserMask

const styles = StyleSheet.create({})
