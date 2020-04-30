import React, { useRef, useEffect, useState } from 'react'
import {
    StyleSheet, Text, View,
    KeyboardAvoidingView, TextInput,
    SafeAreaView, TouchableOpacity, ScrollView,
    FlatList
} from 'react-native'
import { RouteProp } from '@react-navigation/native'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { SuperRootStackParamList } from '../../navigations'
import { StackNavigationProp } from '@react-navigation/stack'
import CommentInputPopup from '../../components/CommentInputPopup'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import { useDispatch } from 'react-redux'
import { useSelector } from '../../reducers'
import { FetchCommentListRequest } from '../../actions/commentActions'
import CommentItem from '../../components/CommentList/CommentItem'
import PostContentItem from '../../components/CommentList/PostContentItem'
type CommentRouteProp = RouteProp<SuperRootStackParamList, 'Comment'>

type CommentNavigationProp = StackNavigationProp<SuperRootStackParamList, 'Comment'>

type CommentProps = {
    navigation: CommentNavigationProp,
    route: CommentRouteProp
}

const index = ({ navigation, route }: CommentProps) => {
    const dispatch = useDispatch()
    const comment = useSelector(state => state.comment)
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const postId = route.params.postId
    const commentInputRef = useRef<TextInput>(null)
    useEffect(() => {
        dispatch(FetchCommentListRequest(postId))
    }, [])
    const _onGoBack = () => {
        navigation.goBack()
    }
    const _onShareToDirect = () => {

    }
    const _onRefresh = () => {
        setRefreshing(true)
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
                    <TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onShareToDirect}
                            style={styles.btnBack}>
                            <Icons name="send" size={20} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
                <FlatList style={{
                    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
                }}
                    refreshing={refreshing}
                    onRefresh={_onRefresh}
                    ListHeaderComponent={() => <PostContentItem item={comment.post} />}
                    renderItem={({ item }) => <CommentItem />}
                    keyExtractor={(item, index) => `${index}`}
                    data={comment.comments}
                >
                </FlatList>
                <CommentInputPopup
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
