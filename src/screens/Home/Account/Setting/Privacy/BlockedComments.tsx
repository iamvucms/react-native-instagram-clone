import React, { useState, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native'
import NavigationBar from '../../../../../components/NavigationBar'
import { goBack } from '../../../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH } from '../../../../../constants'
const BlockedComments = () => {
    const [focused, setFocused] = useState<boolean>(false)
    const [query, setQuery] = useState<string>('')
    const _onChangeText = (q: string) => {
        setQuery(q)
    }
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="Blocked Commenters" callback={goBack} />
            <View style={{
                ...styles.searchWrapper,
                borderColor: focused ? '#318bfb' : '#ddd'
            }}>
                <View style={{
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Icon color="#666"
                        name="magnify" size={20} />
                </View>
                <TextInput
                    value={query}
                    onChangeText={_onChangeText}
                    onFocus={() => setFocused(true)} style={styles.textInput} />
                {focused &&
                    <TouchableOpacity
                        onPress={setQuery.bind(null, '')}
                        style={{
                            width: 44,
                            height: 44,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Text style={{ color: '#666' }}>✖</Text>
                    </TouchableOpacity>}
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
            </ScrollView>
        </SafeAreaView >
    )
}

export default BlockedComments

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff'
    },
    searchWrapper: {
        height: 44,
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 15,
        marginVertical: 10,
        borderBottomWidth: 1,
    },
    textInput: {
        height: 44,
        width: Dimensions.get('window').width - 30 - 88
    }
})
