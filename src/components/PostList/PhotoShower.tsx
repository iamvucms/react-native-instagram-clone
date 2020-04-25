import React from 'react'
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import ScaleImage from '../ScaleImage/'
import { SCREEN_WIDTH } from '../../constants'
const PhotoShower = () => {
    return (
        <View>
            <ScrollView
                showsHorizontalScrollIndicator={false}
                bounces={false}
                horizontal={true}>
                <ScaleImage
                    width={SCREEN_WIDTH}
                    source={{ uri: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80' }} />
            </ScrollView>
        </View>
    )
}

export default PhotoShower

const styles = StyleSheet.create({})
