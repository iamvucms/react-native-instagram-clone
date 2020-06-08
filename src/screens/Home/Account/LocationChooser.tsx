import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity } from 'react-native'
import { searchLocation, MapBoxAddress } from '../../../utils'
import NavigationBar from '../../../components/NavigationBar'
import { goBack } from '../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH } from '../../../constants'
import { SuperRootStackParamList } from '../../../navigations'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
type LocationChooserRouteProp = RouteProp<SuperRootStackParamList, 'LocationChooser'>

type LocationChooserNavigationProp = StackNavigationProp<SuperRootStackParamList, 'LocationChooser'>

type LocationChooserProps = {
    navigation: LocationChooserNavigationProp,
    route: LocationChooserRouteProp
}
export default function LocationChooser({ navigation, route }: LocationChooserProps) {
    const onDone = route.params.onDone
    const [query, setQuery] = useState<string>(
        route.params.address.place_name.length > 0
            ? route.params.address.place_name : '')
    const [address, setAddress] = useState<MapBoxAddress>({ ...route.params.address })
    const [result, setResult] = useState<MapBoxAddress[]>([])
    const ref = useRef<{ timeout: NodeJS.Timeout }>({
        timeout: setTimeout(() => { }, 0)
    })
    useEffect(() => {
        if (query.length > 0) {
            clearTimeout(ref.current.timeout)
            ref.current.timeout = setTimeout(() => {
                searchLocation(query).then(data => {
                    setResult([...data])
                })
            }, 700);
        }
    }, [query])
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="Select a Location"
                callback={goBack}
            />
            <View style={{
                marginTop: 15
            }}>
                <View style={{
                    flexDirection: 'row',
                    width: SCREEN_WIDTH - 30,
                    marginHorizontal: 15,
                    height: 44,
                    borderBottomColor: "#318bfb",
                    borderBottomWidth: 1
                }}>
                    <View style={styles.centerBtn}>
                        <Icon name="magnify" color="#666" size={20} />
                    </View>
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Find a location"
                        style={{
                            height: '100%',
                            width: SCREEN_WIDTH - 30 - 44,
                        }} />
                </View>
                <View style={{
                    marginTop: 10,
                }}>
                    {result.map(addressItem => (
                        <View style={{
                            marginVertical: 5,
                            backgroundColor: "#000"
                        }}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (onDone) {
                                        onDone({ ...addressItem })
                                        goBack()
                                    }
                                }}
                                activeOpacity={0.9}
                                style={{
                                    backgroundColor: '#fff',
                                    height: 44,

                                    justifyContent: 'center',
                                    paddingHorizontal: 15,
                                }}>
                                <Text numberOfLines={2} style={{
                                    width: "100%",
                                    fontSize: 16
                                }}>{addressItem.place_name}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    centerBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
