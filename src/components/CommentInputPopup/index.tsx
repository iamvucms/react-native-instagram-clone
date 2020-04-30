import React, { RefObject, useState, useRef } from 'react'
import {
    StyleSheet, Text, View,
    TouchableOpacity, TextInput, ScrollView,
    Image,
    Animated,
    Keyboard
} from 'react-native'
import { useSelector } from '../../reducers'
import { SCREEN_WIDTH } from '../../constants'
import { useDispatch } from 'react-redux'
import { PostCommentRequest } from '../../actions/postActions'

export interface CommentInputPopupProps {
    commentInputRef: RefObject<TextInput>,
    id: number,
    setCommentContents?: (id: number, content: string) => void,
    preValue?: string
}
const index = ({ commentInputRef, preValue,
    setCommentContents, id }: CommentInputPopupProps) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user)
    const [text, setText] = useState<string>(preValue || '')
    const [commenting, setCommenting] = useState<boolean>(false)
    const _loadingDeg = new Animated.Value(0)
    const _onAnimatedLoading = () => {
        Animated.timing(_loadingDeg, {
            toValue: 5,
            duration: 2000,
            useNativeDriver: true
        }).start()
    }
    const _addEmoji = (icon: string) => {
        setText(`${text}${icon}`)
        if (setCommentContents) setCommentContents(id, `${text}${icon}`)
    }
    const _postComment = async () => {
        setCommenting(true)
        await dispatch(PostCommentRequest(id, text))
        setCommenting(false)
        setText('')
        Keyboard.dismiss()
        if (setCommentContents) setCommentContents(id, '')
    }
    return (
        <View style={styles.commentInputWrapper}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{
                    height: 36,
                    borderBottomColor: "#ddd",
                    borderBottomWidth: 1
                }}
                bounces={false}
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
                <TouchableOpacity onPress={_addEmoji.bind(null, '❤')} style={styles.iconItem}>
                    <Text style={styles.icon}>❤</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '🙌')} style={styles.iconItem}>
                    <Text style={styles.icon}>🙌</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😎')} style={styles.iconItem}>
                    <Text style={styles.icon}>😎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😉')} style={styles.iconItem}>
                    <Text style={styles.icon}>😉</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😅')} style={styles.iconItem}>
                    <Text style={styles.icon}>😅</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😀')} style={styles.iconItem}>
                    <Text style={styles.icon}>😀</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😃')} style={styles.iconItem}>
                    <Text style={styles.icon}>😃</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😊')} style={styles.iconItem}>
                    <Text style={styles.icon}>😊</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😋')} style={styles.iconItem}>
                    <Text style={styles.icon}>😋</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😋')} style={styles.iconItem}>
                    <Text style={styles.icon}>🤧</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={_addEmoji.bind(null, '😮')} style={styles.iconItem}>
                    <Text style={styles.icon}>😮</Text>
                </TouchableOpacity>
            </ScrollView>
            <View style={styles.inputWrapper}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Image style={styles.avatar} source={{
                        uri: user.userInfo?.avatarURL,
                        cache: 'force-cache'
                    }} />
                    <TextInput
                        value={text}
                        onChangeText={e => {
                            if (setCommentContents) setCommentContents(id, e)
                            setText(e)
                        }}
                        placeholder="Add a comment..."
                        onLayout={() => commentInputRef.current?.focus()}
                        ref={commentInputRef}
                        style={styles.commentInput} />
                </View>
                <TouchableOpacity
                    disabled={commenting || text.length === 0}
                    onPress={_postComment}
                    style={styles.btnPost}>
                    {!commenting && <Text style={{
                        color: '#318bfb',
                        fontWeight: '600'
                    }}>POST</Text>}
                    {commenting && <Animated.Image
                        onLayout={_onAnimatedLoading}
                        style={{
                            height: 30,
                            width: 30,
                            transform: [{
                                rotate: _loadingDeg.interpolate({
                                    inputRange: [0, 5],
                                    outputRange: ['0deg', '1800deg']
                                })
                            }]
                        }}
                        source={require('../../assets/icons/waiting.png')}
                    />}
                </TouchableOpacity>
            </View>
        </View >
    )
}

export default React.memo(index)

const styles = StyleSheet.create({
    commentInputWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#fff"
    },
    iconItem: {
        height: 36,
        width: 36,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        fontSize: 18
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingHorizontal: 15
    },
    avatar: {
        height: 30,
        width: 30,
        borderRadius: 30
    },
    commentInput: {
        paddingHorizontal: 10,
        height: 44,
        width: SCREEN_WIDTH - 30 - 30 - 40,
        fontSize: 16
    },
    btnPost: {
        width: 40
    }
})
