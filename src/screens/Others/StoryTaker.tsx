import { useIsFocused } from '@react-navigation/native'
import React, { useRef, useState, useEffect } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View, Animated, FlatList, ScrollView } from 'react-native'
import { RNCamera } from 'react-native-camera'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../constants'
import { goBack, navigate } from '../../navigations/rootNavigation'
import CameraRoll from '@react-native-community/cameraroll'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import NavigationBar from '../../components/NavigationBar'


export type StoryImageSpec = {
    width: number,
    height: number,
    uri: string,
    base64: string,
    extension: string
}
const StoryTaker = () => {
    const focused = useIsFocused()
    const [page, setPage] = useState<number>(1)
    const [showGallery, setShowGallery] = useState<boolean>(false)
    const [front, setFront] = useState<boolean>(true)
    const [flash, setFlash] = useState<boolean>(false)
    const [groups, setGroups] = useState<string[]>([])
    const [multiple, setMultiple] = useState<boolean>(false)
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
    const [photos, setPhotos] = useState<CameraRoll.PhotoIdentifier[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1)
    const _cameraRef = useRef<RNCamera>(null)
    const _galleryOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const _groupsOffsetX = React.useMemo(() => new Animated.Value(0), [])
    const _hScrollRef = useRef<ScrollView>(null)
    const ref = useRef<{
        preGalleryOffsetY: number,
        showGroups: boolean
    }>({
        preGalleryOffsetY: 0,
        showGroups: false
    })
    useEffect(() => {
        if (focused) {
            CameraRoll.getPhotos({ assetType: 'Photos', first: 1000 })
                .then(result => {
                    const photos = result.edges
                    const groupList = Array.from(new Set(photos.map(photo => photo.node.group_name)))
                    setGroups(groupList)
                    if (groupList.length > 0) setSelectedGroupIndex(0)
                })
        }
        return () => {
        }
    }, [focused])
    useEffect(() => {
        if (selectedGroupIndex > -1) {
            CameraRoll.getPhotos({
                assetType: 'Photos',
                first: 9 * page,
                groupName: groups[selectedGroupIndex]
            })
                .then(result => {
                    const photos = result.edges
                    setPhotos(photos)
                    if (photos.length > 0 && selectedIndex < 0) setSelectedIndex(0)
                })
        }
    }, [selectedGroupIndex, page])
    const _onTakePhoto = async () => {
        const photo = await _cameraRef.current?.takePictureAsync({
            width: 100,
            quality: 1,
        })
        const images: StoryImageSpec[] = []
        images.push({
            width: photo?.width as number,
            height: photo?.height as number,
            uri: photo?.uri as string,
            base64: photo?.base64 || "",
            extension: (photo?.uri || '').split('.').pop() || 'jpg'
        })
        navigate('StoryProcessor', {
            images
        })
    }
    const _onGestureEvent = ({ nativeEvent: {
        translationY
    } }: PanGestureHandlerGestureEvent) => {
        if (ref.current.preGalleryOffsetY + translationY < -SCREEN_HEIGHT + 170
            || ref.current.preGalleryOffsetY + translationY > 0
        )
            return;
        _galleryOffsetY.setValue(ref.current.preGalleryOffsetY + translationY)
    }
    const _onStateChange = ({ nativeEvent: {
        translationY, state
    } }: PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            if (ref.current.preGalleryOffsetY + translationY < (-SCREEN_HEIGHT + 170) / 2) {
                Animated.timing(_galleryOffsetY, {
                    duration: 200,
                    toValue: -SCREEN_HEIGHT + 170,
                    useNativeDriver: true
                }).start(() => {
                    if (!showGallery) setShowGallery(true)
                })
                ref.current.preGalleryOffsetY = -SCREEN_HEIGHT + 170
            } else {
                Animated.timing(_galleryOffsetY, {
                    duration: 200,
                    toValue: 0,
                    useNativeDriver: true
                }).start(() => {
                    if (showGallery) setShowGallery(false)
                })
                ref.current.preGalleryOffsetY = 0
            }
        }
    }
    const _onLoadmore = () => {
        setPage(page + 1)
    }
    const _onSelectImage = (index: number) => {
        if (multiple) {
            const position = selectedPhotos.indexOf(index)
            if (position > -1) {
                const temp = [...selectedPhotos]
                temp.splice(position, 1)
                setSelectedPhotos(temp)
            } else {
                const temp = [...selectedPhotos]
                temp.push(index)
                setSelectedPhotos(temp)
            }
        } else {
            const images: StoryImageSpec[] = []
            images.push({
                width: photos[index].node.image.width,
                height: photos[index].node.image.height,
                uri: photos[index].node.image.uri,
                base64: '',
                extension: photos[index].node.image.filename.split('.').pop() || 'jpg'
            })
            navigate('StoryProcessor', {
                images
            })
        }
    }
    const _onShowGroups = () => {
        if (ref.current.showGroups) {
            Animated.timing(_groupsOffsetX, {
                duration: 150,
                toValue: 0,
                useNativeDriver: true
            }).start()
        } else {
            Animated.spring(_groupsOffsetX, {
                toValue: 150,
                useNativeDriver: true
            }).start()
        }
        ref.current.showGroups = !ref.current.showGroups

    }
    const _onShowGallery = () => {
        Animated.timing(_galleryOffsetY, {
            duration: 200,
            toValue: -SCREEN_HEIGHT + 170,
            useNativeDriver: true
        }).start(() => {
            if (!showGallery) setShowGallery(true)
        })
        ref.current.preGalleryOffsetY = -SCREEN_HEIGHT + 170
    }
    const _onHideGallery = () => {
        Animated.timing(_galleryOffsetY, {
            duration: 200,
            toValue: 0,
            useNativeDriver: true
        }).start(() => {
            if (showGallery) setShowGallery(false)
        })
        ref.current.preGalleryOffsetY = 0
    }
    const _onSelectGroup = (index: number) => {
        setSelectedGroupIndex(index)
        Animated.timing(_groupsOffsetX, {
            duration: 150,
            toValue: 0,
            useNativeDriver: true
        }).start()
        ref.current.showGroups = !ref.current.showGroups
    }
    const _onDoneMultiSelect = () => {
        const images: StoryImageSpec[] = [...selectedPhotos].map(photoIndex => ({
            width: photos[photoIndex].node.image.width,
            height: photos[photoIndex].node.image.height,
            uri: photos[photoIndex].node.image.uri,
            base64: '',
            extension: photos[photoIndex].node.image.filename.split('.').pop() || 'jpg'
        }))
        navigate('StoryProcessor', {
            images
        })
    }
    return (
        <>
            <PanGestureHandler
                onGestureEvent={_onGestureEvent}
                onHandlerStateChange={_onStateChange}
            >
                <View style={styles.container}>
                    {focused && <RNCamera
                        ratio="16:9"
                        pictureSize="3840x2160"
                        captureAudio={false}
                        ref={_cameraRef}
                        style={styles.cameraContainer}
                        type={front ? 'front' : 'back'}
                        flashMode={flash ? 'on' : 'off'}
                    />}

                    <View style={styles.topOptions}>
                        <TouchableOpacity
                            onPress={() => navigate('StoryPrivacy')}
                            style={styles.btnTopOptions}>
                            <Icon name="tune" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={setFlash.bind(null, !flash)}
                            style={styles.btnTopOptions}>
                            <Icon name={flash ? 'flash' : "flash-off"}
                                size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={goBack}
                            style={styles.btnTopOptions}>
                            <Text style={{
                                fontSize: 30,
                                color: '#fff',
                            }}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={{
                        ...styles.bottomOptions,
                        transform: [{
                            translateY: _galleryOffsetY
                        }],
                        zIndex: showGallery ? 0 : 2,
                        opacity: _galleryOffsetY.interpolate({
                            inputRange: [-SCREEN_HEIGHT + 170, 0],
                            outputRange: [0, 1]
                        })
                    }}>
                        <TouchableOpacity
                            onPress={_onShowGallery}
                            activeOpacity={0.8}
                            style={styles.btnLastPhoto}>
                            <Image
                                style={styles.lastPhoto}
                                source={{
                                    uri: [...photos][0]?.node.image.uri
                                }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onTakePhoto}
                            activeOpacity={0.7}
                            style={styles.btnTakePhoto}>
                            <View style={{
                                width: 70,
                                height: 70,
                                borderRadius: 70,
                                backgroundColor: "#fff",
                                borderColor: '#000',
                                borderWidth: 4
                            }}>

                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={setFront.bind(null, !front)}
                        >
                            <Icon name="camera-retake" size={40} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={{
                        ...styles.galleryInfo,
                        transform: [{
                            translateY: _galleryOffsetY
                        }],
                        zIndex: 1,
                        opacity: _galleryOffsetY.interpolate({
                            inputRange: [-SCREEN_HEIGHT + 170, 0],
                            outputRange: [1, 0]
                        })
                    }}>
                        <NavigationBar title="Your Gallery" callback={_onHideGallery} />
                        <View style={styles.galleryOptionsWrapper}>
                            <TouchableOpacity
                                onPress={_onShowGroups}
                                activeOpacity={0.8}
                                style={{
                                    ...styles.btnGalleryOption,
                                    borderTopRightRadius: 44,
                                    borderBottomRightRadius: 44,
                                }}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#318bfb'
                                }}>{groups[selectedGroupIndex]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={setMultiple.bind(null, !multiple)}
                                style={{
                                    ...styles.btnGalleryOption,
                                    borderTopLeftRadius: 44,
                                    borderBottomLeftRadius: 44,
                                }}>
                                <Icon name="layers-outline" size={30} color={multiple ? '#318bfb' : '#999'} />
                                <Text style={{
                                    fontWeight: '600',
                                    color: multiple ? '#318bfb' : '#999'
                                }}>Multiple</Text>
                            </TouchableOpacity>
                        </View>
                        <Animated.View style={{
                            position: 'absolute',
                            top: 170,
                            left: -150,
                            width: 150,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: "#fff",
                            borderWidth: 1,
                            borderColor: "#ddd",
                            borderLeftWidth: 0,
                            transform: [{
                                translateX: _groupsOffsetX
                            }],

                        }}>
                            <FlatList
                                data={groups}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacity
                                        onPress={_onSelectGroup.bind(null, index)}
                                        style={styles.btnGroup}>
                                        <Text style={{
                                            fontWeight: index === selectedGroupIndex ? '600' : '500',
                                            color: index === selectedGroupIndex ? '#000' : '#666'
                                        }}>{item}</Text>
                                    </TouchableOpacity>
                                }
                                keyExtractor={(item, index) => `${index}`}
                            />
                        </Animated.View>
                    </Animated.View>
                    <Animated.View style={{
                        ...styles.imageGalleryWrapper,
                        transform: [{
                            translateY: _galleryOffsetY
                        }]
                    }}>

                        <FlatList
                            onEndReached={_onLoadmore}
                            bounces={false}
                            style={styles.galleryList}
                            data={photos}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity
                                    onPress={_onSelectImage.bind(null, index)}
                                    activeOpacity={0.8}
                                    style={{
                                        ...styles.imageWrapper,
                                        marginHorizontal: (index - 1) % 3 === 0 ? 2.5 : 0
                                    }}
                                >
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
                                    <Image
                                        source={{
                                            uri: item.node.image.uri
                                        }}
                                        style={{
                                            width: "100%",
                                            height: '100%'
                                        }}
                                    />
                                </TouchableOpacity>
                            }
                            numColumns={3}
                            keyExtractor={(item, index) => `${index}`}
                        />
                        {multiple &&
                            <View
                                style={{
                                    ...styles.selectedImageWrapper,
                                }}>
                                <ScrollView
                                    ref={_hScrollRef}
                                    onContentSizeChange={() => {
                                        _hScrollRef.current?.scrollToEnd()
                                    }}
                                    style={{
                                        maxWidth: SCREEN_WIDTH - 100
                                    }}
                                    bounces={false}
                                    horizontal={true}
                                >
                                    {selectedPhotos.map((photoIndex: number, index: number) => (
                                        <Image
                                            key={index}
                                            source={{
                                                uri: photos[photoIndex].node.image.uri
                                            }}
                                            style={styles.previewMultiImage} />
                                    ))}
                                </ScrollView>
                                <TouchableOpacity
                                    disabled={selectedPhotos.length < 1}
                                    onPress={_onDoneMultiSelect}
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
                    </Animated.View>
                </View>
            </PanGestureHandler>
        </>
    )
}
export default StoryTaker

