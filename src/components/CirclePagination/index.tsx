import React, { useState } from 'react'
import { StyleSheet, Text, View, LayoutChangeEvent } from 'react-native'
import { SCREEN_WIDTH } from '../../constants'
export interface CirclePaginationProps {
    maxPage: number,
    currentPage: number
}
const index = ({ maxPage, currentPage }: CirclePaginationProps) => {
    const [containerWidth, setContainerWidth] = useState<number>(0)
    const circleArr = [...Array(maxPage + 1).keys()].splice(1, maxPage)
    const _onLayoutHandler = ({ nativeEvent: {
        layout: { width }
    } }: LayoutChangeEvent) => {
        setContainerWidth(width)
    }
    return (
        <View onLayout={_onLayoutHandler} style={{
            ...styles.container,
            left: (SCREEN_WIDTH - containerWidth) / 2
        }}>
            {circleArr.map((circle, index) => (
                <View key={index} style={{
                    ...styles.circle,
                    backgroundColor: currentPage === circle ? '#318bfb' : '#ddd',
                    width: currentPage === circle ? 8 : 6,
                    height: currentPage === circle ? 8 : 6
                }}></View>
            ))}
        </View>
    )
}

export default React.memo(index)

const styles = StyleSheet.create({
    container: {
        height: '100%',
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    circle: {
        marginHorizontal: 2,
        borderRadius: 8,
    }
})
