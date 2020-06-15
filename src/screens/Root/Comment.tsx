import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useRef, useState } from 'react'
import { KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import CommentInputPopup from '../../components/CommentInputPopup'
import CommentList from '../../components/CommentList'
import { SuperRootStackParamList } from '../../navigations'
type CommentRouteProp = RouteProp<SuperRootStackParamList, 'Comment'>

type CommentNavigationProp = StackNavigationProp<SuperRootStackParamList, 'Comment'>

type CommentProps = {
    navigation: CommentNavigationProp,
    route: CommentRouteProp
}

const index = ({ navigation, route }: CommentProps) => {
    const postId = route.params.postId
    const postData = route.params.postData
    const commentInputRef = useRef<TextInput>(null)
    const [currentReplyCommentId, setCurrentReplyCommentId] = useState<number>(0)
    const [currentReplyUsername, setCurrentReplyUsername] = useState<string>('')
    const _onGoBack = () => {
        navigation.goBack()
    }
    const _onShareToDirect = () => {

    }
    const _onReply = (commentId: number, targetUsername: string) => {
        commentInputRef.current?.focus()
        setCurrentReplyCommentId(commentId)
        setCurrentReplyUsername(targetUsername)
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="height" style={{
                position: 'relative',
            }} >
                <View style={styles.navigationBar}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <TouchableOpacity
                            onPress={_onGoBack}
                            style={styles.btnBack}>
                            <Icons name="arrow-left" size={20} />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600'
                        }}>Comments</Text>
                    </View>
                </View>
                <CommentList postData={postData} onReply={_onReply} postId={postId} />
                <CommentInputPopup
                    replyToCommentUsername={currentReplyUsername}
                    replyToCommentId={currentReplyCommentId}
                    preValue={currentReplyUsername ? `@${currentReplyUsername} ` : ''}
                    commentInputRef={commentInputRef}
                    id={postId} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%'
    },
    navigationBar: {
        flexDirection: 'row',
        height: 44,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    btnBack: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
})
