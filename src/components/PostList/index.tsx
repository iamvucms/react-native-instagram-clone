import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { PostList } from '../../reducers/postReducer'
import PostItem from './PostItem'
export interface PostListProps {
    data: PostList,
    showCommentInput: (id: number, prefix?: string) => void
}
const index = ({ data, showCommentInput }: PostListProps) => {

    useEffect(() => {
    }, [])
    return (
        <View style={styles.container}>
            {data.map((post, index) => (
                <PostItem
                    showCommentInput={showCommentInput}
                    key={index} item={post} />
            ))}
        </View>
    )
}

export default React.memo(index)

const styles = StyleSheet.create({
    container: {

    }
})
