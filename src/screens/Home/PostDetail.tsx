import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TextInput, KeyboardAvoidingView } from 'react-native'
import NavigationBar from '../../components/NavigationBar'
import { goBack } from '../../navigations/rootNavigation'
import { RouteProp } from '@react-navigation/native'
import { SuperRootStackParamList } from '../../navigations'
import { Post, ExtraPost } from '../../reducers/postReducer'
import { firestore } from 'firebase'
import PostItem from '../../components/PostList/PostItem'
import CommentInputPopup from '../../components/CommentInputPopup'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import { ScrollView } from 'react-native-gesture-handler'

type GalleryChooserRouteProp = RouteProp<SuperRootStackParamList, 'PostDetail'>


type GalleryChooserProps = {
    route: GalleryChooserRouteProp
}
const PostDetail = ({ route }: GalleryChooserProps) => {
    const postId = route.params.postId
    const _commentInputRef = useRef<TextInput>(null)
    const [showCommentInput, setShowCommentInput] = useState<boolean>(false)
    const [post, setPost] = useState<ExtraPost>({})
    const ref = useRef<{
        scrollHeight: number,
        preOffsetY: number,
        currentCommentId: number,
        commentContents: {
            id: number, content: string
        }[]
    }>({
        scrollHeight: 0, preOffsetY: 0,
        commentContents: [], currentCommentId: 0
    })
    useEffect(() => {
        const ref = firestore()
        ref.collection('posts').doc(`${postId}`).get().then(rs => {
            if (rs.exists) {
                const data: ExtraPost = rs.data() || {}
                const ownId = data.userId
                ref.collection('users').doc(`${ownId}`).get().then(rs2 => {
                    data.ownUser = rs2.data()
                    data.notificationUsers = data.notificationUsers || []
                    rs.ref.collection('comments')
                        .orderBy('create_at', 'desc').get().then(rs3 => {
                            data.comments = rs3.docs.map(x => x.data())
                            setPost(data)
                        })
                })
            } else goBack()
        })
        return () => {
            setPost({})
        }
    }, [])
    const _showCommentInput = React.useCallback((id: number, prefix?: string) => {
        if (id !== 0) {
            const check = ref.current.commentContents.every((x, index) => {
                if (x.id === id) {
                    if (prefix) {
                        ref.current.commentContents[index].content = prefix
                    }
                    return false
                }
                return true
            })
            if (check) {
                ref.current.commentContents.push({
                    id: id,
                    content: prefix || ''
                })
            }
            ref.current.currentCommentId = id
            setShowCommentInput(true)
        }
    }, [])
    const _setCommentContents = (id: number, content: string) => {
        ref.current.commentContents.filter(x => x.id === id)[0].content = content
    }
    // TASK: ADD CHANGE POST OPTIONS FOR DETAIL POST STATE
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="height" style={{
                height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT
            }}>
                <NavigationBar title="Photo" callback={goBack} />
                <ScrollView>
                    {post.hasOwnProperty('uid') && <PostItem
                        setPost={setPost}
                        showCommentInput={_showCommentInput}
                        item={post || {}} />}
                </ScrollView>
                {showCommentInput && <CommentInputPopup
                    postData={post}
                    setPost={setPost}
                    onDone={setShowCommentInput.bind(null, false)}
                    setCommentContents={_setCommentContents}
                    id={ref.current.currentCommentId}
                    preValue={ref.current.commentContents
                        .filter(x => x.id === ref.current.currentCommentId)[0]?.content || ""}
                    commentInputRef={_commentInputRef} />}
            </KeyboardAvoidingView>
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
