import React, { useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
import { useDispatch } from 'react-redux'
import { database } from 'firebase'
import { FetchNotificationListRequest } from '../../actions/notificationActions'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useRoute } from '@react-navigation/native'
import { store } from '../../store'
export interface CustomNotificationIconProps {
    focused: boolean
}
const CustomNotificationIcon = ({ focused }: CustomNotificationIconProps) => {
    const dispatch = useDispatch()
    const myUsername = store.getState().user.user.userInfo?.username
    const _animBellOpacity = React.useMemo(() => new Animated.Value(1), [])
    const _animBellY = React.useMemo(() => new Animated.Value(0), [])
    useEffect(() => {
        database().ref('/notifications/' + myUsername).on('value', rs => {
            const shouldRefreshNotifications = rs.val()
            if (shouldRefreshNotifications) {
                _onAnimate()
                database().ref('/notifications/' + myUsername).set(false)
                dispatch(FetchNotificationListRequest())
            }
        })
    }, [])
    useEffect(() => {
        if (focused) {
            _animBellOpacity.stopAnimation()
            _animBellY.stopAnimation()
        }
    }, [focused])
    const _onAnimate = () => {
        _animBellOpacity.setValue(1)
        Animated.sequence([
            Animated.timing(_animBellY, {
                toValue: -55,
                useNativeDriver: true,
                duration: 300
            }),
            Animated.loop(Animated.sequence([
                Animated.timing(_animBellY, {
                    toValue: -60,
                    useNativeDriver: true,
                    duration: 300
                }),
                Animated.timing(_animBellY, {
                    toValue: -55,
                    useNativeDriver: true,
                    duration: 150
                }),
            ]), { iterations: 20 })
        ]).start(() =>
            Animated.parallel([
                Animated.timing(_animBellY, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true
                }),
                Animated.timing(_animBellOpacity, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true
                }),
            ]).start()
        )
    }
    return (
        <>
            <View style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff'
            }}>

                <Animated.View
                    style={{
                        backgroundColor: '#fff',
                    }}
                >
                    <Icon name="heart"
                        size={30} color={focused ? '#000' : '#ddd'} />
                </Animated.View>
            </View >
            <Animated.View style={{
                ...styles.popupNewNotification,
                opacity: _animBellOpacity,
                transform: [{
                    translateY: _animBellY
                }]
            }}>
                <View style={styles.triangle} />
                <Text style={{
                    fontSize: 18,
                    marginRight: 2,
                    fontWeight: 'bold',
                    color: '#fff'
                }}>1</Text>
                <Icon name="bell"
                    size={18} color='#fff' />
            </Animated.View>
        </>
    )
}

export default CustomNotificationIcon

const styles = StyleSheet.create({
    popupNewNotification: {
        zIndex: -1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: 50,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#e94856'
    },
    triangle: {

        borderWidth: 10,
        borderBottomColor: '#rgba(0,0,0,0)',
        borderRightColor: '#rgba(0,0,0,0)',
        borderLeftColor: '#rgba(0,0,0,0)',
        borderTopColor: '#e94856',
        position: 'absolute',
        top: '100%',
        left: 15,
    }
})

