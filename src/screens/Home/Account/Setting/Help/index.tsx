import React from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { settingNavigationMap } from '../../SettingIndex'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation } from '../../../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
const index = (): JSX.Element => {
    const route = useRoute()
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
