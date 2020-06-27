import React, { useState } from 'react'
import { StyleSheet, Text, View, Animated, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native'
import { Story, ExtraStory } from '../../reducers/storyReducer'
import StoryItem from './Story'
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants'
import { ScrollView } from 'react-native-gesture-handler'
//constant
const perspective = 500
const A = Math.atan(perspective / (SCREEN_WIDTH / 2))
const ratio = Platform.OS === 'ios' ? 2 : 1.2;
export interface StoryViewProps {
    data: ExtraStory[]
}
const StoryView = ({ data }: StoryViewProps) => {
    const [state, setState] = useState<{
        currentItemIndex: number,
        currentChildIndex: number
    }>({
        currentItemIndex: 0,
        currentChildIndex: 0
    })
    const animX = React.useMemo(() => new Animated.Value(1), [])
    const _onScrollHandler = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        animX.setValue(x)
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
                scrollEventThrottle={16}
                onScroll={_onScrollHandler}
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
                            <StoryItem item={story} />
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
