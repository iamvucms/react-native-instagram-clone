import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SuperRootStackParamList } from '../../../navigations'
import { RouteProp } from '@react-navigation/native'

type ImageFullViewRouteProp = RouteProp<SuperRootStackParamList, 'ImageFullView'>

type ImageFullViewProps = {
    route: ImageFullViewRouteProp
}

const ImageFullView = ({ route }: ImageFullViewProps) => {

    return (
        <View style={styles.container}>
            <Text></Text>
        </View>
    )
}

export default ImageFullView

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    }
})
