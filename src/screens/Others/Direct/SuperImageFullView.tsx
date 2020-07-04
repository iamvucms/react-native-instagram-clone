import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SuperRootStackParamList } from '../../../navigations'
import { RouteProp } from '@react-navigation/native'
import SuperImage from '../../../components/SuperImage'

type SuperImageFullViewRouteProp = RouteProp<SuperRootStackParamList, 'SuperImageFullView'>
type SuperImageFullViewProps = {
    route: SuperImageFullViewRouteProp
}
const SuperImageFullView = ({ route }: SuperImageFullViewProps) => {
    const superId = route.params.superId
    return (
        <View>
            <SuperImage disableNavigation={true} superId={superId} />
        </View>
    )
}

export default SuperImageFullView

const styles = StyleSheet.create({})
