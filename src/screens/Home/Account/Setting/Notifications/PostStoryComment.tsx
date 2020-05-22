import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import Radio from '../../../../../components/Radio'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
const PostStoryComment = (): JSX.Element => {
    const route = useRoute()

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
    const _onChangeLikes = React.useCallback((value: string) => {

    }, [])
    const _onChangeLikesandCommentonMyPhoto = React.useCallback((value: string) => {

    }, [])
    const _onChangePhotoofYou = React.useCallback((value: string) => {

    }, [])
    const _onChangeComments = React.useCallback((value: string) => {

    }, [])
    const _onChangeCommentLikesandPins = React.useCallback((value: string) => {

    }, [])
    const _onChangeFirstPostsandStories = React.useCallback((value: string) => {

    }, [])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                style={{
                    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - getTabBarHeight()
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Likes</Text>
                    </View>
                    <Radio
                        labels={["Off", "From People I Follow", 'From Everyone']}
                        values={["0", "1", "2"]}
                        defaultSelected="0"
                        onChange={_onChangeLikes}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms liked your photo.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Likes and Comments on Photos of You</Text>
                    </View>
                    <Radio
                        labels={["Off", "From People I Follow", 'From Everyone']}
                        values={["0", "1", "2"]}
                        defaultSelected="2"
                        onChange={_onChangeLikesandCommentonMyPhoto}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms liked your photo.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Photos of You</Text>
                    </View>
                    <Radio
                        labels={["Off", "From People I Follow", 'From Everyone']}
                        values={["0", "1", "2"]}
                        defaultSelected="0"
                        onChange={_onChangePhotoofYou}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms tagged you in a photo.</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Comments</Text>
                    </View>
                    <Radio
                        labels={["Off", "From People I Follow", 'From Everyone']}
                        values={["0", "1", "2"]}
                        defaultSelected="0"
                        onChange={_onChangeComments}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms commented: "Nice shot!".</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>Comments and Pins</Text>
                    </View>
                    <Radio
                        labels={["Off", "On"]}
                        values={["0", "1"]}
                        defaultSelected="0"
                        onChange={_onChangeCommentLikesandPins}
                    />
                    <Text style={{ fontSize: 12, color: '#666', maxWidth: '80%', paddingHorizontal: 15 }}>vucms commented: "Nice shot!" and other similar notifications</Text>
                </View>
                <View style={styles.optionsWrapper}>
                    <View style={styles.settingItem}>
                        <Text style={{ fontWeight: '600', fontSize: 16 }}>First Post and Stories</Text>
                    </View>
                    <Radio
                        labels={["Off", "From People I Follow", 'From Everyone']}
                        values={["0", "1", "2"]}
                        defaultSelected="2"
                        onChange={_onChangeFirstPostsandStories}
                    />
                    <Text style={{ fontSize: 12, color: '#666', paddingHorizontal: 15 }}>vucms liked your photo.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default PostStoryComment

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
    },
    optionsWrapper: {
        paddingVertical: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5
    }
})
