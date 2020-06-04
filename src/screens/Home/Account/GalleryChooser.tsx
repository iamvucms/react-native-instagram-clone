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
    const _photoOffsetX = new Animated.Value(0)
    const _photoOffsetY = new Animated.Value(0)
    const _photoRatio = new Animated.Value(1)
    const ref = useRef<{
        currentPhoto: {
            preX: number,
            preY: number,
            preRatio: number
        }
    }>({ currentPhoto: { preX: 0, preY: 0, preRatio: 1 } })
    useEffect(() => {
        CameraRoll.getPhotos({ assetType: 'Photos', first: 20 }).then(result => {
            const photos = result.edges
            setPhotos(photos)
            if (photos.length > 0) setSelectedIndex(0)
        })
        return () => {
            // cleanup
        }
    }, [])
    useEffect(() => {
        if (selectedIndex - 1) {

        }
        return () => {
            //
        }
    }, [selectedIndex])
    const _onPanGestureEvent = ({
        nativeEvent: { translationX, translationY } }:
        PanGestureHandlerGestureEvent) => {
        // if (translationX + ref.current.currentPhoto.preX > 0
        //     || translationY + ref.current.currentPhoto.preY > 0
        // )
        //     return;

        _photoOffsetX.setValue(translationX + ref.current.currentPhoto.preX)
        _photoOffsetY.setValue(translationY + ref.current.currentPhoto.preY)

    }
    const _onPanStateChange = ({
        nativeEvent: { translationX, translationY, state } }:
        PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.currentPhoto.preX += translationX
            ref.current.currentPhoto.preY += translationY
        }
    }
    const _onPinchGestureEvent = ({
        nativeEvent: { scale } }:
        PinchGestureHandlerGestureEvent) => {
        // if (translationX + ref.current.currentPhoto.preX > 0
        //     || translationY + ref.current.currentPhoto.preY > 0
        // )
        //     return;
        _photoRatio.setValue(scale * ref.current.currentPhoto.preRatio)
    }
    const _onPinchStateChange = ({
        nativeEvent: { scale, state } }:
        PinchGestureHandlerGestureEvent) => {
        if (state === State.END) {
            ref.current.currentPhoto.preRatio *= scale
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                showsVerticalScrollIndicator={false}
                bounces={false}
                data={photos}
                ListHeaderComponent={<>
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
                            onHandlerStateChange={_onPinchStateChange}
                            onGestureEvent={_onPinchGestureEvent}>
                            <PanGestureHandler
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
                                    <Svg height="100%" width="100%"
                                        viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_WIDTH}`}>
                                        <Mask id="mask"
                                            x="0" y="0"
                                            height="100%" width="100%"
                                        >
                                            <Rect
                                                x="0"
                                                y="0"
                                                width="100%"
                                                height="100%"
                                                fill="#fff"
                                            >
                                            </Rect>
                                            <Circle
                                                cx="50%"
                                                cy="50%"
                                                r="50%"
                                                fill="#000"
                                            />
                                        </Mask>
                                        <Rect
                                            mask="url(#mask)"
                                            fill="rgba(242,242,242,0.3)"
                                            width="100%" height="100%" />
                                    </Svg>

                                </View>
                            </PanGestureHandler>
                        </PinchGestureHandler>
                    </View>
                </>}
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
            />

        </SafeAreaView>
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
