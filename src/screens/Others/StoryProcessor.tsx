import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, Animated, View, Image, ImageBackground, ScrollView, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity } from 'react-native'
import { RouteProp } from '@react-navigation/native'
import { SuperRootStackParamList } from '../../navigations'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { goBack } from '../../navigations/rootNavigation'
import { RotationGestureHandler, PinchGestureHandler, PinchGestureHandlerGestureEvent, RotationGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
type StoryProcessorRouteProp = RouteProp<SuperRootStackParamList, 'StoryProcessor'>
type StoryProcessorProps = {
    route: StoryProcessorRouteProp
}
export type StoryProcessedImage = {
    uri: string,
    width: number,
    height: number,
    base64: string,
    ratio: number,
    x: number,
    y: number,
    rotateDeg: number
}
const StoryProcessor = ({ route }: StoryProcessorProps) => {
    const { images } = route.params
    const [currentImageIndex, setCurrentIndex] = useState<number>(0)
    const _hScrollRef = useRef<ScrollView>(null)
    const _rotationRef = useRef<RotationGestureHandler>(null)
    const _pinchRef = useRef<PinchGestureHandler>(null)
    const _scaleAnimList = [...images].map(img => React.useMemo(() => new Animated.Value(SCREEN_WIDTH / img.width), []))
    const _rotateAnimList = [...images].map(img => React.useMemo(() => new Animated.Value(0), []))
    const ref = useRef<{
        processImages: StoryProcessedImage[],
    }>({
        processImages: [...images].map(img => {
            return {
                base64: img.base64,
                uri: img.uri,
                width: img.width,
                height: img.height,
                ratio: SCREEN_WIDTH / img.width,
                x: 0,
                y: 0,
                rotateDeg: 0
            }
        }),
    })
    useEffect(() => {
        _hScrollRef.current?.scrollTo({
            x: SCREEN_WIDTH * currentImageIndex,
            y: 0,
            animated: true
        })
    }, [currentImageIndex])
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
    const _onZoomHandler = ({ nativeEvent: {
        scale
    } }: PinchGestureHandlerGestureEvent) => {
        _scaleAnimList[currentImageIndex].setValue(ref.current.processImages[currentImageIndex].ratio * scale)
    }
    const _onZoomStateChange = ({ nativeEvent: {
        scale, state
    } }: PinchGestureHandlerGestureEvent) => {
        if (state === State.END)
            ref.current.processImages[currentImageIndex].ratio *= scale
    }
    const _onRotateHandler = ({ nativeEvent: {
        rotation, state
    } }: RotationGestureHandlerGestureEvent) => {
        _rotateAnimList[currentImageIndex].setValue(ref.current.processImages[currentImageIndex].rotateDeg + rotation)
    }
    const _onRotateStateChange = ({ nativeEvent: {
        rotation, state
    } }: RotationGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.processImages[currentImageIndex].rotateDeg += rotation
        }
    }

    const _onNext = () => {

    }
    return (
        <>
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
                <TouchableOpacity style={styles.btnTopOption}>
                    <Icon name="alpha-a-box" size={30} color='#fff' />
                </TouchableOpacity>

            </View>
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
                        <RotationGestureHandler
                            onHandlerStateChange={_onRotateStateChange}
                            ref={_rotationRef}
                            simultaneousHandlers={_pinchRef}
                            onGestureEvent={_onRotateHandler}>
                            <PinchGestureHandler
                                onHandlerStateChange={_onZoomStateChange}
                                ref={_pinchRef}
                                simultaneousHandlers={_rotationRef}
                                onGestureEvent={_onZoomHandler}>

                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: photo.width,
                                        height: photo.height,
                                        transform: [
                                            {
                                                scale: _scaleAnimList[index]
                                            },
                                            {
                                                rotate: _rotateAnimList[index]
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
                    </ImageBackground>
                ))}
            </ScrollView>
            {ref.current.processImages.length > 1 &&
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
        </>
    )
}

export default StoryProcessor

const styles = StyleSheet.create({
    backgroundContainer: {
        overflow: 'hidden',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
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
