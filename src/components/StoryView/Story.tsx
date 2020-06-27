import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Story, ExtraStory } from '../../reducers/storyReducer'
import SuperImage from '../SuperImage'
import { STATUS_BAR_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants'
export interface StoryProps {
    item: ExtraStory
}
const StoryScreen = ({ item }: StoryProps) => {
    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFillObject}>
                <SuperImage superId={item.storyList[0].source as number} />
            </View>
            <View style={styles.topInfo}></View>
        </View>
    )
}

export default StoryScreen

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    toolWrapper: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        paddingTop: STATUS_BAR_HEIGHT
    },
    topInfo: {
        height: 50 + STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT
    }
})
