import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { goBack } from '../../../../../navigations/rootNavigation'
import { APP_NAME } from '../../../../../constants'
import { useDispatch } from 'react-redux'
import { LogoutRequest } from '../../../../../actions/userActions'

const Logout = () => {
    const dispatch = useDispatch()
    const _onLogout = () => {
        goBack()
        setTimeout(() => dispatch(LogoutRequest()), 100)
    }
    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={goBack}
            style={styles.container}>
            <View style={styles.confirmBox}>
                <View style={{
                    height: 60,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600'
                    }}>Log out of {APP_NAME}?</Text>
                </View>
                <TouchableOpacity
                    onPress={_onLogout}
                    style={styles.btnConfirm}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: "#318bfb"
                    }}>Log Out</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={goBack}
                    style={styles.btnConfirm}>
                    <Text style={{
                        fontSize: 16,
                    }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

export default Logout

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBox: {
        width: '80%',
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    btnConfirm: {
        height: 44,
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: '#ddd',
        borderTopWidth: 1
    },
})
