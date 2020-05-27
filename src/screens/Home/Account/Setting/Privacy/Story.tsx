import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation, navigate } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../../../constants'
import Radio from '../../../../../components/Radio'
import Switcher from '../../../../../components/Switcher'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { useSelector } from '../../../../../reducers'
import { useDispatch } from 'react-redux'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
const StoryPravicy = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const story = useSelector(state => state.user.setting?.privacy?.story)
    const [saveToGallery, setSaveToGallery] = useState<boolean>(story?.saveToGallery || false)
    const [saveToArchive, setSaveToArchive] = useState<boolean>(story?.saveToArchive || false)
    const [allowResharing, setAllowResharing] = useState<boolean>(story?.allowResharing || false)
    const [allowSharing, setAllowSharing] = useState<boolean>(story?.allowSharing || false)
    const [shareYourStoryToFacebook, setShareYourStoryToFacebook] = useState<boolean>(story?.shareYourStoryToFacebook || false)
    const [allowMessageReplies, setAllowMessageReplies] = useState<0 | 1 | 2>(story?.allowMessageReplies || 0)
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
            story: {
                saveToArchive,
                saveToGallery,
                allowSharing,
                allowMessageReplies,
                allowResharing,
                shareYourStoryToFacebook
            }
        }))
    }, [saveToArchive, saveToGallery, allowSharing, allowMessageReplies, allowResharing, shareYourStoryToFacebook])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                style={{
                    height: SCREEN_HEIGHT -
                        STATUS_BAR_HEIGHT - getTabBarHeight() - 44
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    paddingHorizontal: 15,
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#ddd'
                }}>
                    <Text style={{
                        marginVertical: 15,
                        fontSize: 16,
                        fontWeight: '500'
                    }}>
                        Hide Story From
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigate('HideStoryFrom')}
                        style={{
                            marginVertical: 10,
                        }}>
                        <Text style={{ fontSize: 16 }}>{story?.hideStoryFrom?.length || 0} People</Text>
                    </TouchableOpacity>
                    <Text style={{
                        color: '#666',
                        fontSize: 12
                    }}>
                        Hide your story and live videos from specific people.
                    </Text>
                </View>
                <View style={{
                    paddingHorizontal: 15,
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#ddd'
                }}>
                    <Text style={{
                        marginVertical: 15,
                        fontSize: 16,
                        fontWeight: '500'
                    }}>
                        Close Friends
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigate('CloseFriends')}
                        style={{
                            marginVertical: 10,
                        }}>
                        <Text style={{ fontSize: 16 }}>{story?.closeFriends?.length || 0} People</Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#ddd'
                }}>
                    <Text style={{
                        margin: 15,
                        fontSize: 16,
                        fontWeight: '500'
                    }}>
                        Allow Message Replies
                    </Text>
                    <Radio
                        labels={["Your Followers", "Followers You Follow Back", "Off"]}
                        values={[0, 1, 2]}
                        onChange={setAllowMessageReplies}
                        defaultSelected={allowMessageReplies}
                    />
                    <Text style={{
                        marginHorizontal: 15,
                        color: '#666',
                        fontSize: 12
                    }}>
                        Choose who can reply to your story.
                    </Text>
                </View>
                <View style={{
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#ddd'
                }}>
                    <Text style={{
                        margin: 15,
                        fontSize: 16,
                        fontWeight: '500'
                    }}>
                        Saving
                    </Text>
                    <View style={{
                        marginVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>Save to Gallery</Text>
                        <Switcher on={saveToGallery}
                            onTurnOff={setSaveToGallery.bind(null, false)}
                            onTurnOn={setSaveToGallery.bind(null, true)}
                        />
                    </View>
                    <View style={{
                        marginVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>Save to Archive</Text>
                        <Switcher on={saveToArchive}
                            onTurnOff={setSaveToArchive.bind(null, false)}
                            onTurnOn={setSaveToArchive.bind(null, true)} />
                    </View>
                    <Text style={{
                        marginHorizontal: 15,
                        color: '#666',
                        fontSize: 12
                    }}>
                        Automatically save photos and videos in your archive so you don't have to save them on our phone. Only you can see them after they disappear from your story.
                    </Text>
                </View>
                <View style={{
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#ddd'
                }}>
                    <Text style={{
                        margin: 15,
                        fontSize: 16,
                        fontWeight: '500'
                    }}>
                        Sharing
                    </Text>
                    <View style={{
                        marginVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>Allow Resharing to Stories</Text>
                        <Switcher on={allowResharing}
                            onTurnOff={setAllowResharing.bind(null, false)}
                            onTurnOn={setAllowResharing.bind(null, true)}
                        />
                    </View>
                    <Text style={{
                        marginHorizontal: 15,
                        color: '#666',
                        fontSize: 12
                    }}>
                        Other people can add your feed posts and IGTV videos to their stories. Your username will always show with your post.
                    </Text>
                    <View style={{
                        marginVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>Allow Sharing</Text>
                        <Switcher on={allowSharing}
                            onTurnOff={setAllowSharing.bind(null, false)}
                            onTurnOn={setAllowSharing.bind(null, true)} />
                    </View>
                    <Text style={{
                        marginHorizontal: 15,
                        color: '#666',
                        fontSize: 12
                    }}>
                        Let your followers share photos and videos from your story as messages. Only you followers ca see what's shared.
                    </Text>
                    <View style={{
                        marginVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 15
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>Share Your Story To Facebook</Text>
                        <Switcher on={shareYourStoryToFacebook}
                            onTurnOff={setShareYourStoryToFacebook.bind(null, false)}
                            onTurnOn={setShareYourStoryToFacebook.bind(null, true)} />
                    </View>
                    <Text style={{
                        marginHorizontal: 15,
                        color: '#666',
                        fontSize: 12
                    }}>
                        Automatically share photos and videos from your story to your Facebook story
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default StoryPravicy

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
