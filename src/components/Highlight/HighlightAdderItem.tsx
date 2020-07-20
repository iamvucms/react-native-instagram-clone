import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { navigate } from '../../navigations/rootNavigation'
const HighlightAdderItem = () => {
    return (
        <TouchableOpacity
            onPress={() =>
                navigate('CreateHighlight')
            }
            activeOpacity={0.8}
            style={styles.container}
        >
            <View style={styles.avatar}>
                <Image style={{
                    height: 20,
                    width: 20
                }} source={require("../../assets/icons/plus.png")} />
            </View>
            <Text style={{
                fontWeight: '500',
                marginTop: 5
            }}>New</Text>
        </TouchableOpacity>
    )
}

export default HighlightAdderItem

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    avatar: {
        height: 64,
        width: 64,
        borderRadius: 64,
        borderColor: '#000',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
