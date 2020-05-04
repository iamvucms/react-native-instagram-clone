import React, { RefObject, useState, useRef, useEffect } from 'react'
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
import { PostReplyRequest } from '../../actions/commentActions'

export interface CommentInputPopupProps {
    commentInputRef: RefObject<TextInput>,
    id: number,
    setCommentContents?: (id: number, content: string) => void,
    preValue?: string,
    replyToCommentId?: number,
    replyToCommentUsername?: string,
}
const index = ({ commentInputRef, preValue,
    replyToCommentId, replyToCommentUsername,
    setCommentContents, id }: CommentInputPopupProps) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user)
    const ref = useRef<{ isReplying: boolean }>({ isReplying: false })
    const [text, setText] = useState<string>(preValue || '')
    const [commenting, setCommenting] = useState<boolean>(false)
    const _loadingDeg = new Animated.Value(0)
    const [topOffset, setTopOffset] = useState<number>(0)
    const _onAnimatedLoading = () => {
        Animated.timing(_loadingDeg, {
            toValue: 5,
            duration: 2000,
            useNativeDriver: true
        }).start()
    }
    useEffect(() => {
        if (replyToCommentId && replyToCommentId !== 0) {
            ref.current.isReplying = true
            setTopOffset(-36)
        }
    }, [replyToCommentId])
    useEffect(() => {
        if (preValue !== undefined) {
            setText(preValue)
        }
    }, [preValue])
    const _addEmoji = (icon: string) => {
        setText(`${text}${icon}`)
        if (setCommentContents) setCommentContents(id, `${text}${icon}`)
    }
    const _onHideReplyLabel = () => {
        ref.current.isReplying = false
        setTopOffset(0)
    }
    const _postComment = () => {
        setCommenting(true)
        if (ref.current.isReplying && replyToCommentId) {
            (async () => {
                await dispatch(PostReplyRequest(replyToCommentId, text))
            })().then(() => {
                _onHideReplyLabel()
                setCommenting(false)
                setText('')
                Keyboard.dismiss()
            })

        } else (async () => {
            await dispatch(PostCommentRequest(id, text))
        })().then(() => {
            setCommenting(false)
            setText('')
            Keyboard.dismiss()
            if (setCommentContents) setCommentContents(id, '')
        })

    }

    return (
        <View style={styles.commentInputWrapper}>
            <Animated.View style={{
                ...styles.replyLabelWrapper,
                top: topOffset
            }}>
                <Text style={{
                    color: "#666"
                }}>
                    Replying to {replyToCommentUsername}
                </Text>
                <TouchableOpacity
                    onPress={_onHideReplyLabel}
                    style={styles.btnHideReplyLabel}>
                    <Text style={{
                        color: "#666",
                        fontSize: 20
                    }}>×</Text>
                </TouchableOpacity>
            </Animated.View>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{
                    height: 36,
                    borderBottomColor: "#ddd",
                    borderBottomWidth: 1,
                    borderTopColor: "#ddd",
                    borderTopWidth: 1,
                    backgroundColor: '#fff'
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
    },
    replyLabelWrapper: {
        height: 36,
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 15,
        position: 'absolute',
        zIndex: -1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ddd'
    },
    btnHideReplyLabel: {
    }
})
