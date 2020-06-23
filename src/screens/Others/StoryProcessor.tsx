import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, Animated, View, Image, ImageBackground, ScrollView, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import { RouteProp } from '@react-navigation/native'
import { SuperRootStackParamList } from '../../navigations'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { goBack } from '../../navigations/rootNavigation'
import { RotationGestureHandler, PinchGestureHandler, PinchGestureHandlerGestureEvent, RotationGestureHandlerGestureEvent, State, PanGestureHandler, PanGestureHandlerGestureEvent, TextInput } from 'react-native-gesture-handler'
import { useKeyboardStatus } from '../../hooks/useKeyboardStatus'

type StoryProcessorRouteProp = RouteProp<SuperRootStackParamList, 'StoryProcessor'>
type StoryProcessorProps = {
    route: StoryProcessorRouteProp
}
type StoryText = {
    text: string,
    x: number,
    y: number,
    animX: Animated.Value,
    animY: Animated.Value,
    fontSize: number,
    width: number,
    height: number,
    textBg: boolean,
    textAlign: 'flex-start' | 'center' | 'flex-end',
    color: string,
    ratio: number,
    animRatio: Animated.Value
}
export type StoryProcessedImage = {
    uri: string,
    width: number,
    height: number,
    base64: string,
    ratio: number,
    translateX: number,
    translateY: number,
    rotateDeg: number,
    texts: StoryText[]
}

const textColors = [
    '#000', '#fff', '#318bfb', '#6cc070', '#ffcc00',
    '#f37121', '#c70039', '#512b58', '#ff926b', '#fff3cd', '#ffe277'
    , '#4d3e3e', '#3f3f44'
]

