import { useRoute } from '@react-navigation/native'
import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import NavigationBar from '../../../../../components/NavigationBar'
import { settingNavigationMap } from '../../../../../constants'
import { navigation } from '../../../../../navigations/rootNavigation'
import { useSelector } from '../../../../../reducers'
const index = (): JSX.Element => {
    const route = useRoute()
    const accountPrivacy = useSelector(state => state.user.setting?.privacy?.accountPrivacy)
    const currNavigation = settingNavigationMap
        .filter(x => x.navigationName === route.name)[0]
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={currNavigation.name} callback={() => {
                navigation.goBack()
            }} />
            <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    height: 44,
                    justifyContent: 'center',
                    paddingHorizontal: 15
                }}>
                    <Text style={{
                        fontWeight: '600',
                        fontSize: 16
                    }}>Interactions</Text>
                </View>
                {currNavigation.child && currNavigation.child.map((settingNavigation, index) => (
                    <View key={index} style={{
                        backgroundColor: '#000'
                    }}>
                        {settingNavigation.navigationName === 'AccountPrivacy' &&
                            <>
                                <View style={{
                                    borderTopColor: '#ddd',
                                    borderTopWidth: 0.5,
                                    height: 44,
                                    backgroundColor: "#fff",
                                    justifyContent: 'center',
                                    paddingHorizontal: 15
                                }}>
                                    <Text style={{
                                        fontWeight: '600',
                                        fontSize: 16
                                    }}>Interactions</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate(settingNavigation.navigationName)
                                    }}

                                    activeOpacity={0.9}
                                    style={{
                                        ...styles.settingItem,
                                        justifyContent: 'space-between'
                                    }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                        {settingNavigation.icon &&
                                            <Icon name={settingNavigation.icon} size={24} />}
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: '400',
                                            marginLeft: 10,
                                        }}>{settingNavigation.name}</Text>
                                    </View>
                                    <Text style={{
                                        color: '#666'
                                    }}>{accountPrivacy?.private ? 'Private' : 'Public'}</Text>
                                </TouchableOpacity>
                            </>
                        }
                        {settingNavigation.navigationName !== "AccountPrivacy" && (
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
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

export default index

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
