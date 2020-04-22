import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
export interface NavigationBarProps {
    title: string,
    callback?: () => any
}
const index = ({ callback, title }: NavigationBarProps) => {
    const _onCallBack = () => {
        if (callback) callback()
    }
    return (
        <View style={styles.navigationBar}>
            <TouchableOpacity
                onPress={_onCallBack}
                style={styles.btnBack}>
                <Icon name="arrow-left" size={20} />
            </TouchableOpacity>
            <Text style={{
                fontSize: 16,
                fontWeight: '600'
            }}>{title}</Text>
        </View>
    )
}

export default index

const styles = StyleSheet.create({
    navigationBar: {
        flexDirection: 'row',
        height: 44,
        width: '100%',
        alignItems: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    btnBack: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
})
