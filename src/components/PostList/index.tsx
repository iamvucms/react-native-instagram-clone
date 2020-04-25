import React, { useEffect } from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import PostItem from './PostItem'
import { useDispatch } from 'react-redux'
import { useSelector } from '../../reducers'
import { FetchPostListRequest } from '../../actions/postActions'

export interface PostListProps {

}
const index = (props: PostListProps) => {
    const dispatch = useDispatch()
    const postList = useSelector(state => state.postList)
    useEffect(() => {
        // dispatch(FetchPostListRequest())
    }, [])
    return (
        <View>
            <PostItem />
        </View>
    )
}

export default React.memo(index)

const styles = StyleSheet.create({})
