import { RouteProp } from '@react-navigation/native'
import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { SCREEN_WIDTH } from '../../../constants'
import { useDispatch } from 'react-redux'
type EditHighlightRouteProp = RouteProp<SuperRootStackParamList, 'EditHighlight'>
type EditHighlightProps = {
    route: EditHighlightRouteProp
}
const EditHighlight = ({ route }: EditHighlightProps) => {
    const dispatch = useDispatch()
    const highlightName = `${route.params.name}`
    const highlight = useSelector(state => state.user
        .highlights?.find(x => x.name === highlightName))
    const highlightStories = highlight?.stories || []
    const stories = useSelector(state => state.user.archive?.stories || [])
    const [name, setName] = useState<string>(highlight?.name || '')
    /**
     * mode
     * 1: UNSELECT
     * 2: ADD
     */
    const [mode, setMode] = useState<number>(1)
    const _onChangeMode = (mode: number) => {
        setMode(mode)
    }
    if (!!!highlight) return null
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        onPress={goBack}
                        style={styles.btnNavigation}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '600'
                    }}>Edit Highlight</Text>
                </View>
                <TouchableOpacity style={{
                    ...styles.btnNavigation,
                    width: 70
                }}>
                    <Text style={{
                        color: "#318bfb",
                        fontSize: 16,
                        fontWeight: '500'
                    }}>Done</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.coverWrapper}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.coverBorder}>
                    <FastImage source={{
                        uri: highlight.avatarUri
                    }}
                        style={styles.cover}
                    />

                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        marginVertical: 5
                    }}>
                    <Text style={{
                        color: '#318bfb',
                    }}>Edit Cover</Text>
                </TouchableOpacity>
            </View>
            <View style={{
                marginBottom: 15
            }}>
                <Text style={{
                    margin: 15,
                    fontSize: 16,
                    marginBottom: 0,
                    color: "#999"
                }}>Title</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.nameInput}
                    placeholder="Highlight"
                />
            </View>
            <View>
                <View style={styles.navigationOptions}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => _onChangeMode(1)}
                        style={styles.optionItem}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500',
                            color: mode === 2 ? '#999' : '#000'
                        }}>SELECTED</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => _onChangeMode(2)}
                        style={styles.optionItem}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500',
                            color: mode === 1 ? '#999' : '#000'
                        }}>ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default EditHighlight
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        flexDirection: 'row',
        height: 44,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: "#ddd",
        borderBottomWidth: 1
    },
    coverWrapper: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    coverBorder: {
        padding: 2,
        borderColor: '#999',
        borderWidth: 2,
        borderRadius: 999
    },
    cover: {
        height: 80,
        width: 80,
        borderRadius: 80,

    },
    nameInput: {
        height: 30,
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        borderBottomColor: "#318bfb",
        borderBottomWidth: 0.5
    },
    btnNavigation: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    navigationOptions: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee'
    },
    optionItem: {
        height: '100%',
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
