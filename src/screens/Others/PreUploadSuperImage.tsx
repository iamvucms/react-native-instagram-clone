import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { RouteProp } from '@react-navigation/native'
import { SuperRootStackParamList } from '../../navigations'
import NavigationBar from '../../components/NavigationBar'
import { goBack } from '../../navigations/rootNavigation'

type PreUploadSuperImageRouteProp = RouteProp<SuperRootStackParamList, 'PreUploadSuperImage'>
type PreUploadSuperImageProps = {
    route: PreUploadSuperImageRouteProp
}

const PreUploadSuperImage = ({ route }: PreUploadSuperImageProps) => {
    const images = route.params?.images || []
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="Share" callback={goBack} />
        </SafeAreaView>
    )
}

export default PreUploadSuperImage

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: "#fff"
    }
})
