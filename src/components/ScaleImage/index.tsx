import React, { useState } from 'react'
import { StyleSheet, Text, View, Image, ImageProps } from 'react-native'
export interface ScaleImageProps extends ImageProps {
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
        <Image {...filteredProps} style={[filteredProps.style, {
            width: rwidth,
            height: rheight
        }]} />
    )
}

export default React.memo(index)

const styles = StyleSheet.create({})
