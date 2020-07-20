import React from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { Highlight } from '../../reducers/userReducer'
import HighlightPreviewItem from './HighlightPreviewItem'
import { SCREEN_WIDTH } from '../../constants'
import HighlightAdderItem from './HighlightAdderItem'
export interface HighlightPreviewListProps {
    highlights: Highlight[],
    showAdder?: boolean
}
const HighlightPreviewList = ({ highlights, showAdder }: HighlightPreviewListProps) => {
    const isMyHighlight = !!showAdder
    return (
        <View style={styles.container}>
            <FlatList
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingHorizontal: 15,
                }}
                ListHeaderComponent={showAdder ? HighlightAdderItem : null}
                style={{
                    width: SCREEN_WIDTH
                }}
                bounces={false}
                horizontal
                data={highlights}
                renderItem={({ item, index }) => (
                    <HighlightPreviewItem {...{ item, isMyHighlight }} />
                )}
                keyExtractor={(_, index) => `${index}`}
            />
        </View>
    )
}

export default HighlightPreviewList

const styles = StyleSheet.create({
    container: {
        marginBottom: 15
    }
})
