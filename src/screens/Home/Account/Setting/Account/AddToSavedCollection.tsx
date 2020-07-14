import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Image, FlatList, Dimensions } from 'react-native'
import { goBack } from '../../../../../navigations/rootNavigation'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import FastImage from 'react-native-fast-image'
import { useSelector } from '../../../../../reducers'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { RouteProp } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { AddBookmarkToCollectionRequest } from '../../../../../actions/userActions'
const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const STATUS_BAR_HEIGHT = getStatusBarHeight()

type AddToSavedCollectionRouteProp = RouteProp<{
    AddToSavedCollection: {
        collectionName: string
    }
}, 'AddToSavedCollection'>
type AddToSavedCollectionProps = {
    route: AddToSavedCollectionRouteProp
}
const AddToSavedCollection = ({ route }: AddToSavedCollectionProps) => {
    const dispatch = useDispatch()
    const { collectionName } = route.params
    const currentBookmarks = useSelector(state => state.user
        .bookmarks?.find(x => x.name === collectionName))?.bookmarks || []
    const collection = useSelector(state => state.user
        .bookmarks?.find(x => x.name === `All Posts`))
    const bookmarks = [...(collection?.bookmarks || [])]
        .filter(x => currentBookmarks.every(y => y.postId !== x.postId))
    bookmarks.reverse()
    //
    const [selectedIndexs, setSelectedIndexs] = useState<number[]>([])
    const _onDone = () => {
        if (selectedIndexs.length > 0) {
            const additionBookmarks = selectedIndexs.map(i => bookmarks[i])
            dispatch(AddBookmarkToCollectionRequest(collectionName, additionBookmarks))
        }
        goBack()
    }
    const _onSelectImage = (index: number) => {
        const position = selectedIndexs.indexOf(index)
        const newIndexs = [...selectedIndexs]
        if (position > -1) {
            newIndexs.splice(position, 1)
        } else {
            newIndexs.push(index)
        }
        setSelectedIndexs(newIndexs)
    }
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
                            Add From
                        </Text>
                        <Text style={{
                            fontWeight: '600'
                        }}>
                            Saved
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={_onDone}
                    style={{
                        ...styles.btnNavigation,
                    }}>
                    <Image
                        style={{
                            height: 20,
                            width: 20
                        }}
                        source={require('../../../../../assets/icons/correct.png')}
                    />
                </TouchableOpacity>
            </View>
            <FlatList
                bounces={false}
                numColumns={3}
                data={bookmarks}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() => _onSelectImage(index)}
                        activeOpacity={0.8}
                        style={{
                            marginHorizontal: (index - 1) % 3 === 0 ? 3 : 0,
                            marginTop: index > 2 ? 3 : 0,
                        }}>
                        <FastImage
                            source={{
                                uri: item.previewUri
                            }}
                            style={styles.bookmarkImage}
                        />
                        <View style={{
                            position: 'absolute',
                            right: 7.5,
                            top: 7.5,
                            height: 24,
                            width: 24,
                            borderRadius: 24,
                            borderColor: '#fff',
                            borderWidth: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1,
                            backgroundColor: selectedIndexs.indexOf(index) > -1
                                ? '#318bfb' : 'rgba(0,0,0,0.3)'
                        }}>
                            {selectedIndexs.indexOf(index) > -1 &&
                                <Text style={{
                                    color: '#fff'
                                }}>
                                    {selectedIndexs.indexOf(index) + 1}
                                </Text>
                            }
                        </View>

                    </TouchableOpacity>
                )}
                keyExtractor={(_, index) => `${index}`}
            />
        </SafeAreaView>
    )
}

export default AddToSavedCollection
const IMAGE_SIZE = (SCREEN_WIDTH - 6) / 3
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: "100%",
        backgroundColor: "#fff"
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
