import CameraRoll from '@react-native-community/cameraroll'
import ImageEditor, { ImageCropData } from '@react-native-community/image-editor'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { FlatList, PanGestureHandler, PanGestureHandlerGestureEvent, PinchGestureHandler, PinchGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { UploadAvatarRequest } from '../../../actions/userActions'
import AvatarChooserMask from '../../../components/AvatarChooserMask'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
type GalleryChooserRouteProp = RouteProp<SuperRootStackParamList, 'GalleryChooser'>

type GalleryChooserNavigationProp = StackNavigationProp<SuperRootStackParamList, 'GalleryChooser'>

type GalleryChooserProps = {
    navigation: GalleryChooserNavigationProp,
    route: GalleryChooserRouteProp
}

const GalleryChooser = ({ navigation, route }: GalleryChooserProps) => {
    const dispatch = useDispatch()
    const [showGroupSelection, setShowGroupSelection] = useState<boolean>(false)
    const isChooseProfilePhoto = route.params?.isChooseProfilePhoto
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1)
    const [photos, setPhotos] = useState<CameraRoll.PhotoIdentifier[]>([])
    const [groups, setGroups] = useState<string[]>([])
    const [enableGesture, setEnableGesture] = useState<boolean>(true)
    const [step, setStep] = useState<number>(1)
    const _photoOffsetX = React.useMemo(() => new Animated.Value(0), [])
    const _photoOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const _photoRatio = React.useMemo(() => new Animated.Value(1), [])
    const ref = useRef<{
        preventNextScaleOffset: boolean,
        currentPhoto: {
            preX: number,
            preY: number,
            preRatio: number
        }
    }>({ preventNextScaleOffset: true, currentPhoto: { preX: 0, preY: 0, preRatio: 1 } })
    const [uploading, setUploading] = useState<boolean>(false)
    const _loadingDeg = new Animated.Value(0)
    const _animateLoading = () => {
        Animated.timing(_loadingDeg, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false
        }).start(() => {
            if (uploading) {
                _loadingDeg.setValue(0)
                _animateLoading()
            }
        })
    }

    useEffect(() => {
        CameraRoll.getPhotos({ assetType: 'Photos', first: 20 })
            .then(result => {
                const photos = result.edges
                const groups = Array.from(new Set(photos.map(photo => photo.node.group_name)))
                setGroups(groups)
                if (groups.length > 0) setSelectedGroupIndex(0)
                setPhotos(photos)
                if (photos.length > 0) setSelectedIndex(0)
            })
        return () => {
        }
    }, [])
    useEffect(() => {
        if (selectedGroupIndex > -1) {
            CameraRoll.getPhotos({ assetType: 'Photos', first: 20, groupName: groups[selectedGroupIndex] })
                .then(result => {
                    const photos = result.edges
                    const groups = Array.from(new Set(photos.map(photo => photo.node.group_name)))
                    setGroups(groups)
                    setSelectedGroupIndex(0)
                    setPhotos(photos)
                    if (photos.length > 0) setSelectedIndex(0)
                })
        }
        return () => {

        }
    }, [selectedGroupIndex])
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
        if (showGroupSelection) setShowGroupSelection(false)
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
            if (photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio + (ref.current.preventNextScaleOffset ? ref.current.currentPhoto.preY : ref.current.currentPhoto.preRatio * ref.current.currentPhoto.preY) - SCREEN_WIDTH < 0) {
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
        if (showGroupSelection) setShowGroupSelection(false)
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
            if (ref.current.preventNextScaleOffset) {
                ref.current.currentPhoto.preX /= ref.current.currentPhoto.preRatio
                ref.current.currentPhoto.preY /= ref.current.currentPhoto.preRatio
            }
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
    const _onDone = async () => {
        setUploading(true)
        if (isChooseProfilePhoto) {
            const cropData: ImageCropData = {
                offset: {
                    x: Math.abs(ref.current.currentPhoto.preX / ref.current.currentPhoto.preRatio),
                    y: Math.abs(ref.current.currentPhoto.preY / ref.current.currentPhoto.preRatio)
                },
                size: {
                    width: SCREEN_WIDTH
                        / ref.current.currentPhoto.preRatio,
                    height: SCREEN_WIDTH
                        / ref.current.currentPhoto.preRatio
                },
            };
            const img = photos[selectedIndex].node
            const uri = await ImageEditor
                .cropImage(img.image.uri, cropData)
            const extension = photos[selectedIndex].node.image.filename
                .split('.').pop()?.toLocaleLowerCase()
            await dispatch(UploadAvatarRequest(uri, extension as string))
            setUploading(false)
            navigate('Account')
        } else {
            if (step === 1) setStep(2)
            else {
                setUploading(false)
            }
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            {uploading &&
                <View style={{
                    zIndex: 999,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: SCREEN_HEIGHT,
                    width: SCREEN_WIDTH,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)'
                }}>
                    <View style={styles.uploadingContainer}>
                        <Animated.Image
                            onLayout={_animateLoading}
                            style={{
                                height: 36,
                                width: 36,
                                marginRight: 10,
                                transform: [{
                                    rotate: _loadingDeg.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg']
                                    })
                                }]
                            }}
                            source={require('../../../assets/icons/waiting.png')} />
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500'
                        }}>{isChooseProfilePhoto ? 'Uploading Photo...' : ''}</Text>
                    </View>
                </View>
            }
            <View style={styles.navigationBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={goBack}
                        style={styles.centerBtn}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={setShowGroupSelection.bind(null, true)}
                        style={{
                            marginLeft: 15,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600'
                        }}>{selectedGroupIndex > -1 ? groups[selectedGroupIndex] : '--'}</Text>
                        <Icon name="chevron-down" size={20} />
                    </TouchableOpacity>
                    {showGroupSelection && <ScrollView
                        bounces={false}
                        contentContainerStyle={{
                            alignItems: 'flex-end',
                        }}
                        style={styles.groupOptionsWrapper}
                    >
                        {showGroupSelection && groups.map((group, index) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                onPress={() => setSelectedGroupIndex(index)}>
                                <Text style={{
                                    fontSize: 16,
                                    color: index === selectedGroupIndex ? '#000' : '#999'
                                }}>{group}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>}
                </View>
                <TouchableOpacity
                    onPress={_onDone}
                    style={{
                        ...styles.centerBtn,
                        width: 60
                    }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#318bfb'
                    }}>{isChooseProfilePhoto ? 'Done' : 'Next'}</Text>
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
        borderColor: '#ddd',
        borderWidth: 0.5
    },
    uploadingContainer: {
        zIndex: 1,
        width: '80%',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
    },
})
