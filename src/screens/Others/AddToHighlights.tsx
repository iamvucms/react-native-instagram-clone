import { RouteProp } from '@react-navigation/native'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Keyboard, KeyboardAvoidingView, LayoutChangeEvent, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import HighlightPreviewList from '../../components/Highlight/HighlightPreviewList'
import { SuperRootStackParamList } from '../../navigations'
import { goBack } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'
import { StoryProcessedImage } from './StoryProcessor'
import { useDispatch } from 'react-redux'
import { AddStoryToHighlightRequest } from '../../actions/userActions'
type AddToHighlightsRouteProp = RouteProp<SuperRootStackParamList, 'AddToHighlights'>
type AddToHighlightsProps = {
    route: AddToHighlightsRouteProp
}
const AddToHighlights = ({ route }: AddToHighlightsProps) => {
    const dispatch = useDispatch()
    const { superId, uid } = route?.params || {}
    const userState = useSelector(state => state.user)
    const highlights = [...(userState.highlights || [])]
    const [coverUri, setCoverUri] = useState<string>('')
    highlights.reverse()
    const [name, setName] = useState<string>('')
    const [showCreation, setShowCreation] = useState<boolean>(false)
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number
    }>({
        bottomSheetHeight: 0
    })
    Keyboard.addListener('keyboardWillShow', () => {
        _bottomSheetOffsetY.setValue(40)
    })
    Keyboard.addListener('keyboardWillHide', () => {
        _bottomSheetOffsetY.setValue(0)
    })
    //effect
    useEffect(() => {
        ; (async () => {
            const db = firestore()
            const rq = await db.collection('superimages')
                .where('uid', '==', superId).get()
            if (rq.size > 0) {
                const doc = rq.docs.map(x => x.data() as StoryProcessedImage)[0]
                setCoverUri(doc.uri)
            }
        })()
    }, [])
    const _onGestureEventHandler = ({ nativeEvent: {
        translationY
    } }: PanGestureHandlerGestureEvent) => {
        if (translationY > 0) {
            _bottomSheetOffsetY.setValue(translationY)
        }
    }
    const _onStateChangeHandler = ({
        nativeEvent: {
            translationY,
            state
        }
    }: PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            if (translationY > ref.current.bottomSheetHeight * 0.6) {
                Animated.timing(_bottomSheetOffsetY, {
                    toValue: ref.current.bottomSheetHeight,
                    useNativeDriver: true,
                    duration: 150
                }).start(() => goBack())
            } else {
                Animated.spring(_bottomSheetOffsetY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start()
            }
        }
    }
    const _onCreateHighlight = () => {
        if (name.length > 0) {
            dispatch(AddStoryToHighlightRequest([{
                create_at: new Date().getTime(),
                uid,
                superId
            }], name, coverUri))
            setShowCreation(false)
        }
    }
    const _onCreateNewHighlight = () => {
        setShowCreation(true)
    }
    return (
        <KeyboardAvoidingView behavior="height">
            <TouchableOpacity
                onPress={goBack}
                style={{
                    height: '100%',
                    width: '100%',
                }}>

            </TouchableOpacity>
            <PanGestureHandler
                onGestureEvent={_onGestureEventHandler}
                onHandlerStateChange={_onStateChangeHandler}
            >
                <Animated.View
                    onLayout={({ nativeEvent: { layout: { height } } }: LayoutChangeEvent) => {
                        ref.current.bottomSheetHeight = height
                    }}
                    style={{
                        ...styles.bottomSheet,
                        transform: [{
                            translateY: _bottomSheetOffsetY
                        }]
                    }}>
                    <View style={styles.titleWrapper}>
                        <View style={{
                            height: 3,
                            width: 40,
                            backgroundColor: '#999',
                            borderRadius: 2,
                        }} />
                        <View style={{
                            marginTop: 15,
                            flexDirection: 'row',
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            {showCreation &&
                                <TouchableOpacity
                                    onPress={() => setShowCreation(false)}
                                    style={{
                                        position: 'absolute',
                                        zIndex: 1,
                                        left: 0,
                                        top: 0,
                                        width: 50,
                                        height: 30,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="arrow-left" size={20} />
                                </TouchableOpacity>
                            }
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '500'
                            }}>{showCreation
                                ? 'New Highlight'
                                : 'Add to Highlights'}</Text>
                        </View>
                    </View>
                    <View style={{
                        ...(showCreation ? {
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 15
                        } : {})
                    }}>
                        {!showCreation &&
                            <HighlightPreviewList
                                onAddPress={_onCreateNewHighlight}
                                inStoryAddition={true}
                                additionSuperId={superId}
                                addtionUid={uid}
                                highlights={highlights}
                                showAdder={true} />
                        }
                        {showCreation &&
                            <React.Fragment>
                                <View
                                    style={styles.borderCover}>
                                    <FastImage source={{
                                        uri: coverUri
                                    }}
                                        style={styles.avatar}
                                    />
                                </View>
                                <TextInput
                                    placeholder="Highlights"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.nameInput} />
                            </React.Fragment>
                        }
                    </View>
                    {showCreation ? (
                        <TouchableOpacity
                            onPress={_onCreateHighlight}
                            style={{
                                ...styles.btnCancel,
                                ...styles.btnCreate
                            }}>
                            <Text style={{
                                fontWeight: 'bold',
                                color: '#fff'
                            }}>Add</Text>
                        </TouchableOpacity>
                    ) : (
                            <TouchableOpacity
                                onPress={goBack}
                                style={styles.btnCancel}>
                                <Text style={{
                                    fontWeight: 'bold'
                                }}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                </Animated.View>
            </PanGestureHandler>
        </KeyboardAvoidingView >
    )
}

export default AddToHighlights

const styles = StyleSheet.create({
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: 40,
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    titleWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd',
        marginBottom: 15
    },
    optionItem: {
        flexDirection: 'row',
        height: 44,
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        alignItems: 'center'
    },
    btnCancel: {
        height: 44,
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: "#ddd",
        borderTopWidth: 0.5
    },
    btnCreate: {
        backgroundColor: "#318bfb",
        borderTopWidth: 0
    },
    borderCover: {
        borderRadius: 999,
        padding: 2,
        borderColor: '#999',
        borderWidth: 1,
        overflow: "hidden",
    },
    avatar: {
        height: 64,
        width: 64,
        borderRadius: 64,
    },
    nameInput: {
        marginTop: 10
    }
})
