import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView from 'react-native-maps'
import { MapBoxAddress, searchLocation } from '../../utils'
import { SCREEN_WIDTH } from '../../constants'
export interface LocationMessageProps {
    address_id: string
}
const LocationMessage = ({ address_id }: LocationMessageProps) => {
    const [addressInfo, setAddressInfo] = useState<MapBoxAddress>()
    const [allowLoadMap, setAllowLoadMap] = useState<boolean>(false)
    useEffect(() => {
        ; (async () => {
            const address = await searchLocation(address_id)
            if (address.length > 0) {
                setAddressInfo(address[0])
            }
            setTimeout(() => {
                setAllowLoadMap(true)
            }, 1500);
        })()
    }, [])
    if (!!!addressInfo || !allowLoadMap) return <View style={styles.container} />
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{
                    fontWeight: 'bold'
                }}>{addressInfo.place_name}</Text>
            </View>
            <MapView
                scrollEnabled={false}
                region={{
                    longitude: (addressInfo.center || [])[0] as number,
                    latitude: (addressInfo.center || [])[1] as number,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                style={{
                    height: 150,
                    width: '100%'
                }}
            /><Text></Text>
        </View>
    )
}

export default LocationMessage

const styles = StyleSheet.create({
    container: {
        height: 200,
        width: SCREEN_WIDTH * 0.6
    },
    header: {
        backgroundColor: "#ddd",
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15
    }
})
