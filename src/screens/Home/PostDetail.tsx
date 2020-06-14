import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import NavigationBar from '../../components/NavigationBar'
import { goBack } from '../../navigations/rootNavigation'
import { RouteProp } from '@react-navigation/native'
import { SuperRootStackParamList } from '../../navigations'
import { Post, ExtraPost } from '../../reducers/postReducer'
import { firestore } from 'firebase'
import PostItem from '../../components/PostList/PostItem'

type GalleryChooserRouteProp = RouteProp<SuperRootStackParamList, 'PostDetail'>


type GalleryChooserProps = {
    route: GalleryChooserRouteProp
}
const PostDetail = ({ route }: GalleryChooserProps) => {
    const postId = route.params.postId
    const [post, setPost] = useState<ExtraPost>({})
    useEffect(() => {
        const ref = firestore()
        ref.collection('posts').doc(`${postId}`).get().then(rs => {
            if (rs.exists) {
                const data: ExtraPost = rs.data() || {}
                const ownId = data.userId
                ref.collection('users').doc(`${ownId}`).get().then(rs2 => {
                    data.ownUser = rs2.data()
                    post.notificationUsers = data.notificationUsers || []
                    setPost(data)
                })
            } else goBack()
        })
        return () => {
            setPost({})
        }
    }, [])
    // TASK: ADD CHANGE POST OPTIONS FOR DETAIL POST STATE
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="Photo" callback={goBack} />
            {post.hasOwnProperty('uid') && <PostItem
                item={post || {}} />}
        </SafeAreaView>
    )
}

export default PostDetail

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    }
})
