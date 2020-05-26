import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { useRoute } from '@react-navigation/native'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation, navigate } from '../../../../../navigations/rootNavigation'
import { settingNavigationMap, SettingNavigation } from '../../../../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Switcher from '../../../../../components/Switcher'
import { useSelector } from '../../../../../reducers'
import { useDispatch } from 'react-redux'
import { UpdatePrivacySettingsRequest } from '../../../../../actions/userActions'
const CommentSetting = (): JSX.Element => {
    const route = useRoute()
    const dispatch = useDispatch()
    const ref = useRef<{ timeout: NodeJS.Timeout }>({
        timeout: setTimeout(() => { }, 0)
    })
    const comments = useSelector(state => state.user.setting?.privacy?.comments)
    const [hideOffensive, setHideOffensive] = useState<boolean>(comments?.hideOffensive || false)
    const [filterInputValue, setFilterInputValue] = useState<string>(comments?.specificWord || '')
    const [manualFilter, setManualFilter] = useState<boolean>(comments?.manualFilter || false)
    const [filterMostReport, setFilterMostReport] = useState<boolean>(comments?.filterMostReported || false)
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
            comments: {
                filterMostReported: filterMostReport,
                manualFilter,
                hideOffensive
            }
        }))
    }, [hideOffensive, manualFilter, filterMostReport])
    useEffect(() => {
        clearTimeout(ref.current.timeout)
        ref.current.timeout = setTimeout(() => {
            dispatch(UpdatePrivacySettingsRequest({
                comments: {
                    specificWord: filterInputValue
                }
            }))
        }, 500);

    }, [filterInputValue])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={(currNavigation as { name: string }).name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleWrapper}>
                    <Text style={styles.title}>
                        Controls
                    </Text>
                </View>
                <View style={styles.optionWrapper}>
                    <View style={styles.option}>
                        <Text style={{ fontSize: 16 }}>
                            Block Comments From
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                navigate('BlockedComments')
                            }}
                            activeOpacity={0.8}
                            style={{ flexDirection: 'row' }}>
                            <Text style={{
                                color: '#666'
                            }}>{comments?.blockUsers?.length || 0} People</Text>
                            <Icon name="chevron-right" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <Text style={{
                        paddingHorizontal: 15,
                        fontSize: 12,
                        marginVertical: 7.5
                    }}>
                        Any new comments from people you block won't be visible to anyone but them.
                    </Text>
                </View>
                <View style={styles.titleWrapper}>
                    <Text style={styles.title}>
                        Filters
                    </Text>
                </View>
                <View style={styles.optionWrapper}>
                    <View style={styles.option}>
                        <Text style={{ fontSize: 16 }}>
                            Hide Offensive Comments
                        </Text>
                        <Switcher on={hideOffensive}
                            onTurnOn={setHideOffensive.bind(null, true)}
                            onTurnOff={setHideOffensive.bind(null, false)}
                        />
                    </View>
                    <Text style={{
                        paddingHorizontal: 15,
                        fontSize: 12,
                        marginVertical: 7.5
                    }}>
                        Automatically hide comments that may be offensive from yours posts, stories, and live videos.
                    </Text>
                </View>
                <View style={styles.optionWrapper}>
                    <View style={styles.option}>
                        <Text style={{ fontSize: 16 }}>
                            Manual Filter
                        </Text>
                        <Switcher on={manualFilter}
                            onTurnOff={setManualFilter.bind(null, false)}
                            onTurnOn={setManualFilter.bind(null, true)}
                        />
                    </View>
                    {manualFilter &&
                        <TextInput
                            value={filterInputValue}
                            onChangeText={setFilterInputValue}
                            placeholder="Words, separated by commas..."
                            style={styles.filterInput} />}
                    <Text style={{
                        paddingHorizontal: 15,
                        fontSize: 12,
                        marginVertical: 7.5
                    }}>
                        Hide comments that contain specific words or phrases from your posts, stories, and live videos.
                    </Text>
                </View>
                {manualFilter &&
                    <View style={styles.optionWrapper}>
                        <View style={styles.option}>
                            <Text style={{ fontSize: 16 }}>
                                Filter Most Reported Words
                            </Text>
                            <Switcher on={filterMostReport}
                                onTurnOff={setFilterMostReport.bind(null, false)}
                                onTurnOn={setFilterMostReport.bind(null, true)}
                            />
                        </View>
                        <Text style={{
                            paddingHorizontal: 15,
                            fontSize: 12,
                            marginVertical: 7.5
                        }}>
                            Hide comments that contain specific words or phrases that are most commonly reported on your posts, stories, and live videos.
                         </Text>
                    </View>}
            </ScrollView>
        </SafeAreaView>
    )
}

export default CommentSetting

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
    titleWrapper: {
        height: 44,
        paddingHorizontal: 15,
        justifyContent: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: '500'
    },
    optionWrapper: {
        paddingVertical: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    filterInput: {
        marginVertical: 5,
        fontSize: 16,
        height: 44,
        width: '100%',
        paddingHorizontal: 15
    }
})
