import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { RouteProp } from '@react-navigation/native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack } from '../../../navigations/rootNavigation'

type ImageClassRouteProp = RouteProp<{
    ImageClass: {
        className: string
    }
}, 'ImageClass'>
type ImageClassProps = {
    route: ImageClassRouteProp
}
const ImageClass = ({ route }: ImageClassProps) => {
    const className = `${route?.params.className}`
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={className} callback={goBack} />
        </SafeAreaView>
    )
}

export default ImageClass

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    }
})
