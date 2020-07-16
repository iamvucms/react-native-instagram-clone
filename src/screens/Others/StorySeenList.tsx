import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SuperRootStackParamList } from '../../navigations'
import { RouteProp } from '@react-navigation/native'
type StorySeenListRouteProp = RouteProp<SuperRootStackParamList, 'StorySeenList'>

type StorySeenListProps = {
    route: StorySeenListRouteProp
}
const StorySeenList = ({ route }: StorySeenListProps) => {
    const { extraStory, childIndex } = route.params
    return (
        <View>
            <Text></Text>
        </View>
    )
}

export default StorySeenList

const styles = StyleSheet.create({})
