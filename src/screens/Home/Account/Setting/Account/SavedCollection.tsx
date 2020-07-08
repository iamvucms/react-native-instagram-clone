import React from 'react'
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Dimensions, FlatList } from 'react-native'
import { RouteProp } from '@react-navigation/native'
import { useSelector } from '../../../../../reducers'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { goBack, navigate } from '../../../../../navigations/rootNavigation'
import FastImage from 'react-native-fast-image'
const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
type SavedCollectionRouteProp = RouteProp<{
    SavedCollection: {
        collectionName: string
    }
}, 'SavedCollection'>
type SavedCollectionProps = {
    route: SavedCollectionRouteProp
}
const SavedCollection = ({ route }: SavedCollectionProps) => {
    const collectionName = `${route?.params?.collectionName}`
    const collection = useSelector(state => state.user
        .bookmarks?.find(x => x.name === collectionName))
    const bookmarks = [...(collection?.bookmarks || [])]
    bookmarks.reverse()
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        onPress={goBack}
                        style={styles.btnNavigation}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <View>
                        <Text style={{
                            fontSize: 12
                        }}>
                            Saved
                        </Text>
                        <Text style={{
                            fontWeight: '600'
                        }}>
                            {collection?.name}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.btnNavigation}>
                    <Icon name="dots-vertical" size={20} />
                </TouchableOpacity>
            </View>
            <FlatList
                bounces={false}
                numColumns={3}
                data={bookmarks}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() =>
                            navigate('PostDetail', {
                                postId: item.postId
                            })
                        }
                        activeOpacity={0.8}
                        style={{
                            marginHorizontal: (index - 1) % 3 === 0 ? 3 : 0,
                            marginTop: index > 2 ? 3 : 0
                        }}>
                        <FastImage
                            source={{
                                uri: item.previewUri
                            }}
                            style={styles.bookmarkImage}
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(_, index) => `${index}`}
            />
        </SafeAreaView>
    )
}

export default SavedCollection
const IMAGE_SIZE = (SCREEN_WIDTH - 6) / 3
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        width: '100%',
        height: SCREEN_HEIGHT
    },
    navigationBar: {
        height: 44,
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1
    },
    btnNavigation: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookmarkImage: {
        height: IMAGE_SIZE,
        width: IMAGE_SIZE
    }
})
