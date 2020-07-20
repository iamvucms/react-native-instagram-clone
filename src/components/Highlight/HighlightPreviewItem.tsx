import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { Highlight } from '../../reducers/userReducer'
import FastImage from 'react-native-fast-image'
import { navigate } from '../../navigations/rootNavigation'
export interface HighlightPreviewItemProps {
    item: Highlight,
    isMyHighlight?: boolean
}
const HighlightPreviewItem = ({ item, isMyHighlight }: HighlightPreviewItemProps) => {
    const _onViewHighLight = () => {
        navigate("HighlightFullView", {
            highlight: { ...item },
            isMyHighlight
        })
    }
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={_onViewHighLight}
            style={styles.container}
        >
            <View
                style={styles.borderCover}>
                <FastImage source={{
                    uri: item.avatarUri
                }}
                    style={styles.avatar}
                />
            </View>
            <Text
                numberOfLines={1}
                style={{
                    fontWeight: '500',
                    marginTop: 5,
                    maxWidth: '100%'
                }}>{item.name}</Text>
        </TouchableOpacity>
    )
}

export default HighlightPreviewItem

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        maxWidth: 70
    },
    borderCover: {
        borderRadius: 999,
        padding: 2,
        borderColor: '#999',
        borderWidth: 1,
    },
    avatar: {
        height: 64,
        width: 64,
        borderRadius: 64,
    }
})
