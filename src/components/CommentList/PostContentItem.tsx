import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ExtraPost } from '../../reducers/postReducer'
export interface PostContentItemProps {
    item: ExtraPost
}
const CommentItem = ({ item }: PostContentItemProps) => {
    return (
        <View>
            <Text>A</Text>
        </View>
    )
}

export default CommentItem

const styles = StyleSheet.create({})
