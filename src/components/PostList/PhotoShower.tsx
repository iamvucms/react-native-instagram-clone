import React, { useState, useRef, useEffect } from 'react'
import {
    ImageBackground, LayoutChangeEvent,
    Text, ScrollView, StyleSheet,
    View, NativeSyntheticEvent, NativeScrollEvent,
    Image,
    TouchableOpacity,
    Animated
} from 'react-native'
import { SCREEN_WIDTH } from '../../constants'
import ScaleImage from '../ScaleImage/'
import { PostImage } from '../../reducers/postReducer'
import FastImage from 'react-native-fast-image'
import { store } from '../../store'
import { navigate } from '../../navigations/rootNavigation'
export interface PhotoShowerProps {
    sources: PostImage[],
    onChangePage?: (page: number) => any
}
const PhotoShower = ({ sources, onChangePage }: PhotoShowerProps) => {
    const [showTags, setShowTags] = useState<boolean>(false)
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const maxImageHeight = Math.max(...sources.map(img => {
        if (img.fullSize) {
            return SCREEN_WIDTH
        } else return img.height * SCREEN_WIDTH / img.width
    }))
    const _animTags = React.useMemo(() =>
        sources.map(source => {
            return source.tags.map(tag =>
                new Animated.Value(0)
            )
        })
        , [])

    const [currentPage, setCurrentPage] = useState<number>(1)
    const scrollRef = useRef<ScrollView>(null)
    const _onEndDragHandler = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currIndex = Math.floor(x / SCREEN_WIDTH)
        const offsetXpercent = (x - Math.floor(x / SCREEN_WIDTH) * SCREEN_WIDTH) / SCREEN_WIDTH
        if (offsetXpercent > 0.5) {
            scrollRef.current?.scrollTo({
                x: (currIndex + 1) * SCREEN_WIDTH,
                y: 0,
                animated: true
            })
            if (onChangePage) onChangePage(currIndex + 2)
            setCurrentPage(currIndex + 2)
        } else {
            scrollRef.current?.scrollTo({
                x: currIndex * SCREEN_WIDTH,
                y: 0,
                animated: true
            })
            if (onChangePage) onChangePage(currIndex + 1)
            setCurrentPage(currIndex + 1)
        }
    }
    useEffect(() => {
        if (showTags) {
            Animated.parallel(_animTags[currentPage - 1].map(anim =>
                Animated.spring(anim, {
                    toValue: 1,
                    useNativeDriver: false
                }))).start()
        }
    }, [showTags])
    const _onViewTagProfile = (username: string) => {
        if (myUsername !== username) {
            navigate('ProfileX', {
                username
            })
        } else navigate('Account')
    }
    const _onHideTags = () => {
        Animated.parallel(_animTags[currentPage - 1].map(anim =>
            Animated.timing(anim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false
            }))).start(() => setShowTags(false))
    }
    return (
        <View style={styles.container}>
            {sources.length > 1 &&
                <View style={styles.paging}><Text style={{
                    fontWeight: '600',
                    color: '#fff'
                }}>{currentPage}/{sources?.length}</Text></View>
            }
            <ScrollView
                ref={scrollRef}
                onScrollEndDrag={_onEndDragHandler}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                horizontal={true}>
                {sources && sources.map((img, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={1}
                        onPress={() => {
                            if (!showTags) setShowTags(true)
                            else _onHideTags()
                        }}
                    >
                        <ImageBackground
                            source={{ uri: img.uri }}
                            blurRadius={20}
                            style={{
                                height: maxImageHeight,
                                width: SCREEN_WIDTH,
                                backgroundColor: 'white',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            <View>
                                {img.fullSize ? (
                                    <FastImage
                                        style={{
                                            width: img.width < img.height ? img.width * SCREEN_WIDTH / img.height : SCREEN_WIDTH,
                                            height: img.width > img.height ? img.height * SCREEN_WIDTH / img.width : SCREEN_WIDTH
                                        }}
                                        source={{ uri: img.uri }}
                                    />
                                ) : (
                                        <ScaleImage
                                            height={img.height * SCREEN_WIDTH / img.width}
                                            width={SCREEN_WIDTH}
                                            source={{ uri: img.uri }}
                                        />
                                    )}
                                {showTags && img.tags.map((tag, index2) => (
                                    <Animated.View
                                        key={index2}
                                        style={{
                                            width: getLabelWidth(_animTags, index, index2, tag),
                                            height: getLabelHeight(_animTags, index, index2, tag),
                                            opacity: getLabelOpacity(_animTags, index, index2),
                                            top: Animated.subtract(tag.y, Animated.divide(getLabelHeight(_animTags, index, index2, tag), 2)),
                                            left: Animated.subtract(tag.x, Animated.divide(getLabelWidth(_animTags, index, index2, tag), 2)),
                                            position: 'absolute'
                                        }}>
                                        <TouchableOpacity
                                            onPress={_onViewTagProfile.bind(null, tag.username)}
                                            activeOpacity={0.8}
                                            style={{
                                                ...styles.label,
                                                width: '100%',
                                                height: "100%",
                                                justifyContent: 'center',
                                                alignItems: "center"
                                            }}>
                                            <Text style={{
                                                color: '#fff',
                                            }}>{tag.username}</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View >
    )
}

export default React.memo(PhotoShower)

const styles = StyleSheet.create({
    container: {
        position: 'relative'
    },
    paging: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 5,
        paddingHorizontal: 10,
        zIndex: 99,
        borderRadius: 50,
        top: 10,
        right: 10,
    },
    label: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 1,
        borderRadius: 5,
    }
})
function getLabelOpacity(_animTags: Animated.Value[][], index: number, index2: number) {
    return _animTags[index][index2].interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })
}

function getLabelHeight(_animTags: Animated.Value[][], index: number, index2: number, tag: { x: number; y: number; width: number; height: number; username: string }) {
    return _animTags[index][index2].interpolate({
        inputRange: [0, 1],
        outputRange: [0, tag.height],
        extrapolate: 'clamp',
    })
}

function getLabelWidth(_animTags: Animated.Value[][], index: number, index2: number, tag: { x: number; y: number; width: number; height: number; username: string }) {
    return _animTags[index][index2].interpolate({
        inputRange: [0, 1],
        outputRange: [0, tag.width],
        extrapolate: 'clamp',
    })
}

