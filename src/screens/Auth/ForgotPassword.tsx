import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'

const ForgotPassword = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <View style={styles.navigationBar}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '600'
                    }}>Login Help</Text>
                </View>
            </View>
            <View style={styles.centerContainer}>
                <View>
                    <Text style={{
                        fontSize: 24,
                    }}>Find Your Account</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ForgotPassword
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    navigationBar: {
        height: 44,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - 50
    }
})
