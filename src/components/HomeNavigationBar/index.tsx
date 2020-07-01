import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH } from '../../constants'
import { navigation } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'
import { store } from '../../store'
import { seenTypes } from '../../reducers/messageReducer'

const index = () => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const extraMessageList = useSelector(state => state.messages)

    let unReadCount = 0
    extraMessageList.map(extraMsg => {
        if (extraMsg.messageList.length === 0) return;
        const isMyMessage = extraMsg.messageList[0].userId === myUsername
        const unRead = !isMyMessage && extraMsg.messageList[0].seen === seenTypes.NOTSEEN
        if (unRead) unReadCount++
    })

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.navigationBar}>
            <TouchableOpacity
                onPress={() => navigation.navigate('StoryTaker')}
                style={styles.btnBack}>
                <Icon name="camera" size={24} />
            </TouchableOpacity>
            <View style={styles.centerBar}>
                <Image style={styles.logo} source={require('../../assets/images/logo.png')} />
            </View>
            <TouchableOpacity
                onPress={() => navigation.navigate('Direct')}
                style={styles.btnMessenger}>
                <View>
                    <Image
                        style={{
                            height: 24,
                            width: 24
                        }}
                        source={require('../../assets/icons/send.png')} />
                    {unReadCount > 0 &&
                        <View style={styles.unRead}>
                            <Text style={{
                                fontWeight: 'bold',
                                color: '#fff'
                            }}>{unReadCount}</Text>
                        </View>
                    }
                </View>
            </TouchableOpacity>
        </TouchableOpacity >
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
    centerBar: {
        height: 44,
        width: SCREEN_WIDTH - 44 * 2,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    logo: {
        resizeMode: 'contain',
        height: 30,
        width: 100
    },
    btnBack: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnMessenger: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    unRead: {
        position: 'absolute',
        top: -5,
        right: -5,
        height: 20,
        width: 20,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20
    }
})
