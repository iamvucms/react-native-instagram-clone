import CameraRoll from '@react-native-community/cameraroll'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FlatList, PanGestureHandler, PinchGestureHandlerGestureEvent, PanGestureHandlerGestureEvent, PinchGestureHandler, State } from 'react-native-gesture-handler'
import { Circle, Mask, Rect, Svg } from 'react-native-svg'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH } from '../../../constants'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack } from '../../../navigations/rootNavigation'
import AvatarChooserMask from '../../../components/AvatarChooserMask'
type GalleryChooserRouteProp = RouteProp<SuperRootStackParamList, 'GalleryChooser'>

type GalleryChooserNavigationProp = StackNavigationProp<SuperRootStackParamList, 'GalleryChooser'>

type GalleryChooserProps = {
    navigation: GalleryChooserNavigationProp,
    route: GalleryChooserRouteProp
}

const GalleryChooser = ({ navigation, route }: GalleryChooserProps) => {
    const isChooseProfilePhoto = route.params.isChooseProfilePhoto
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [photos, setPhotos] = useState<CameraRoll.PhotoIdentifier[]>([])
    const [enableGesture, setEnableGesture] = useState<boolean>(true)
    const [step, setStep] = useState<number>(1)
    const _photoOffsetX = new Animated.Value(0)
    const _photoOffsetY = new Animated.Value(0)
    const _photoRatio = React.useMemo(() => new Animated.Value(1), [])
    const ref = useRef<{
        preventNextScaleOffset: boolean,
        currentPhoto: {
            preX: number,
            preY: number,
            preRatio: number
        }
    }>({ preventNextScaleOffset: true, currentPhoto: { preX: 0, preY: 0, preRatio: 1 } })
    useEffect(() => {
        CameraRoll.getPhotos({ assetType: 'Photos', first: 20 })
            .then(result => {
                const photos = result.edges
                setPhotos(photos)
                if (photos.length > 0) setSelectedIndex(0)
            })
        return () => {
            // cleanup
        }
    }, [])
    useEffect(() => {
        if (selectedIndex > -1) {
            ref.current.preventNextScaleOffset = true
            ref.current.currentPhoto = {
                preX: 0, preY: 0,
                preRatio: SCREEN_WIDTH /
                    (photos[selectedIndex].node.image.height
                        < photos[selectedIndex].node.image.width
                        ? photos[selectedIndex].node.image.height
                        : photos[selectedIndex].node.image.width)
            }
            ref.current.currentPhoto.preX = -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2
            ref.current.currentPhoto.preY = -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2
            _photoRatio.setValue(ref.current.currentPhoto.preRatio)
            _photoOffsetX.setValue(ref.current.currentPhoto.preX)
            _photoOffsetY.setValue(ref.current.currentPhoto.preY)
        }
        return () => {
            //
        }
    }, [selectedIndex])
    const _onPanGestureEvent = ({
        nativeEvent: { translationX, translationY } }:
        PanGestureHandlerGestureEvent) => {

        if (ref.current.preventNextScaleOffset) {
            _photoOffsetX.setValue((translationX + ref.current.currentPhoto.preX))
            _photoOffsetY.setValue((translationY + ref.current.currentPhoto.preY))
        } else {
            _photoOffsetX.setValue((translationX + ref.current.currentPhoto.preX) * ref.current.currentPhoto.preRatio)
            _photoOffsetY.setValue((translationY + ref.current.currentPhoto.preY) * ref.current.currentPhoto.preRatio)
        }
    }
    const _onPanStateChange = ({
        nativeEvent: { translationX, translationY, state } }:
        PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.currentPhoto.preX += translationX
            ref.current.currentPhoto.preY += translationY
            if (ref.current.currentPhoto.preX > 0) {
                Animated.spring(_photoOffsetX, {
                    useNativeDriver: false,
                    toValue: 0
                }).start(() => ref.current.currentPhoto.preX = 0)
            }
            if (ref.current.currentPhoto.preY > 0) {
                Animated.spring(_photoOffsetY, {
                    useNativeDriver: false,
                    toValue: 0
                }).start(() => ref.current.currentPhoto.preY = 0)
            }
            if (photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio + ref.current.currentPhoto.preRatio * ref.current.currentPhoto.preY - SCREEN_WIDTH < 0) {
                Animated.spring(_photoOffsetY, {
                    useNativeDriver: false,
                    toValue: -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                }).start(() => {
                    ref.current.currentPhoto.preY = -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                    ref.current.preventNextScaleOffset = true
                })
            }
            if (photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio + (ref.current.preventNextScaleOffset ? ref.current.currentPhoto.preX : ref.current.currentPhoto.preRatio * ref.current.currentPhoto.preX) - SCREEN_WIDTH < 0) {
                Animated.spring(_photoOffsetX, {
                    useNativeDriver: false,
                    toValue: -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                }).start(() => {
                    ref.current.currentPhoto.preX = -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                    ref.current.preventNextScaleOffset = true
                })
            }
        }
    }
    const _onPinchGestureEvent = ({
        nativeEvent: { scale } }:
        PinchGestureHandlerGestureEvent) => {
        if (ref.current.preventNextScaleOffset) {
            _photoOffsetX.setValue(ref.current.currentPhoto.preX * scale)
            _photoOffsetY.setValue(ref.current.currentPhoto.preY * scale)
        } else {
            _photoOffsetX.setValue(ref.current.currentPhoto.preX * (scale * ref.current.currentPhoto.preRatio))
            _photoOffsetY.setValue(ref.current.currentPhoto.preY * (scale * ref.current.currentPhoto.preRatio))
        }

        _photoRatio.setValue(scale * ref.current.currentPhoto.preRatio)
    }
    const _onPinchStateChange = ({
        nativeEvent: { scale, state } }:
        PinchGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.preventNextScaleOffset = false
            ref.current.currentPhoto.preRatio *= scale
            const defaultRatio = SCREEN_WIDTH /
                (photos[selectedIndex].node.image.height
                    < photos[selectedIndex].node.image.width
                    ? photos[selectedIndex].node.image.height
                    : photos[selectedIndex].node.image.width)
            if (ref.current.currentPhoto.preRatio < defaultRatio) {
                Animated.spring(_photoRatio, {
                    toValue: defaultRatio,
                    useNativeDriver: false
                }).start(() => {
                    ref.current.currentPhoto.preRatio = defaultRatio
                })
            }
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <>
                <View style={styles.navigationBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={goBack}
                            style={styles.centerBtn}>
                            <Icon name="arrow-left" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            marginLeft: 15,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600'
                            }}>Gallery</Text>
                            <Icon name="chevron-down" size={20} />
                        </TouchableOpacity>
                        {/* <ScrollView style={styles.groupOptionsWrapper}>
                                <TouchableOpacity>
                                    <Text>aaaa</Text>
                                </TouchableOpacity>
                            </ScrollView> */}
                    </View>
                    <TouchableOpacity style={{
                        ...styles.centerBtn,
                        width: 60
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#318bfb'
                        }}>Next</Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    height: SCREEN_WIDTH,
                    width: SCREEN_WIDTH,
                    overflow: "hidden"
                }}>
                    {selectedIndex > -1 &&
                        <View >
                            <Animated.View style={{
                                transform: [
                                    {
                                        translateX: _photoOffsetX,
                                    }, {
                                        translateY: _photoOffsetY,
                                    }
                                ],
                                width: Animated.multiply(photos[selectedIndex].node.image.width, _photoRatio),
                                height: Animated.multiply(photos[selectedIndex].node.image.height, _photoRatio)
                            }}>
                                <Image
                                    style={{
                                        width: '100%',
                                        height: '100%'
                                    }} source={{ uri: photos[selectedIndex].node.image.uri || '' }} />
                            </Animated.View>

                        </View>
                    }
                    <PinchGestureHandler
                        enabled={enableGesture}
                        onHandlerStateChange={_onPinchStateChange}
                        onGestureEvent={_onPinchGestureEvent}>
                        <PanGestureHandler
                            enabled={enableGesture}
                            onHandlerStateChange={_onPanStateChange}
                            onGestureEvent={_onPanGestureEvent}>
                            <View style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                zIndex: 1,
                                left: 0,
                                top: 0
                            }}>
                                {isChooseProfilePhoto &&
                                    <AvatarChooserMask
                                        maskColor="rgba(242,242,242,0.3)"
                                        width={SCREEN_WIDTH}
                                        height={SCREEN_WIDTH} />
                                }

                            </View>
                        </PanGestureHandler>
                    </PinchGestureHandler>
                </View>
            </>
            {step === 1 && <FlatList
                showsVerticalScrollIndicator={false}
                bounces={false}
                data={photos}
                renderItem={({ item, index }) => <TouchableOpacity
                    onPress={setSelectedIndex.bind(null, index)}
                    activeOpacity={0.8}
                    style={{
                        padding: 1,
                        width: SCREEN_WIDTH / 4,
                        height: SCREEN_WIDTH / 4
                    }}>
                    <Image style={{
                        opacity: index === selectedIndex ? 0.8 : 1,
                        width: '100%',
                        height: '100%'
                    }} source={{
                        uri: item.node.image.uri,
                        // priority: FastImage.priority.high
                    }} />
                </TouchableOpacity>
                }
                numColumns={4}
                keyExtractor={(item, key) => `${key}`}
            />}

        </SafeAreaView >
    )
}

export default GalleryChooser

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        zIndex: 1,
        backgroundColor: '#fff',
        height: 44,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    centerBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    groupOptionsWrapper: {
        zIndex: 10,
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: '#fff',
        width: '100%',
        padding: 15,
    }
})
