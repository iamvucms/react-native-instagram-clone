import CameraRoll from '@react-native-community/cameraroll'
import ImageEditor, { ImageCropData } from '@react-native-community/image-editor'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FlatList, PanGestureHandler, PanGestureHandlerGestureEvent, PinchGestureHandler, PinchGestureHandlerGestureEvent, State, TextInput } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { UploadAvatarRequest } from '../../../actions/userActions'
import AvatarChooserMask from '../../../components/AvatarChooserMask'
import ImageChooserMask from '../../../components/ImageChooserMask'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack, navigate } from '../../../navigations/rootNavigation'
type GalleryChooserRouteProp = RouteProp<SuperRootStackParamList, 'GalleryChooser'>

type GalleryChooserNavigationProp = StackNavigationProp<SuperRootStackParamList, 'GalleryChooser'>

type GalleryChooserProps = {
    navigation: GalleryChooserNavigationProp,
    route: GalleryChooserRouteProp
}
export type ProcessedImage = {
    uri: string,
    width: number,
    height: number,
    extension: string,
    tags: {
        x: number,
        y: number,
        width?: number,
        height?: number,
        showBtnDelete: boolean,
        animX: Animated.Value,
        animY: Animated.Value
        username: string
    }[]
}
const GalleryChooser = ({ navigation, route }: GalleryChooserProps) => {
    const dispatch = useDispatch()
    const isChooseProfilePhoto = route.params?.isChooseProfilePhoto
    const [showGroupSelection, setShowGroupSelection] = useState<boolean>(false)
    const [multiple, setMultiple] = useState<boolean>(false)
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
    const [selectedPhotoSpecs, setSelectedPhotosSpecs] = useState<{
        preventScaleOffset: boolean,
        fullSize: boolean,
        enableGesture: boolean,
        currentPhoto: {
            preX: number,
            preY: number,
            preRatio: number
        }
    }[]>([])
    const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1)
    const [photos, setPhotos] = useState<CameraRoll.PhotoIdentifier[]>([])
    const [groups, setGroups] = useState<string[]>([])
    const [enableGesture, setEnableGesture] = useState<boolean>(true)
    const [step, setStep] = useState<number>(1)
    const _photoOffsetX = React.useMemo(() => new Animated.Value(0), [])
    const _photoOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const _photoRatio = React.useMemo(() => new Animated.Value(1), [])
    const [page, setPage] = useState<number>(1)
    const _maskOpacity = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        processedImages: ProcessedImage[],
        maskTimeout: NodeJS.Timeout
        showMask: boolean,
        preventScaleOffset: boolean,
        enableGesture: boolean,
        fullSize: boolean,
        currentPhoto: {
            preX: number,
            preY: number,
            preRatio: number
        }
    }>({
        enableGesture: true,
        processedImages: [],
        fullSize: false,
        maskTimeout: setTimeout(() => { }, 0),
        showMask: false,
        preventScaleOffset: true,
        currentPhoto: { preX: 0, preY: 0, preRatio: 1 }
    })
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
        CameraRoll.getPhotos({ assetType: 'Photos', first: 1000 })
            .then(result => {
                const photos = result.edges
                const groups = Array.from(new Set(photos.map(photo => photo.node.group_name)))
                setGroups(groups)
                if (groups.length > 0) setSelectedGroupIndex(0)
            })
        return () => {
        }
    }, [])
    useEffect(() => {

        if (selectedGroupIndex > -1) {
            CameraRoll.getPhotos({
                assetType: 'Photos',
                first: 8 * page,
                groupName: groups[selectedGroupIndex]
            })
                .then(result => {
                    const photos = result.edges
                    setPhotos(photos)
                    if (photos.length > 0 && selectedIndex < 0) setSelectedIndex(0)
                })
        }
        return () => {

        }
    }, [selectedGroupIndex, page])
    useEffect(() => {
        if (selectedIndex > -1) {
            const position = selectedPhotos.indexOf(selectedIndex)
            if (position > -1 && selectedPhotoSpecs[position] && multiple) {
                ref.current.currentPhoto = { ...selectedPhotoSpecs[position].currentPhoto }
                ref.current.preventScaleOffset = selectedPhotoSpecs[position].preventScaleOffset
                ref.current.enableGesture = selectedPhotoSpecs[position].enableGesture
                setEnableGesture(ref.current.enableGesture)
                // _photoRatio.setValue(ref.current.currentPhoto.preRatio)
                // _photoRatio.setValue(ref.current.currentPhoto.preRatio)
                // _photoRatio.setValue(ref.current.currentPhoto.preRatio)
                if (ref.current.preventScaleOffset) {
                    Animated.parallel([
                        Animated.spring(_photoRatio, {
                            toValue: ref.current.currentPhoto.preRatio,
                            useNativeDriver: false
                        }),
                        Animated.spring(_photoOffsetX, {
                            toValue: ref.current.currentPhoto.preX,
                            useNativeDriver: false
                        }),
                        Animated.spring(_photoOffsetY, {
                            toValue: ref.current.currentPhoto.preY,
                            useNativeDriver: false
                        })
                    ]).start()
                } else {
                    Animated.parallel([
                        Animated.spring(_photoOffsetX, {
                            toValue: (ref.current.currentPhoto.preX) * ref.current.currentPhoto.preRatio,
                            useNativeDriver: false
                        }),
                        Animated.spring(_photoOffsetY, {
                            toValue: (ref.current.currentPhoto.preY) * ref.current.currentPhoto.preRatio,
                            useNativeDriver: false
                        })
                    ]).start()
                }
            } else {
                setEnableGesture(true)
                ref.current.preventScaleOffset = true
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
        }
        return () => {

        }
    }, [selectedIndex])
    const _onPanGestureEvent = ({
        nativeEvent: { translationX, translationY } }:
        PanGestureHandlerGestureEvent) => {
        if (!isChooseProfilePhoto) {
            clearTimeout(ref.current.maskTimeout)
            ref.current.maskTimeout = setTimeout(() => {
                Animated.timing(_maskOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }).start(() => ref.current.showMask = false)

            }, 1000);
            if (!ref.current.showMask) {
                _maskOpacity.setValue(1)
                ref.current.showMask = true
            }
        }
        if (showGroupSelection) setShowGroupSelection(false)
        if (ref.current.preventScaleOffset) {
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
            if (photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio + (ref.current.preventScaleOffset ? ref.current.currentPhoto.preY : ref.current.currentPhoto.preRatio * ref.current.currentPhoto.preY) - SCREEN_WIDTH < 0) {
                Animated.spring(_photoOffsetY, {
                    useNativeDriver: false,
                    toValue: -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                }).start(() => {
                    ref.current.currentPhoto.preY = -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                    ref.current.preventScaleOffset = true
                })
            }
            if (photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio + (ref.current.preventScaleOffset ? ref.current.currentPhoto.preX : ref.current.currentPhoto.preRatio * ref.current.currentPhoto.preX) - SCREEN_WIDTH < 0) {
                Animated.spring(_photoOffsetX, {
                    useNativeDriver: false,
                    toValue: -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                }).start(() => {
                    ref.current.currentPhoto.preX = -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH)
                    ref.current.preventScaleOffset = true
                })
            }
        }
    }
    const _onPinchGestureEvent = ({
        nativeEvent: { scale } }:
        PinchGestureHandlerGestureEvent) => {
        if (!isChooseProfilePhoto) {
            clearTimeout(ref.current.maskTimeout)
            ref.current.maskTimeout = setTimeout(() => {
                Animated.timing(_maskOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }).start(() => ref.current.showMask = false)

            }, 1000);
            if (!ref.current.showMask) {
                _maskOpacity.setValue(1)
                ref.current.showMask = true
            }
        }
        if (showGroupSelection) setShowGroupSelection(false)
        if (ref.current.preventScaleOffset) {
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
            if (ref.current.preventScaleOffset) {
                ref.current.currentPhoto.preX /= ref.current.currentPhoto.preRatio
                ref.current.currentPhoto.preY /= ref.current.currentPhoto.preRatio
            }
            ref.current.preventScaleOffset = false

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
                    x: Math.abs(ref.current.preventScaleOffset ? ref.current.currentPhoto.preX / ref.current.currentPhoto.preRatio : ref.current.currentPhoto.preX),
                    y: Math.abs(ref.current.preventScaleOffset ? ref.current.currentPhoto.preY / ref.current.currentPhoto.preRatio : ref.current.currentPhoto.preY)
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
            const extension = img.image.filename
                .split('.').pop()?.toLocaleLowerCase()
            await dispatch(UploadAvatarRequest(uri, extension as string))
            setUploading(false)
            navigate('Account')
        } else {
            if (step === 1) {
                if (selectedPhotos.length < 1 && multiple) {
                    setUploading(false)
                    return Alert.alert("Error!", "You need to choose at least 1 picture")
                }
                const photoList = multiple ? [...selectedPhotos] : [selectedIndex]
                const specs = multiple ? [...selectedPhotoSpecs] : []
                if (specs.length < photoList.length) {
                    specs.push({
                        currentPhoto: { ...ref.current.currentPhoto },
                        enableGesture,
                        preventScaleOffset: ref.current.preventScaleOffset,
                        fullSize: ref.current.fullSize
                    })
                } else if (specs.length === photoList.length) {
                    specs[photoList.indexOf(selectedIndex)] = {
                        currentPhoto: { ...ref.current.currentPhoto },
                        enableGesture,
                        preventScaleOffset: ref.current.preventScaleOffset,
                        fullSize: ref.current.fullSize
                    }
                }
                const tasks: Promise<ProcessedImage>[] = photoList.map(async (index, rIndex) => {
                    const spec = specs[photoList.indexOf(index)]
                    const { width, height } = photos[index].node.image
                    const cropData: ImageCropData = {
                        offset: {
                            x: spec.fullSize ? 0 : Math.abs(spec.preventScaleOffset ? spec.currentPhoto.preX / spec.currentPhoto.preRatio : spec.currentPhoto.preX),
                            y: spec.fullSize ? 0 : Math.abs(spec.preventScaleOffset ? spec.currentPhoto.preY / spec.currentPhoto.preRatio : spec.currentPhoto.preY)
                        },
                        size: {
                            width: (spec.fullSize && height > width) ? width : SCREEN_WIDTH
                                / spec.currentPhoto.preRatio,
                            height: (spec.fullSize && height < width) ? height : SCREEN_WIDTH
                                / spec.currentPhoto.preRatio
                        },
                    };
                    const img = photos[index].node
                    const extension = img.image.filename
                        .split('.').pop()?.toLocaleLowerCase()
                    const uri = await ImageEditor.cropImage(img.image.uri, cropData)
                    return {
                        uri,
                        tags: [],
                        extension: extension as string,
                        width: (spec.fullSize && height > width) ? width : SCREEN_WIDTH
                            / spec.currentPhoto.preRatio,
                        height: (spec.fullSize && height < width) ? height : SCREEN_WIDTH
                            / spec.currentPhoto.preRatio
                    }
                })
                Promise.all(tasks).then(result => {
                    ref.current.processedImages = result
                    setUploading(false)
                    setStep(2)
                })
            }
            else {
                setUploading(false)
            }
        }
    }
    const _onLoadmore = () => {
        setPage(page + 1)
    }
    const _onSelectImage = (index: number) => {
        if (!multiple) setSelectedIndex(index)
        else {
            const position = selectedPhotos.indexOf(index)
            if (index !== selectedIndex && position > -1) {
                const temp2 = [...selectedPhotoSpecs]
                temp2[selectedPhotos.indexOf(selectedIndex)] = {
                    enableGesture,
                    currentPhoto: { ...ref.current.currentPhoto },
                    preventScaleOffset: ref.current.preventScaleOffset,
                    fullSize: ref.current.fullSize
                }
                setSelectedPhotosSpecs(temp2)
                return setSelectedIndex(index)
            }
            if (position > -1) {
                const temp = [...selectedPhotos]
                temp.splice(position, 1)
                setSelectedPhotos(temp)
                const temp2 = [...selectedPhotoSpecs]
                temp2.splice(position, 1)
                setSelectedPhotosSpecs(temp2)
            } else {
                const temp = [...selectedPhotos]
                temp.push(index)
                setSelectedPhotos(temp)
                const temp2 = [...selectedPhotoSpecs]
                temp2[temp.indexOf(selectedIndex)] = {
                    enableGesture,
                    currentPhoto: { ...ref.current.currentPhoto },
                    preventScaleOffset: ref.current.preventScaleOffset,
                    fullSize: ref.current.fullSize
                }
                setSelectedPhotosSpecs(temp2)
            }
            setSelectedIndex(index)

        }
    }
    const _onToggleMultiple = () => {
        if (selectedPhotos.indexOf(selectedIndex) === -1 && !multiple) {
            const temp = [...selectedPhotos]
            temp.push(selectedIndex)
            setSelectedPhotos(temp)
        }
        setMultiple(!multiple)

    }
    const _onToggleFullSize = () => {
        if (photos[selectedIndex].node.image.height
            == photos[selectedIndex].node.image.width) return;
        let switcher = false
        if (!ref.current.fullSize) {
            switcher = photos[selectedIndex].node.image.height
                > photos[selectedIndex].node.image.width
            ref.current.fullSize = true
            setEnableGesture(false)
        } else {
            switcher = photos[selectedIndex].node.image.height
                < photos[selectedIndex].node.image.width
            ref.current.fullSize = false
            setEnableGesture(true)
        }
        ref.current.preventScaleOffset = true
        ref.current.currentPhoto = {
            preX: 0, preY: 0,
            preRatio: SCREEN_WIDTH /
                (switcher
                    ? photos[selectedIndex].node.image.height
                    : photos[selectedIndex].node.image.width)
        }
        ref.current.currentPhoto.preX = -(photos[selectedIndex].node.image.width * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2
        ref.current.currentPhoto.preY = -(photos[selectedIndex].node.image.height * ref.current.currentPhoto.preRatio - SCREEN_WIDTH) / 2
        _photoRatio.setValue(ref.current.currentPhoto.preRatio)
        _photoOffsetX.setValue(ref.current.currentPhoto.preX)
        _photoOffsetY.setValue(ref.current.currentPhoto.preY)

    }
    const _onGoBack = () => {
        if (isChooseProfilePhoto) {
            goBack()
        } else {
            if (step === 1) goBack()
            else {
                setStep(1)
            }
        }
    }
    const _onTagPeople = () => {
        navigation.navigate('TagPeople', {
            images: [...ref.current.processedImages],
            onDone: _onTagChange
        })
    }
    const _onTagChange = React.useCallback((images: ProcessedImage[]) => {

    }, [])
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
                        }}>{isChooseProfilePhoto ? 'Uploading Photo...' : (
                            step === 1 ? 'Processing Photos...' : 'Posting...'
                        )}</Text>
                    </View>
                </View>
            }
            <View style={{
                ...styles.navigationBar,
                borderBottomColor: '#ddd',
                borderBottomWidth: step === 2 ? 1 : 0
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={_onGoBack}
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
                                onPress={() => {
                                    setSelectedGroupIndex(index)
                                    setShowGroupSelection(false)
                                }}>
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
                    }}>{isChooseProfilePhoto ? 'Done' : (
                        step === 1 ? 'Next' : 'Share'
                    )}</Text>
                </TouchableOpacity>
            </View>
            {step === 1 && <>
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
                                {!isChooseProfilePhoto &&
                                    <View style={styles.postToolWrapper}>
                                        <TouchableOpacity
                                            onPress={_onToggleFullSize}
                                            style={styles.btnPostTool}>
                                            <Icon name="resize" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={_onToggleMultiple}
                                            style={{
                                                ...styles.btnPostTool,
                                                backgroundColor: multiple ? '#318bfb' : 'rgba(0,0,0,0.5)'
                                            }}>
                                            <Icon name="layers-outline" size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>}
                                {isChooseProfilePhoto ?
                                    <AvatarChooserMask
                                        maskColor="rgba(242,242,242,0.3)"
                                        width={SCREEN_WIDTH}
                                        height={SCREEN_WIDTH} />
                                    : <Animated.View style={{
                                        opacity: _maskOpacity
                                    }}>
                                        <ImageChooserMask
                                            maskColor="#fff"
                                            width={SCREEN_WIDTH}
                                            height={SCREEN_WIDTH} />
                                    </Animated.View>
                                }

                            </View>
                        </PanGestureHandler>
                    </PinchGestureHandler>
                </View>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    data={photos}
                    onEndReached={_onLoadmore}
                    renderItem={({ item, index }) =>
                        <TouchableOpacity
                            onPress={_onSelectImage.bind(null, index)}
                            activeOpacity={0.8}
                            style={{
                                padding: 1,
                                width: SCREEN_WIDTH / 4,
                                height: SCREEN_WIDTH / 4
                            }}>
                            {multiple &&
                                <View style={{
                                    position: 'absolute',
                                    right: 7.5,
                                    top: 7.5,
                                    height: 24,
                                    width: 24,
                                    borderRadius: 24,
                                    borderColor: '#fff',
                                    borderWidth: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 1,
                                    backgroundColor: selectedPhotos.indexOf(index) > -1
                                        ? '#318bfb' : 'rgba(0,0,0,0.3)'
                                }}>
                                    {selectedPhotos.indexOf(index) > -1 &&
                                        <Text style={{
                                            color: '#fff'
                                        }}>
                                            {selectedPhotos.indexOf(index) + 1}
                                        </Text>
                                    }
                                </View>
                            }
                            <Image style={{
                                opacity: (index === selectedIndex && !multiple) ? 0.8 : 1,
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
            </>}
            {step === 2 &&
                <ScrollView
                    bounces={false}
                >
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 15
                    }}>
                        <TouchableOpacity
                            onPress={_onGoBack}
                            style={{
                                height: 50,
                                width: 50
                            }}>
                            {ref.current.processedImages.length > 1 && <View style={{
                                position: 'absolute',
                                zIndex: 1,
                                top: 5,
                                right: 5
                            }}>
                                <Icon name="layers-outline" color="#fff" size={20} />
                            </View>}
                            <Image
                                style={{
                                    width: '100%',
                                    height: '100%'
                                }}
                                source={{ uri: ref.current.processedImages[0].uri }}
                            />
                        </TouchableOpacity>
                        <TextInput
                            multiline={true}
                            style={{
                                maxWidth: SCREEN_WIDTH - 30 - 50,
                                paddingLeft: 10
                            }}
                            placeholder="Write a caption" />
                    </View>
                    <View style={{
                        backgroundColor: '#000'
                    }}>
                        <TouchableOpacity
                            onPress={_onTagPeople}
                            activeOpacity={0.9}
                            style={styles.postOptionItem}>
                            <Text style={{
                                fontSize: 16,
                            }}>Tag People</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={{
                                borderTopWidth: 0,
                                ...styles.postOptionItem
                            }}>
                            <Text style={{
                                fontSize: 16,
                            }}>Add Location</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{
                                ...styles.postOptionItem,
                                borderWidth: 0,
                            }}>
                            <Text style={{
                                color: '#666',
                                fontWeight: '600',
                                fontSize: 14,
                            }}>Advanced Settings</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>}
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
    postToolWrapper: {
        zIndex: 10,
        position: 'absolute',
        bottom: 15,
        left: 0,
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    btnPostTool: {
        height: 40,
        width: 40,
        borderRadius: 44,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    postOptionItem: {
        backgroundColor: '#fff',
        height: 44,
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: '#ddd',
        paddingHorizontal: 15
    }
})
