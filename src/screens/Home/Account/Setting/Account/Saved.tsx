import React from 'react'
import { SafeAreaView, Text, ScrollView, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import NavigationBar from '../../../../../components/NavigationBar'
import { navigation, navigate } from '../../../../../navigations/rootNavigation'
import { useSelector } from '../../../../../reducers'
import FastImage from 'react-native-fast-image'

const SCREEN_WIDTH = Dimensions.get('window').width
const Saved = (): JSX.Element => {
    const collections = useSelector(state => state.user.bookmarks) || []
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <NavigationBar title="Saved" callback={() => {
                    navigation.goBack()
                }} />
                <TouchableOpacity style={styles.btnAdd}>
                    <Icon name="plus" size={30} color="#000" />
                </TouchableOpacity>
            </View>
            <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.collectionsWrapper}>
                    {collections.map((collection, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                onPress={() =>
                                    navigate('SavedCollection', {
                                        collectionName: collection.name
                                    })
                                }
                                activeOpacity={0.8}
                                style={styles.collection}>
                                {new Array(4).fill(0).map((_, index2) => (
                                    <View
                                        key={index2}
                                        style={{
                                            ...styles.previewImage,
                                            marginTop: index2 > 1 ? 1 : 0
                                        }}
                                    >
                                        {collection.bookmarks[collection.bookmarks.length - index2 - 1] &&
                                            <FastImage
                                                style={{
                                                    width: "100%",
                                                    height: '100%'
                                                }}
                                                source={{
                                                    uri: collection.bookmarks[collection.bookmarks.length - index2 - 1]
                                                        .previewUri
                                                }} />
                                        }
                                    </View>
                                ))}
                            </TouchableOpacity>
                            <Text style={{
                                margin: 7.5,
                                fontWeight: '600'
                            }}>{collection.name}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

export default Saved
const COLLECTION_SIZE = (SCREEN_WIDTH - 15) / 2 - 15
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: '100%',
        width: '100%',
    },
    settingItem: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    btnAdd: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 1,
        top: 0,
        right: 0
    },
    collectionsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 7.5,
        paddingVertical: 7.5
    },
    collection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: COLLECTION_SIZE,
        width: COLLECTION_SIZE,
        margin: 7.5,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: "#fff",
        justifyContent: 'space-between',
    },
    previewImage: {
        height: COLLECTION_SIZE / 2 - 1,
        width: COLLECTION_SIZE / 2 - 1,
        backgroundColor: '#ddd',
    }
})
