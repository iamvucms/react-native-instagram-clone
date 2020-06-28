import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import StoryView from '../../components/StoryView'
import { SuperRootStackParamList } from '../../navigations'
import { useSelector } from '../../reducers'
type StoryFullViewRouteProp = RouteProp<SuperRootStackParamList, 'StoryFullView'>
type StoryFullViewProps = {
    route: StoryFullViewRouteProp
}
const StoryFullView = ({ route }: StoryFullViewProps) => {
    const groupIndex = route.params.groupIndex
    const stories = useSelector(state => state.storyList)
    return (
        <View style={styles.container}>
            <StoryView groupIndex={groupIndex} data={stories} />
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
