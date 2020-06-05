import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Mask, Rect, Circle } from 'react-native-svg'

const AvatarChooserMask = ({ width, height, maskColor }: { maskColor: string, width: number, height: number }) => {
    return (
        <Svg height="100%" width="100%"
            viewBox={`0 0 ${width} ${height}`}>
            <Mask id="mask"
                x="0" y="0"
                height="100%" width="100%"
            >
                <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="#fff"
                >
                </Rect>
                <Circle
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fill="#000"
                />
            </Mask>
            <Rect
                mask="url(#mask)"
                fill={maskColor}
                width="100%" height="100%" />
        </Svg>
    )
}

export default AvatarChooserMask

const styles = StyleSheet.create({})
