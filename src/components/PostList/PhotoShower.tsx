import React, { useState, useRef } from 'react'
import {
    ImageBackground, LayoutChangeEvent,
    Text, ScrollView, StyleSheet,
    View, NativeSyntheticEvent, NativeScrollEvent
} from 'react-native'
import { SCREEN_WIDTH } from '../../constants'
import ScaleImage from '../ScaleImage/'
export interface PhotoShowerProps {
    sources?: string[],
    onChangePage?: (page: number) => any
}
const PhotoShower = ({ sources, onChangePage }: PhotoShowerProps) => {
    const [maxImageHeight, setMaxImageHeight] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const scrollRef = useRef<ScrollView>(null)
    const _onLayoutHandler = ({ nativeEvent: {
        layout: { height }
    } }: LayoutChangeEvent) => {
        if (height > maxImageHeight) setMaxImageHeight(height)
    }
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
    return (
        <View style={styles.container}>
            {sources?.length && sources.length > 1 && < View style={styles.paging}>
                <Text style={{
                    fontWeight: '600',
                    color: '#fff'
                }}>{currentPage}/{sources?.length}</Text>
            </View>}
            <ScrollView
                ref={scrollRef}
                onScrollEndDrag={_onEndDragHandler}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                horizontal={true}>
                {sources && sources.map((src, index) => (
                    <ImageBackground
                        key={index}
                        source={{ uri: src }}
                        blurRadius={20}
                        style={{
                            height: maxImageHeight,
                            width: SCREEN_WIDTH,
                            backgroundColor: 'white',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <ScaleImage
                            onLayout={_onLayoutHandler}
                            width={SCREEN_WIDTH}
                            source={{ uri: src }}
                        />
                    </ImageBackground>
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
    }
})
