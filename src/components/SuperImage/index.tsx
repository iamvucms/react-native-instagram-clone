import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ImageBackground, Animated, TouchableOpacity } from 'react-native'
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants'
import TextGradient from '../TextGradient'
import FastImage from 'react-native-fast-image'
import { StoryProcessedImage, StoryLabel } from '../../screens/Others/StoryProcessor'
import { firestore } from 'firebase'
import { navigate } from '../../navigations/rootNavigation'
import { store } from '../../store'
export interface SuperImageProps {
    superId: number
}
const SuperImage = ({ superId }: SuperImageProps) => {
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
        switch (label.type) {
            case 'address':
                navigate('location', {
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
    } else
        return (
            <View style={StyleSheet.absoluteFillObject}>
                <ImageBackground
                    style={styles.backgroundContainer}
                    source={{
                        uri: photo.uri
                    }}
                    blurRadius={10}
                >
                    {photo.texts.map((txtLabel, labelIndex) => (
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
                    {photo.labels.map((label, labelIndex) => (
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
                            width: photo.width,
                            height: photo.height,
                            transform: [
                                {
                                    scale: photo.ratio
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
            </View>
        )
}

export default SuperImage

const styles = StyleSheet.create({
    backgroundContainer: {
        overflow: 'hidden',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: "center",
        alignItems: 'center'
    },
})