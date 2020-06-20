import React from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { MixedProfileX } from '../../screens/Home/Explore/FollowTab/ProfileXMutual'
import { HashTag } from '../../reducers/userReducer'
import { MapBoxAddress } from '../../utils'
import { ResultItem, listStyle } from './TopResult'

export interface TagsProps {
    resultData: (MixedProfileX | HashTag | MapBoxAddress)[],
    recentList: (MixedProfileX | HashTag | MapBoxAddress)[]
    searching?: boolean
}
const Tags = ({ resultData, recentList, searching }: TagsProps) => {
    return (
        <View style={styles.container}>
            {!searching &&
                <FlatList
                    style={listStyle}
                    ListHeaderComponent={
                        <View>
                            <Text style={{
                                margin: 15,
                                fontWeight: '700',
                                fontSize: 16
                            }}>Recent</Text>
                        </View>}
                    data={recentList}
                    renderItem={({ item, index }) =>
                        <ResultItem showRemoveBtn={true}
                            item={item}
                            key={index} />
                    }
                    keyExtractor={(item, index) => `${index}`}
                />
            }
            {searching &&
                <FlatList
                    style={listStyle}
                    ListHeaderComponent={
                        <View>
                            <Text style={{
                                margin: 15,
                                fontWeight: '700',
                                fontSize: 16
                            }}>Results</Text>
                        </View>}
                    data={resultData}
                    renderItem={({ item, index }) =>
                        <ResultItem item={item} key={index} />
                    }
                    keyExtractor={(item, index) => `${index}`}
                />
            }
        </View>
    )
}

export default Tags

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    },
})
