import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Animated, StyleSheet, TouchableOpacity } from 'react-native'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack } from '../../../navigations/rootNavigation'
import FastImage from 'react-native-fast-image'

type ImageFullViewRouteProp = RouteProp<SuperRootStackParamList, 'ImageFullView'>

type ImageFullViewProps = {
    route: ImageFullViewRouteProp
}

const ImageFullView = ({ route }: ImageFullViewProps) => {
    const { pH, pW, pX, pY, oH, oW, pScale, uri, borderRadius, unScaled } = route.params
    const [loadedImage, setLoadingImage] = useState<boolean>(false)
    const _anim = React.useMemo(() => new Animated.Value(0), [])
    useEffect(() => {
        if (loadedImage) {
            _onAnimateImage()
        }
    }, [loadedImage])
    const _onAnimateImage = () => {
        Animated.spring(_anim, {
            toValue: 1,
            useNativeDriver: !unScaled,
        }).start()
    }
    const _onGoback = () => {
        Animated.timing(_anim, {
            toValue: 0,
            useNativeDriver: !unScaled,
            duration: 300
        }).start(goBack)
    }
    const targetScale = SCREEN_WIDTH / oW

    const getStyle = () => {
        let styleX = {
            transform: [
                {
                    translateX: _anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                            (pX + oW * pScale - (oW / 2) - (oW * pScale / 2)),
                            (SCREEN_WIDTH - (oW / 2) - (oW * targetScale / 2)),
                        ],
                    })
                },
                {
                    translateY: _anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                            (pY + oH * pScale - (oH / 2) - (oH * pScale / 2)),
                            (SCREEN_HEIGHT - oH * targetScale) * (oH > oW ? 2.75 : 1) - (oH / 2)
                            - (oH * targetScale / 2)
                        ],
                    })
                },
                {
                    scale: _anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [pScale, SCREEN_WIDTH / oW]
                    })
                },
            ],
        }
        const heightY = targetScale * oH
        const styleY = {
            left: _anim.interpolate({
                inputRange: [0, 1],
                outputRange: [pX, 0]
            }),
            top: _anim.interpolate({
                inputRange: [0, 1],
                outputRange: [pY, (SCREEN_HEIGHT - heightY) / 2]
            }),
            height: _anim.interpolate({
                inputRange: [0, 1],
                outputRange: [pH, heightY]
            }),
            width: _anim.interpolate({
                inputRange: [0, 1],
                outputRange: [pW, SCREEN_WIDTH]
            }),
        }
        if (unScaled) {
            return styleY
        } else return styleX

    }
    return (
        <>
            <TouchableOpacity
                activeOpacity={1}
                onPress={_onGoback}
                style={styles.container}>
                <Animated.View style={[styles.container, {
                    opacity: _anim,
                    backgroundColor: 'rgba(0,0,0,0.8)'
                }]}>

                </Animated.View>
            </TouchableOpacity>
            <Animated.View
                style={{
                    ...styles.image,
                    zIndex: 1,
                    top: 0,
                    left: 0,
                    width: oW,
                    height: oH,
                    borderRadius: _anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [borderRadius ? 20 / pScale : 0, 0]
                    }),
                    ...getStyle()
                }}
            >
                <FastImage
                    onLoad={() => setLoadingImage(true)}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                    source={{
                        uri
                    }}
                />
            </Animated.View>
        </>
    )
}

export default ImageFullView

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    image: {
        position: 'absolute',
        overflow: "hidden"
    }
})
