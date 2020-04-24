import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

const Direct = () => {
    const focused = useIsFocused()
    return (
        <View>
            {!focused ? <View></View > :
                (
                    <View>
                        <Text>awefawefawefawfawefa</Text>
                    </View>
                )}
        </View>
    )
}

export default Direct

const styles = StyleSheet.create({})
