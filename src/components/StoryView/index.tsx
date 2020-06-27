import React, { useState } from 'react'
import { StyleSheet, Text, View, Animated, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native'
import { Story, ExtraStory } from '../../reducers/storyReducer'
import StoryItem from './StoryItem'
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants'
import { ScrollView } from 'react-native-gesture-handler'
//constant
const perspective = 500
const A = Math.atan(perspective / (SCREEN_WIDTH / 2))
const ratio = Platform.OS === 'ios' ? 2 : 1.2;
export interface StoryViewProps {
    data: ExtraStory[]
}
export type StoryController = {
    currentGroupIndex: number,
    currentChildIndex: number
}
const StoryView = ({ data }: StoryViewProps) => {
    const [storyControllers, setStoryControllers] = useState<StoryController[]>(
        data.map(() => ({
            currentGroupIndex: 0,
            currentChildIndex: 0
        })))
    const animX = React.useMemo(() => new Animated.Value(1), [])
    const _onScrollHandler = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        animX.setValue(x)
    }
    const _onScrollEndHandler = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nextIndex = Math.floor(x / SCREEN_WIDTH)
        const preIndex = storyControllers[0].currentGroupIndex
        const temp = [...storyControllers]
        temp[preIndex] = { ...temp[preIndex] }
        temp[nextIndex] = { ...temp[nextIndex] }
        for (let x of temp) {
            x.currentGroupIndex = nextIndex
        }
        setStoryControllers(temp)
    }
    const _getStoryStyle = (index: number) => {
        //William Instagram Stories code.
        const offset = index * SCREEN_WIDTH
        const inputRange = [offset - SCREEN_WIDTH, offset + SCREEN_WIDTH];
        const translateX = animX.interpolate({
            inputRange,
            outputRange: [SCREEN_WIDTH / ratio, -SCREEN_WIDTH / ratio],
            extrapolate: 'clamp',
        });
        const rotateY = animX.interpolate({
            inputRange,
            outputRange: [`${A}rad`, `-${A}rad`],
            extrapolate: 'clamp',
        });

        const translateX1 = animX.interpolate({
            inputRange,
            outputRange: [(SCREEN_WIDTH / 2), -SCREEN_WIDTH / 2],
            extrapolate: 'clamp',
        });

        const extra = ((SCREEN_WIDTH / ratio) / Math.cos(A / 2)) - SCREEN_WIDTH / ratio;
        const translateX2 = animX.interpolate({
            inputRange,
            outputRange: [-extra, extra],
            extrapolate: 'clamp',
        });
        return {
            ...StyleSheet.absoluteFillObject,
            transform: [
                { perspective },
                { translateX },
                { rotateY },
                { translateX: translateX1 },
                { translateX: translateX2 },
            ],
        }
    }
    return (
        <View style={styles.container}>
            <ScrollView
                bounces={false}
                contentContainerStyle={{
                    width: SCREEN_WIDTH * data.length,
                }}
                snapToInterval={SCREEN_WIDTH}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={5}
                onScroll={_onScrollHandler}
                onMomentumScrollEnd={_onScrollEndHandler}
                horizontal={true}
                decelerationRate={0.99}
            >
                <Animated.View style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                    ...StyleSheet.absoluteFillObject,
                    transform: [{
                        translateX: animX
                    }]
                }}>
                    {data.map((story, index) => (
                        <Animated.View key={index} style={_getStoryStyle(index)}>
                            <StoryItem
                                item={story}
                                index={index}
                                controller={storyControllers[index]}
                            />
                        </Animated.View>
                    ))}
                </Animated.View>
            </ScrollView>
        </View>
    )
}

export default StoryView

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    }
})
