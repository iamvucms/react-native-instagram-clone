import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation, dispatch } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation } from '../../../../../constants'
import Radio from '../../../../../components/Radio'
import Swicher from '../../../../../components/Switcher'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { store } from '../../../../../store'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
import { useDispatch } from 'react-redux'
const TagPravicy = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const tags = store.getState().user.setting?.privacy?.tags
    const [manualApproveTags, setManualApproveTag] = useState<boolean>(tags?.manualApproveTags || false)
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
            tags: {
                manualApproveTags
            }
        }))
    }, [manualApproveTags])
    const _onChangeAllowTagsFrom = (value: 0 | 1 | 2) => {
        dispatch(UpdatePrivacySettingsRequest({
            tags: {
                allowTagFrom: value
            }
        }))
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
                <View style={{
                    paddingVertical: 15,
                    borderBottomColor: '#ddd',
                    borderBottomWidth: 0.5
                }}>
                    <View style={{
                        height: 44,
                        justifyContent: 'center'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            paddingHorizontal: 15,
                            fontWeight: '600'
                        }}>
                            Allow Tags From
                    </Text>
                    </View>
                    <Radio
                        onChange={_onChangeAllowTagsFrom}
                        labels={["Everyone", 'People You Follow', 'No One']}
                        values={[0, 1, 2]}
                        defaultSelected={1}
                    />
                </View>
                <View style={{
                    paddingVertical: 15,
                    borderBottomColor: '#ddd',
                    borderBottomWidth: 0.5
                }}>
                    <View style={{
                        height: 44,
                        justifyContent: 'center'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            paddingHorizontal: 15,
                            fontWeight: '600'
                        }}>
                            Tagged Posts
                    </Text>
                    </View>
                    <View style={{
                        marginVertical: 15,
                        paddingHorizontal: 15,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>Manually Approve Tags</Text>
                        <Swicher on={manualApproveTags}
                            onTurnOff={setManualApproveTag.bind(null, false)}
                            onTurnOn={setManualApproveTag.bind(null, true)}
                        />
                    </View>
                    <View style={{
                        marginVertical: 15,
                        paddingHorizontal: 15,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 16
                        }}>Pending Tags</Text>
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                        }}>
                            <Text style={{
                                fontSize: 16,
                                color: '#666'
                            }}>0</Text>
                            <Icon name="chevron-right" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={{
                            paddingHorizontal: 15,
                            fontSize: 12,
                            color: '#666'
                        }}>
                            Choose who can tag you in their photos and videos. When people try to tag you, they'll see if you don't allow tags from everyone.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default TagPravicy

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
