import { firestore } from 'firebase'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { ExtraPost } from '../../reducers/postReducer'
export interface PostMessageProps {
    postId: number,
    maxWidth: number
}
const PostMessage = ({ postId, maxWidth }: PostMessageProps) => {
    const [post, setPost] = useState<ExtraPost>()
    useEffect(() => {
        ; (async () => {
            const ref = firestore()
            const rq = await ref.collection('posts').doc(`${postId}`).get()
            if (rq.exists) {
                const data: ExtraPost = rq.data() || {}
                const rq2 = await ref.collection('users').doc(`${data.userId}`).get()
                data.ownUser = rq2.data()
                setPost(data)
            }
        })()
    }, [postId])
    if (!!!post) return <View style={styles.container} />
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FastImage
                    source={{
                        uri: post.ownUser?.avatarURL
                    }}
                    style={styles.avatar} />
                <Text style={{
                    marginLeft: 10,
                    fontWeight: 'bold'
                }}>{post.ownUser?.username}</Text>
            </View>
            <View style={styles.body}>
                {post.source &&
                    <FastImage
                        source={{
                            uri: post.source[0].uri
                        }}
                        style={{
                            borderBottomLeftRadius: !!post?.content ? 0 : 25,
                            borderBottomRightRadius: !!post?.content ? 0 : 25,
                            width: maxWidth,
                            height: maxWidth / post.source[0].width * post.source[0].height
                        }} />
                }
            </View>
            {!!post?.content && post?.content?.length > 0 &&
                <View style={styles.footer}>
                    <Text
                        numberOfLines={2}
                        style={{
                            maxHeight: '100%',
                            fontWeight: '500'
                        }}><Text style={{
                            marginLeft: 10,
                            fontWeight: 'bold'
                        }}>{post.ownUser?.username}</Text> {post.content}</Text>
                </View>
            }
        </View>
    )
}

export default PostMessage

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 400
    },
    header: {
        backgroundColor: "#ddd",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    avatar: {
        height: 30,
        width: 30,
        borderRadius: 30,
        borderColor: '#333',
        borderWidth: 0.3
    },
    body: {
        width: '100%',
    },
    footer: {
        height: 50,
        backgroundColor: "#ddd",
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10
    }
})
