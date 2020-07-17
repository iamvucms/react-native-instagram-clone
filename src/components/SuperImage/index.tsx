import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ImageBackground, Animated, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants'
import TextGradient from '../TextGradient'
import FastImage from 'react-native-fast-image'
import { StoryProcessedImage, StoryLabel } from '../../screens/Others/StoryProcessor'
import { firestore } from 'firebase'
import { navigate } from '../../navigations/rootNavigation'
import { store } from '../../store'
export interface SuperImageProps {
    superId: number,
    onNext?: () => void
    onBack?: () => void
    onStopAnimation?: () => void,
    disableNavigation?: boolean,
    disablePress?: boolean,
    fitSize?: boolean,
    showOnlyImage?: boolean,
    onReady?: () => void
}
const SuperImage = ({ onReady, fitSize, showOnlyImage, disablePress, superId, disableNavigation, onNext, onBack, onStopAnimation }: SuperImageProps) => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const [photo, setPhoto] = useState<StoryProcessedImage>()
    useEffect(() => {
        fetchSuperImage()
    }, [])
    const fetchSuperImage = async () => {
        const ref = firestore()
        const rq = await ref.collection('superimages').doc(`${superId}`).get()
        if (rq.exists) {
            const data: StoryProcessedImage = rq.data() as StoryProcessedImage
            setPhoto({ ...data })
        }
    }
    const _onLabelPress = async (label: StoryLabel) => {
        if (disableNavigation) return;
        if (onStopAnimation) onStopAnimation()
        switch (label.type) {
            case 'address':
                navigate('Location', {
                    address: {
                        place_name: label.text,
                        id: label.address_id
                    }
                })
                break
            case 'hashtag':
                navigate('Hashtag', {
                    hashtag: label.text.trim()
                })
                break
            case 'people':
                const targetUsername = label.text.slice(1)
                if (targetUsername !== myUsername)
                    navigate('ProfileX', {
                        username: targetUsername
                    })
                break
            default:
                break
        }
    }
    if (!photo) {
        return (
            <View style={styles.backgroundContainer} />
        )
    } else {
        return (
            <View style={{
                ...StyleSheet.absoluteFillObject,
                width: fitSize ? '100%' : SCREEN_WIDTH,
                height: fitSize ? '100%' : SCREEN_HEIGHT,
            }}>
                <ImageBackground
                    onLoadEnd={() => onReady && onReady()}
                    style={{
                        ...styles.backgroundContainer,
                    }}
                    source={{
                        uri: photo.uri,
                        cache: "force-cache"
                    }}
                    blurRadius={10}
                >
                    {!!!disablePress &&
                        <View style={{
                            ...StyleSheet.absoluteFillObject,
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            flexDirection: 'row',
                        }}>
                            <TouchableOpacity
                                onPress={() => onBack && onBack()}
                                style={{
                                    width: '50%',
                                    height: '100%'
                                }} ><></></TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onNext && onNext()}
                                style={{
                                    width: '50%',
                                    height: '100%'
                                }} ><></></TouchableOpacity>
                        </View>
                    }

                    {!!!showOnlyImage && photo.texts.map((txtLabel, labelIndex) => (
                        <View
                            key={labelIndex}
                            style={{
                                zIndex: txtLabel.zIndex,
                                backgroundColor: txtLabel.textBg ? txtLabel.color : 'rgba(0,0,0,0)',
                                padding: 5,
                                borderRadius: 5,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                transform: [{
                                    translateX: txtLabel.x,
                                },
                                {
                                    translateY: txtLabel.y
                                },
                                {
                                    scale: txtLabel.ratio
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
                        </View>
                    ))}
                    {!!!showOnlyImage && photo.labels.map((label, labelIndex) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={_onLabelPress.bind(null, label)}
                            key={labelIndex}
                            style={{
                                zIndex: label.zIndex,
                                backgroundColor: label.type === 'emoji' ? 'rgba(0,0,0,0)' : '#fff',
                                borderRadius: 5,
                                position: 'absolute',
                                width: label.width,
                                height: label.height,
                                justifyContent: 'center',
                                alignItems: 'center',
                                top: 0,
                                left: 0,
                                transform: [
                                    {
                                        translateX: label.x,
                                    },
                                    {
                                        translateY: label.y
                                    },
                                    {
                                        scale: label.ratio
                                    }
                                ]
                            }}>
                            {label.type === 'emoji' ? (
                                <Text style={{
                                    fontSize: label.fontSize,
                                }}>
                                    {label.text}
                                </Text>
                            ) : (
                                    <TextGradient
                                        {...(label.type === 'address' ? {
                                            icon: {
                                                name: 'map-marker',
                                                size: label.fontSize
                                            }
                                        } : {})}
                                        text={label.text}
                                        numberOfLines={1}
                                        style={{
                                            fontSize: label.fontSize,
                                            maxWidth: label.width
                                                - (label.type === 'address' ? label.fontSize : 0)
                                        }}
                                    />
                                )}
                        </TouchableOpacity>
                    ))}
                    <Animated.View
                        style={{
                            width: fitSize ? '100%' : photo.width,
                            height: fitSize ? '100%' : photo.height,
                            transform: [
                                {
                                    scale: fitSize ? 1 : photo.ratio
                                },
                                {
                                    rotate: photo.rotateDeg
                                },
                                {
                                    translateX: photo.translateX
                                },
                                {
                                    translateY: photo.translateY
                                }
                            ]
                        }}
                    >

                        <FastImage
                            resizeMode="contain"
                            style={{
                                width: '100%',
                                height: "100%"
                            }}
                            source={{
                                uri: photo.uri
                            }} />
                    </Animated.View>
                </ImageBackground>
            </View >
        )
    }


}

export default SuperImage

const styles = StyleSheet.create({
    backgroundContainer: {
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        justifyContent: "center",
        alignItems: 'center'
    },
})