import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { SuperRootStackParamList } from '../../../navigations'
import { RouteProp } from '@react-navigation/native'
import SuperImage from '../../../components/SuperImage'
import { STATUS_BAR_HEIGHT } from '../../../constants'
import { goBack } from '../../../navigations/rootNavigation'

type SuperImageFullViewRouteProp = RouteProp<SuperRootStackParamList, 'SuperImageFullView'>
type SuperImageFullViewProps = {
    route: SuperImageFullViewRouteProp
}
const SuperImageFullView = ({ route }: SuperImageFullViewProps) => {
    const superId = route.params.superId
    return (
        <View>
            <TouchableOpacity
                onPress={goBack}
                style={styles.btnClose}>
                <Text style={{
                    fontSize: 30,
                    color: '#fff',
                }}>✕</Text>
            </TouchableOpacity>
            <SuperImage disableNavigation={true} superId={superId} />
        </View>
    )
}

export default SuperImageFullView

const styles = StyleSheet.create({
    btnClose: {
        position: 'absolute',
        zIndex: 1,
        top: STATUS_BAR_HEIGHT + 10,
        right: 25
    }
})