const StoryProcessor = ({ route }: StoryProcessorProps) => {
    const { images } = route.params
    const keyboard = useKeyboardStatus()
    const [currentImageIndex, setCurrentIndex] = useState<number>(0)
    const [text, setText] = useState<string>('')
    const [dragging, setDragging] = useState<boolean>(false)
    const [textColor, setTextColor] = useState<string>('#fff')
    const [textAlign, setTextAlign] = useState<'flex-start' | 'center' | 'flex-end'>('center')
    const [textBg, setTextBg] = useState<boolean>(false)
    const _trashCanRef = useRef<View>(null)
    const _animRatioTrashCan = React.useMemo(() => new Animated.Value(1), [])
    const _hScrollRef = useRef<ScrollView>(null)
    const _rotationRefList = [...images].map(img => useRef<RotationGestureHandler>(null))
    const _pinchRefList = [...images].map(img => useRef<PinchGestureHandler>(null))
    /**
     * mode
     * 1: general
     * 2: TextEdit
     * 3: Emoji
     */
    const [mode, setMode] = useState<1 | 2 | 3>(1)
    //Init animated value
    const _scaleAnimList = [...images].map(img => React.useMemo(() => new Animated.Value(SCREEN_WIDTH / img.width), []))
    const _rotateAnimList = [...images].map(img => React.useMemo(() => new Animated.Value(0), []))
    const _translateXAnimList = [...images].map(img => React.useMemo(() => new Animated.Value(0), []))
    const _translateYAnimList = [...images].map(img => React.useMemo(() => new Animated.Value(0), []))
    const [enableGesture, setEnableGesture] = useState<boolean>(true)
    const ref = useRef<{
        processImages: StoryProcessedImage[],
        textWidth: number,
        textHeight: number,
        trashCanX: number,
        trashCanY: number,
        zoomTrashCan: boolean,
    }>({
        processImages: [...images].map(img => {
            return {
                base64: img.base64,
                uri: img.uri,
                width: img.width,
                height: img.height,
                ratio: SCREEN_WIDTH / img.width,
                translateX: 0,
                translateY: 0,
                rotateDeg: 0,
                texts: []
            }
        }),
        textWidth: 0,
        textHeight: 0,
        trashCanX: (SCREEN_WIDTH - 44) / 2,
        trashCanY: (SCREEN_HEIGHT - 62),
        zoomTrashCan: false,
    })
    useEffect(() => {
        _hScrollRef.current?.scrollTo({
            x: SCREEN_WIDTH * currentImageIndex,
            y: 0,
            animated: true
        })
    }, [currentImageIndex])
    useEffect(() => {
        if (!keyboard) {
            setMode(1)
        }
    }, [keyboard])
    const _onEndDrag = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const tabIndex = Math.floor(x / SCREEN_WIDTH)
        const percentOffset = (x - tabIndex * SCREEN_WIDTH) / SCREEN_WIDTH
        let nextTabIndex = 0
        if (percentOffset > 0.5) {
            nextTabIndex = tabIndex + 1
        } else {
            nextTabIndex = tabIndex
        }
        _hScrollRef.current?.scrollTo({
            x: nextTabIndex * SCREEN_WIDTH,
            y: 0,
            animated: true
        })
        setCurrentIndex(nextTabIndex)
    }
    //Translate processor
    const _onTranslateHandler = ({ nativeEvent: {
        translationX,
        translationY,
    } }: PanGestureHandlerGestureEvent) => {
        _translateXAnimList[currentImageIndex].setValue(
            ref.current.processImages[currentImageIndex].translateX + translationX
        )
        _translateYAnimList[currentImageIndex].setValue(
            ref.current.processImages[currentImageIndex].translateY + translationY
        )
    }
    const _onTranslateStateChange = ({ nativeEvent: {
        translationX,
        translationY,
        state,
    } }: PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.processImages[currentImageIndex].translateX += translationX
            ref.current.processImages[currentImageIndex].translateY += translationY
        }
    }
    //Zoom processor
    const _onZoomHandler = ({ nativeEvent: {
        scale
    } }: PinchGestureHandlerGestureEvent) => {
        _scaleAnimList[currentImageIndex].setValue(
            ref.current.processImages[currentImageIndex].ratio * scale)
    }
    const _onZoomStateChange = ({ nativeEvent: {
        scale, state
    } }: PinchGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.processImages[currentImageIndex].ratio *= scale

        }
    }
    //Rotation processor
    const _onRotateHandler = ({ nativeEvent: {
        rotation
    } }: RotationGestureHandlerGestureEvent) => {
        _rotateAnimList[currentImageIndex].setValue(
            ref.current.processImages[currentImageIndex].rotateDeg + rotation)
    }
    const _onRotateStateChange = ({ nativeEvent: {
        rotation, state
    } }: RotationGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.processImages[currentImageIndex].rotateDeg += rotation
        }
    }

    const _onText = () => {
        setMode(2)
        refreshTextState()
    }
    const refreshTextState = () => {
        setText('')
        setTextAlign('center')
        setTextBg(false)
        setTextColor('#fff')
    }
    const _onChangeTextAlign = () => {
        if (textAlign === 'center') setTextAlign('flex-start')
        else if (textAlign === 'flex-start') setTextAlign('flex-end')
        else if (textAlign === 'flex-end') setTextAlign('center')
    }
    const _onDoneText = () => {
        if (text.length > 0) {
            const offsetX = textAlign === 'center' ? (SCREEN_WIDTH - ref.current.textWidth) / 2 : (
                textAlign === 'flex-start' ? 15 : SCREEN_WIDTH - ref.current.textWidth - 15
            )
            const storyText: StoryText = {
                color: textColor,
                fontSize: 40,
                text,
                textAlign,
                textBg,
                x: offsetX,
                y: (SCREEN_HEIGHT - ref.current.textHeight) / 2,
                animX: new Animated.Value(offsetX),
                animY: new Animated.Value((SCREEN_HEIGHT - ref.current.textHeight) / 2),
                height: ref.current.textHeight,
                width: ref.current.textWidth,
                ratio: 1,
                animRatio: new Animated.Value(1)
            }
            ref.current.processImages[currentImageIndex].texts.push(storyText)
        }
        setMode(1)
    }
    //Label translate processor
    const _onLabelTranslateHandler = (index: number,
        { nativeEvent: {
            translationX, translationY
        } }: PanGestureHandlerGestureEvent
    ) => {

        if (!dragging) setDragging(true)
        const label = ref.current.processImages[currentImageIndex].texts[index]

        if (Math.abs((label.y + translationY + label.height) * label.ratio - ref.current.trashCanY) < 50) {
            if (!ref.current.zoomTrashCan) {
                Animated.spring(_animRatioTrashCan, {
                    toValue: 1.5,
                    useNativeDriver: true
                }).start(() => ref.current.zoomTrashCan = true)
            }
        } else {
            if (ref.current.zoomTrashCan) {
                Animated.spring(_animRatioTrashCan, {
                    toValue: 1,
                    useNativeDriver: true
                }).start(() => ref.current.zoomTrashCan = false)
            }
        }
        label.animX.setValue((label.x + translationX) * label.ratio)
        label.animY.setValue((label.y + translationY) * label.ratio)
    }
    const _onLabelTranslateChangeState = (index: number,
        { nativeEvent: {
            translationX, translationY, state
        } }: PanGestureHandlerGestureEvent
    ) => {
        setDragging(false)
        if (state === State.END) {
            const label = ref.current.processImages[currentImageIndex].texts[index]
            label.x += translationX
            label.y += translationY
            if (Math.abs((label.y + label.height) * label.ratio
                - ref.current.trashCanY) < 50
            ) {
                ref.current.processImages[currentImageIndex].texts.splice(index, 1)
                setMode(1)
            }
            ref.current.zoomTrashCan = false
        }
    }
    //Label zoom processor
    const _onLabelZoomHandler = (index: number,
        { nativeEvent: {
            scale
        } }: PinchGestureHandlerGestureEvent
    ) => {
        const label = ref.current.processImages[currentImageIndex].texts[index]
        label.animRatio.setValue(label.ratio * scale)
    }
    const _onLabelZoomChangeState = (index: number,
        { nativeEvent: {
            scale, state
        } }: PinchGestureHandlerGestureEvent
    ) => {
        if (state === State.END) {
            const label = ref.current.processImages[currentImageIndex].texts[index]
            label.ratio *= scale
        }
    }
    const _onNext = () => {

    }
    return (
        <>
            {mode === 1 && !dragging &&
                <View style={styles.topOptionsWrapper}>
                    <TouchableOpacity
                        onPress={goBack}
                        style={styles.btnTopOption}>
                        <Text style={{
                            fontSize: 30,
                            color: '#fff',
                        }}>✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnTopOption}>
                        <Icon name="sticker-emoji" size={30} color='#fff' />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={_onText}
                        style={styles.btnTopOption}>
                        <Icon name="alpha-a-box" size={30} color='#fff' />
                    </TouchableOpacity>
                </View>
            }
            {mode === 2 &&
                <KeyboardAvoidingView
                    behavior="height"
                    style={styles.textToolWrapper}>
                    <View style={styles.textTopOptions}>
                        <TouchableOpacity
                            onPress={_onChangeTextAlign}
                            style={styles.btnTopOption}>
                            <Icon name={textAlign === 'center' ? 'format-align-center' : (
                                textAlign === 'flex-start' ? 'format-align-left' : 'format-align-right'
                            )} size={30} color='#fff' />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={setTextBg.bind(null, !textBg)}
                            style={styles.btnTopOption}>
                            <Icon name={textBg ? 'alpha-a-box' : "alpha-a"} size={30} color='#fff' />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onDoneText}
                            style={{
                                ...styles.btnTopOption,
                                width: 60
                            }}>
                            <Text style={{
                                fontWeight: 'bold',
                                color: '#fff',
                                fontSize: 18
                            }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        ...styles.textWrapper,
                        justifyContent: textAlign
                    }}>
                        <TouchableOpacity style={{
                            backgroundColor: textBg ? textColor :
                                'rbga(0,0,0,0)',
                            padding: 5,
                            borderRadius: 5
                        }}>
                            <TextInput
                                onContentSizeChange={e => {
                                    ref.current.textHeight = e.nativeEvent.contentSize.height
                                    ref.current.textWidth = e.nativeEvent.contentSize.width
                                }}
                                multiline={true}
                                autoFocus={true}
                                autoCapitalize="none"
                                value={text}
                                onChangeText={setText}
                                style={{
                                    textAlign: textAlign === 'flex-start' ? 'left' : (
                                        textAlign === 'flex-end' ? 'right' : 'center'
                                    ),
                                    fontSize: 40,
                                    fontWeight: '800',
                                    color: textBg ? '#000' : textColor,
                                    maxWidth: SCREEN_WIDTH - 30,

                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.textBottompOptions}>
                        <View style={{
                            ...styles.circleSelectedColor,
                            backgroundColor: textColor
                        }}>
                            <Icon name="eyedropper-variant" size={20} color={
                                textColor === '#fff' ? '#000' : '#fff'
                            } />
                        </View>
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            style={{
                                width: SCREEN_WIDTH - 50
                            }}
                            keyboardShouldPersistTaps="always"
                            horizontal={true}>
                            {textColors.map((tColor, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setTextColor(tColor)}
                                    style={{
                                        ...styles.circleTextColor,
                                        backgroundColor: tColor
                                    }}>

                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            }
            <ScrollView
                onScrollEndDrag={_onEndDrag}
                showsHorizontalScrollIndicator={false}
                ref={_hScrollRef}
                bounces={false}
                horizontal={true}
                style={styles.scrollView}>
                {ref.current.processImages.map((photo, index) => (
                    <ImageBackground
                        key={index}
                        style={styles.backgroundContainer}
                        source={{
                            uri: photo.uri
                        }}
                        blurRadius={10}
                    >
                        {photo.texts.map((txtLabel, labelIndex) => (
                            <PanGestureHandler
                                key={labelIndex}
                                onGestureEvent={e => {
                                    _onLabelTranslateHandler(labelIndex, e)
                                }}
                                onHandlerStateChange={e => {
                                    _onLabelTranslateChangeState(labelIndex, e)
                                }}
                            >
                                <PinchGestureHandler
                                    onGestureEvent={e => {
                                        _onLabelZoomHandler(labelIndex, e)
                                    }}
                                    onHandlerStateChange={e => {
                                        _onLabelZoomChangeState(labelIndex, e)
                                    }}
                                >
                                    <Animated.View style={{
                                        backgroundColor: txtLabel.textBg ? txtLabel.color : 'rgba(0,0,0,0)',
                                        padding: 5,
                                        borderRadius: 5,
                                        position: 'absolute',
                                        zIndex: 1,
                                        top: 0,
                                        left: 0,
                                        transform: [{
                                            translateX: txtLabel.animX,
                                        },
                                        {
                                            translateY: txtLabel.animY
                                        },
                                        {
                                            scale: txtLabel.animRatio
                                        }
                                        ]
                                    }}>
                                        <Text
                                            style={{
                                                width: txtLabel.width,
                                                height: txtLabel.height + 5,
                                                textAlign: txtLabel.textAlign === 'flex-start' ? 'left' : (
                                                    txtLabel.textAlign === 'flex-end' ? 'right' : 'center'
                                                ),
                                                fontSize: 40,
                                                fontWeight: '800',
                                                color: txtLabel.textBg ? '#000' : txtLabel.color,

                                            }}
                                        >
                                            {txtLabel.text}
                                        </Text>
                                    </Animated.View>
                                </PinchGestureHandler>
                            </PanGestureHandler>
                        ))}
                        <PanGestureHandler
                            enabled={enableGesture}
                            minPointers={2}
                            onHandlerStateChange={_onTranslateStateChange}
                            onGestureEvent={_onTranslateHandler}
                        >
                            <RotationGestureHandler
                                enabled={enableGesture}
                                onHandlerStateChange={_onRotateStateChange}
                                ref={_rotationRefList[index]}
                                simultaneousHandlers={_pinchRefList[index]}
                                onGestureEvent={_onRotateHandler}>
                                <PinchGestureHandler
                                    enabled={enableGesture}
                                    onHandlerStateChange={_onZoomStateChange}
                                    ref={_pinchRefList[index]}
                                    simultaneousHandlers={_rotationRefList[index]}
                                    onGestureEvent={_onZoomHandler}>

                                    <Animated.View
                                        style={{
                                            width: photo.width,
                                            height: photo.height,
                                            transform: [
                                                {
                                                    scale: _scaleAnimList[index]
                                                },
                                                {
                                                    rotate: _rotateAnimList[index]
                                                },
                                                {
                                                    translateX: _translateXAnimList[index]
                                                },
                                                {
                                                    translateY: _translateYAnimList[index]
                                                }
                                            ]
                                        }}
                                    >

                                        <Image
                                            resizeMode="contain"
                                            style={{
                                                width: '100%',
                                                height: "100%"
                                            }}
                                            source={{
                                                uri: photo.uri
                                            }} />
                                    </Animated.View>
                                </PinchGestureHandler>
                            </RotationGestureHandler>
                        </PanGestureHandler>
                    </ImageBackground>
                ))}
            </ScrollView>
            {(ref.current.processImages.length > 1 && !dragging) &&
                <View
                    style={{
                        ...styles.selectedImageWrapper,
                    }}>
                    <ScrollView
                        style={{
                            maxWidth: SCREEN_WIDTH - 100
                        }}
                        bounces={false}
                        horizontal={true}
                    >
                        {ref.current.processImages.map((photo, index) => (
                            <TouchableOpacity
                                onPress={setCurrentIndex.bind(null, index)}
                                key={index}
                                style={{
                                    ...styles.previewImageWrapper,
                                    padding: index === currentImageIndex ? 3 : 0
                                }}>
                                <Image
                                    source={{
                                        uri: photo.uri
                                    }}
                                    style={{
                                        ...styles.previewMultiImage,

                                    }} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        onPress={_onNext}
                        activeOpacity={0.8}
                        style={styles.btnNext}>
                        <Text style={{
                            fontWeight: '600'
                        }}>Next</Text>
                        <Icon
                            name="chevron-right"
                            size={20}
                        />
                    </TouchableOpacity>
                </View>
            }
            {dragging &&
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 80,
                    backgroundColor: 'rgba(0,0,0,0.3)'
                }}>
                    <Animated.View
                        style={{
                            height: 44,
                            width: 44,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 44,
                            borderColor: '#fff',
                            borderWidth: 1,
                            transform: [{
                                scale: _animRatioTrashCan
                            }]
                        }}>
                        <Icon name="trash-can-outline" size={30}
                            color="#fff" />
                    </Animated.View>
                </View>
            }
        </>
    )
}

export default StoryProcessor

const styles = StyleSheet.create({
    backgroundContainer: {
        overflow: 'hidden',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: "center",
        alignItems: 'center'
    },
    scrollView: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    topOptionsWrapper: {
        height: 50 + STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1,
        width: '100%'
    },
    textToolWrapper: {
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: "space-between"
    },
    textTopOptions: {
        flexDirection: 'row',
        height: 50 + STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textWrapper: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textBottompOptions: {
        minHeight: 36,
        marginVertical: 10,
        alignItems: 'center',
        flexDirection: 'row'
    },
    circleSelectedColor: {
        width: 36,
        marginHorizontal: 5,
        height: 36,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circleTextColor: {
        height: 24,
        width: 24,
        borderRadius: 24,
        borderColor: '#fff',
        borderWidth: 2,
        marginHorizontal: 5
    },
    btnTopOption: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectedImageWrapper: {
        paddingHorizontal: 5,
        bottom: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 10
    },
    previewImageWrapper: {
        marginHorizontal: 5,
        borderRadius: 5,
        backgroundColor: "#fff",
        justifyContent: 'center',
        alignItems: 'center',
        height: 54,
        width: 32,
    },
    previewMultiImage: {
        width: "100%",
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 5,
    },
    btnNext: {
        marginRight: 10,
        width: 80,
        height: 44,
        backgroundColor: "#fff",
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    }
})
