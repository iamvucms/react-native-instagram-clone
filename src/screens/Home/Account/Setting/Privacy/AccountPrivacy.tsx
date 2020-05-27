import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_HEIGHT } from '../../../../../constants'
import Switcher from '../../../../../components/Switcher'
import { store } from '../../../../../store'
import { useDispatch } from 'react-redux'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
const AccountPrivacy = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const accountPrivacy = store.getState().user.setting?.privacy?.accountPrivacy
    const [privateAccount, setPrivateAccount] = useState<boolean>(accountPrivacy?.private || false)
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
    useEffect(() => {
        dispatch(UpdatePrivacySettingsRequest({
            accountPrivacy: {
                private: privateAccount
            }
        }))
    }, [privateAccount])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                style={{
                    height: '100%'
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    paddingHorizontal: 15,
                    paddingVertical: 25
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>
                            Private Account
                        </Text>
                        <Switcher
                            onTurnOn={setPrivateAccount.bind(null, true)}
                            onTurnOff={setPrivateAccount.bind(null, false)}
                            on={privateAccount} />
                    </View>
                    <Text style={{
                        marginVertical: 10,
                        color: '#666',
                        fontSize: 12
                    }}>
                        When your accounts is private, only people you approve can see your photos and videos. Your existing followers won't be affected. <Text style={{
                            fontWeight: 'bold',
                            color: '#000'
                        }}>Learn More.</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default AccountPrivacy

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    settingItem: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
    }
})
