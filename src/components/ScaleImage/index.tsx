import React, { useState } from 'react'
import { Image, StyleSheet } from 'react-native'
import FastImage, { FastImageProps } from 'react-native-fast-image'
import { SCREEN_WIDTH } from '../../constants'
export interface ScaleImageProps extends FastImageProps {
    width?: number,
    height?: number,
    source: {
        uri: string
    }
}
const index = (props: ScaleImageProps) => {
    const [rwidth, setRwidth] = useState<number>(0)
    const [rheight, setRheight] = useState<number>(0)
    let filteredProps = { ...props }
    Image.getSize(filteredProps.source.uri, (xwidth, xheight) => {
        if (props.width) {
            setRheight(xheight * props.width / xwidth)
            setRwidth(props.width)
        } else if (props.height) {
            setRwidth(xwidth * props.height / xheight)
            setRheight(props.height)
        }
    }, Function)
    return (
        <FastImage {...filteredProps} source={{
            uri: filteredProps.source.uri,
            priority: FastImage.priority.high
        }} style={[filteredProps.style, {
            width: rwidth > 0 ? rwidth : (props.width || SCREEN_WIDTH),
            height: rheight,
        }]} />
    )
}

export default React.memo(index)

const styles = StyleSheet.create({})
