import React from 'react'
import { StyleSheet, Text, View, StyleProp, TextStyle, TextProps } from 'react-native'
import MaskedView from '@react-native-community/masked-view'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
export interface TextGradient extends TextProps {
    text: string
    icon?: {
        name: string,
        size: number
    }
}
const TextGradient = (props: TextGradient) => {
    return (
        <MaskedView
            maskElement={
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    {props.icon &&
                        <Icon name={props.icon.name} size={props.icon.size} />
                    }
                    <Text {...props}>
                        {props.text}
                    </Text>
                </View>
            }>
            <LinearGradient
                start={{
                    x: 0,
                    y: 0
                }} end={{
                    x: 1,
                    y: 0
                }}
                colors={['#c62f90', '#db3072', '#f19d4c']}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    {props.icon &&
                        <Icon name={props.icon.name} size={props.icon.size} color="rgba(0,0,0,0)" />
                    }
                    <Text {...props}
                        style={[props.style, {
                            opacity: 0
                        }]}>
                        {props.text}
                    </Text>
                </View>
            </LinearGradient>
        </MaskedView >
    )
}

export default TextGradient

const styles = StyleSheet.create({})