const styles = StyleSheet.create({
    container: {
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: "#000"
    },
    cameraContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
    },
    takeOptionsWrapper: {
        top: 0,
        left: 0,
        zIndex: 999,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        paddingTop: STATUS_BAR_HEIGHT,
    },
    topOptions: {
        top: STATUS_BAR_HEIGHT,
        left: 0,
        height: 60,
        width: SCREEN_WIDTH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    btnTopOptions: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomOptions: {
        height: 80,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    galleryInfo: {
        paddingTop: STATUS_BAR_HEIGHT,
        height: 170,
        width: "100%",
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#fff'
    },
    btnLastPhoto: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 2
    },
    lastPhoto: {
        width: 30,
        height: 30,
        borderRadius: 5
    },
    btnTakePhoto: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 80,
        width: 80,
        borderRadius: 80,
        backgroundColor: "#fff",
        transform: [{
            translateY: -90
        }]
    },
    imageGalleryWrapper: {
        backgroundColor: '#000',
        height: SCREEN_HEIGHT,
        position: 'absolute',
        width: "100%",
        top: SCREEN_HEIGHT,
        left: 0,
    },
    galleryList: {
        marginVertical: 1.25,
        maxHeight: SCREEN_HEIGHT - 170 - 2.5,
    },
    imageWrapper: {
        width: (SCREEN_WIDTH - 5) / 3,
        height: 200,
        marginVertical: 1.25
    },
    galleryHeader: {
        marginTop: STATUS_BAR_HEIGHT
    },
    galleryOptionsWrapper: {
        height: 170 - STATUS_BAR_HEIGHT - 44,
        width: "100%",
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    btnGalleryOption: {
        height: 44,
        paddingHorizontal: 15,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: "#999",
        backgroundColor: 'rgb(250,250,250)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnGroup: {
        height: 44,
        paddingHorizontal: 15,
        justifyContent: 'center'
    },
    selectedImageWrapper: {
        paddingHorizontal: 5,
        bottom: 170,
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
    previewMultiImage: {
        height: 54,
        width: 32,
        resizeMode: 'cover',
        borderRadius: 5,
        marginHorizontal: 5
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
