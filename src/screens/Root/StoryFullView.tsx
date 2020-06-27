import React from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import SuperImage from '../../components/SuperImage'
import { useSelector } from '../../reducers'
import StoryView from '../../components/StoryView'

const StoryFullView = () => {
    const stories = useSelector(state => state.storyList)
    return (
        <View style={styles.container}>
            <StoryView data={stories} />
        </View>
    )
}

export default StoryFullView

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        width: '100%',
        height: '100%'
    }
})
