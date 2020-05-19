import React, { useState, useEffect } from 'react'
import { StyleSheet, Linking, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Text } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_WIDTH } from '../../../../../constants'
import { useSelector } from '../../../../../reducers'
const InviteByEmail = (): JSX.Element => {
    const route = useRoute()
    const user = useSelector(state => state.user.user.userInfo)
    const [currNavigation, setCurrNavigation] =
        useState<SettingNavigation | { name: string }>({ name: '' })
    useEffect(() => {
        settingNavigationMap.every(settingNavigation => {
            if (settingNavigation.child) {
                return settingNavigation.child.every(childSettingNavigation => {
                    if (childSettingNavigation.navigationName === route.name) {
                        setCurrNavigation(childSettingNavigation);
                        return false
                    }
                    return true
                }) || true
            }
            return true;
        })
    }, [])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <View style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            }}>
                <Image style={{
                    width: 72,
                    height: 72
                }} source={require('../../../../../assets/images/sms.png')} />
                <Text style={{
                    fontWeight: '600',
                    fontSize: 22,
                    marginVertical: 15,
                }}>Invite To Join Instagram</Text>
                <Text
                    style={{
                        width: SCREEN_WIDTH * 0.9,
                        textAlign: 'center',
                        color: '#666'
                    }}>Send Email to your friends to invite them join Instagram, discover Instagram content and create your network.</Text>
                <TouchableOpacity
                    onPress={() => {
                        Linking.openURL(`mailto:a@gmai.com?subject=${user?.fullname} invited you to join Instagram&body=Hello, I'm on Instagram as @${user?.username}. Install the app to follow my photos and videos.`);
                    }}
                    style={styles.btnSendSMS}>
                    <Text style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#fff"
                    }}>Send Email</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default InviteByEmail

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
    },
    btnSendSMS: {
        height: 44,
        width: SCREEN_WIDTH * 0.9,
        backgroundColor: "#318bfb",
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    }
})
