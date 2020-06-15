import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSelector } from '../../reducers'
import FastImage from 'react-native-fast-image'
export interface CustomAccountIconProps {
    focused: boolean
}
const CustomAccountIcon = ({ focused }: CustomAccountIconProps) => {
    const user = useSelector(state => state.user.user.userInfo)
    return (
        <View style={{
            height: 24,
            width: 24,
            borderRadius: 24,
            padding: 2,
            borderWidth: focused ? 1 : 0
        }}>
            <FastImage style={styles.avatar} source={{
                uri: user?.avatarURL
            }} />
        </View>
    )
}

export default CustomAccountIcon

const styles = StyleSheet.create({
    avatar: {
        height: '100%',
        width: '100%',
        borderRadius: 20,
        borderColor: '#000',
    }
})
