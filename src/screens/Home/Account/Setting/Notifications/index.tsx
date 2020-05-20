import React, { useRef, useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { settingNavigationMap } from '../../../../../constants'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation, dispatch } from '../../../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Switcher from '../../../../../components/Switcher'
import { UpdateNotificationSettingsRequest } from '../../../../../actions/userActions'
import { firestore } from 'firebase'
import { useDispatch } from 'react-redux'
import { convertDateToTimeStampFireBase } from '../../../../../utils'
import { useSelector } from '../../../../../reducers'
const index = (): JSX.Element => {
    const dispatch = useDispatch()
    const notificationSetting = useSelector(state => state.user.setting?.notification)
    const [showingTurnOffNotificationModal
        , setShowingTurnOffNotificationModal] = useState<boolean>(false)
    const [switchOn, setSwitchOn] = useState<boolean>(notificationSetting?.pauseAll?.active || false)
    const route = useRoute()
    const currNavigation = settingNavigationMap
        .filter(x => x.navigationName === route.name)[0]
    const _onTurnOnHandler = React.useCallback(() => {
        setShowingTurnOffNotificationModal(true)
        setSwitchOn(true)
    }, [])
    const _onTurnOffHandler = React.useCallback(() => {
        setShowingTurnOffNotificationModal(false)
        setSwitchOn(false)
        dispatch(UpdateNotificationSettingsRequest({
            pauseAll: {
                active: false,
            }
        }))
    }, [])
    const _onTurnOnNotification = React.useCallback((duration: number) => {
        const date = new Date()
        dispatch(UpdateNotificationSettingsRequest({
            pauseAll: {
                active: true,
                duration,
                from: convertDateToTimeStampFireBase(date)
            }
        }))
        setShowingTurnOffNotificationModal(false)
    }, [])
    return (
        <>
            {showingTurnOffNotificationModal &&
                <TouchableOpacity
                    onPress={_onTurnOffHandler}
                    style={styles.pauseAllModal}>
                    <View style={styles.pausAllOptionsWrapper}>
                        <Text style={{
                            textAlign: 'center',
                            width: '100%',
                            paddingHorizontal: '10%',
                            marginVertical: 10,
                            borderBottomWidth: 0.3,
                            borderBottomColor: '#ddd'
                        }}>
                            You won't get push notifications, but you
                            'll be able to see new notifications when you open Instagram
                            .
                        </Text>
                        <View style={{ width: '100%' }}>
                            <TouchableOpacity
                                onPress={_onTurnOnNotification.bind(null, 0.4 * 3600)}
                                style={styles.pauseAllOptionItem}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>15 minutes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onTurnOnNotification.bind(null, 1 * 3600)}
                                style={styles.pauseAllOptionItem}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>1 hour</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onTurnOnNotification.bind(null, 2 * 3600)}
                                style={styles.pauseAllOptionItem}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>2 hours</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onTurnOnNotification.bind(null, 4 * 3600)}
                                style={styles.pauseAllOptionItem}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>4 hours</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_onTurnOnNotification.bind(null, 8 * 3600)}
                                style={styles.pauseAllOptionItem}>
                                <Text style={{ fontSize: 16, fontWeight: '500' }}>8 hours</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </TouchableOpacity>
            }
            <SafeAreaView style={{
                ...styles.container,
            }}>
                <NavigationBar title={settingNavigationMap
                    .filter(x => x.navigationName === route.name)[0].name} callback={() => {
                        navigation.goBack()
                    }} />

                <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{
                        height: 44,
                        justifyContent: 'center',
                        paddingHorizontal: 25
                    }}>
                        <Text style={{
                            fontWeight: '600',
                            fontSize: 16
                        }}>Push Notifications</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            if (!switchOn) {
                                _onTurnOnHandler()
                            } else {
                                _onTurnOffHandler()
                            }
                        }}
                        activeOpacity={0.9}
                        style={{
                            ...styles.settingItem,
                            justifyContent: 'space-between'
                        }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '400',
                            marginLeft: 10,
                        }}>Pause All</Text>
                        <Switcher
                            on={switchOn}
                            onTurnOff={_onTurnOffHandler}
                            onTurnOn={_onTurnOnHandler}
                        />
                    </TouchableOpacity>
                    {currNavigation.child && currNavigation.child.map((settingNavigation, index) => (
                        <View key={index} style={{
                            backgroundColor: '#000'
                        }}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate(settingNavigation.navigationName)
                                }}

                                activeOpacity={0.9}
                                style={styles.settingItem}>
                                {settingNavigation.icon &&
                                    <Icon name={settingNavigation.icon} size={24} />}
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '400',
                                    marginLeft: 10,
                                }}>{settingNavigation.name}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    pauseAllModal: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    pausAllOptionsWrapper: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pauseAllOptionItem: {
        paddingLeft: 10,
        height: 44,
        width: '100%',
        justifyContent: 'center'
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
