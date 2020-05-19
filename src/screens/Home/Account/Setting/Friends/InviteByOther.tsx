import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation } from '../../../../../constants'
import Share, { Options } from 'react-native-share'
import { useSelector } from '../../../../../reducers'
const InviteByOther = (): JSX.Element => {
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
        _onSharePost()
    }, [])
    const _onSharePost = () => {
        const options: Options = {
            activityItemSources: [
                { // For sharing url with custom title.
                    placeholderItem: {
                        type: 'url',
                        content: 'https://www.facebook.com/photo.php?fbid=619895371910790'
                    },
                    item: {
                        default: { type: 'url', content: 'https://www.facebook.com/photo.php?fbid=619895371910790' },
                    },
                    subject: {
                        default: '',
                    },
                    linkMetadata: {
                        originalUrl: 'https://www.facebook.com/photo.php?fbid=619895371910790',
                        url: 'https://www.facebook.com/photo.php?fbid=619895371910790',
                        // title: item.content
                    },
                },
                { // For sharing text.
                    placeholderItem: { type: 'text', content: "" },
                    item: {
                        default: { type: 'text', content: `I'm on Instagram as @${user?.username}. Install the app to follow my photos and videos.` },
                        message: null, // Specify no text to share via Messages app.
                    },
                    linkMetadata: { // For showing app icon on share preview.
                        title: `https://img.favpng.com/9/25/24/computer-icons-instagram-logo-sticker-png-favpng-LZmXr3KPyVbr8LkxNML458QV3.jpg`
                    },
                },
                { // For using custom icon instead of default text icon at share preview when sharing with message.
                    placeholderItem: {
                        type: 'url',
                        content: `I'm on Instagram as @${user?.username}. Install the app to follow my photos and videos.`
                    },
                    item: {
                        default: {
                            type: 'text',
                            content: `I'm on Instagram as @${user?.username}. Install the app to follow my photos and videos.`
                        },
                    },
                    linkMetadata: {
                        title: `I'm on Instagram as @${user?.username}. Install the app to follow my photos and videos.`,
                        icon: `https://img.favpng.com/9/25/24/computer-icons-instagram-logo-sticker-png-favpng-LZmXr3KPyVbr8LkxNML458QV3.jpg`
                    }
                },
            ],
        }
        Share.open(options)
    }
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
            </ScrollView>
        </SafeAreaView>
    )
}

export default InviteByOther

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
