import { RouteProp } from '@react-navigation/native'
import React, { useState } from 'react'
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { goBack, navigate } from '../../../../../navigations/rootNavigation'
import { useSelector } from '../../../../../reducers'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { useDispatch } from 'react-redux'
import { RemoveFromBookmarkCollectionRequest, RemoveBookmarkCollectionRequest } from '../../../../../actions/userActions'
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
    const dispatch = useDispatch()
    const collectionName = `${route?.params?.collectionName}`
    const collection = useSelector(state => state.user
        .bookmarks?.find(x => x.name === collectionName))
    const bookmarks = [...(collection?.bookmarks || [])]
    bookmarks.reverse()
    //
    const [selectionMode, setSelectionMode] = useState<boolean>(false)
    const [selectedIndexs, setSelectedIndexs] = useState<number[]>([])
    const [showOptions, setShowOptions] = useState<boolean>(false)

    const _onGoback = () => {
        if (selectionMode) {
            setSelectionMode(false)
            setSelectedIndexs([])
        } else goBack()
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
    const _onRemove = () => {
        if (selectedIndexs.length === bookmarks.length) {
            dispatch(RemoveBookmarkCollectionRequest(collectionName))
            goBack()
        } else {
            selectedIndexs.map((index) => {
                dispatch(RemoveFromBookmarkCollectionRequest(
                    bookmarks[index].postId, collectionName)
                )
            })
            setSelectedIndexs([])
        }
    }
    return (
        <SafeAreaView style={{
            height: SCREEN_HEIGHT - getTabBarHeight(),
            ...styles.container
        }}>
            {showOptions &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowOptions(false)}
                    style={styles.backdrop}>
                    <View style={styles.menu}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>
                                Edit Collection
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>
                                Add to Collection
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectionMode(true)
                                setShowOptions(false)
                            }}
                            style={styles.menuItem}>
                            <Text style={styles.menuText}>
                                Select...
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        onPress={_onGoback}
                        style={styles.btnNavigation}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    {(selectionMode && selectedIndexs.length > 0) ? (
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600'
                        }}>{selectedIndexs.length} Selected</Text>
                    ) : (
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
                        )}
                </View>
                <TouchableOpacity
                    onPress={() => setShowOptions(true)}
                    style={styles.btnNavigation}>
                    <Icon name="dots-vertical" size={20} />
                </TouchableOpacity>
            </View>
            <FlatList
                bounces={false}
                numColumns={3}
                data={bookmarks}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onLongPress={() => {
                            if (!selectionMode) {
                                setSelectedIndexs([index])
                                setSelectionMode(true)
                            }
                        }}
                        onPress={() => {
                            if (selectionMode) {
                                _onSelectImage(index)
                            } else navigate('PostDetail', {
                                postId: item.postId
                            })
                        }}
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
                        {selectionMode &&
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
                        }
                    </TouchableOpacity>
                )}
                keyExtractor={(_, index) => `${index}`}
            />
            {selectionMode &&
                <View style={styles.bottomOptions}>
                    <TouchableOpacity
                        onPress={_onRemove}
                        disabled={selectedIndexs.length === 0}
                        style={styles.bottomOption}
                    >
                        <Text style={{
                            fontSize: 16,
                            color: selectedIndexs.length > 0 ? '#000' : "#666",
                            fontWeight: "500"
                        }}>Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            navigate('MoveBookmarkOptions', {
                                fromCollectionName: collectionName,
                                bookmarks: [...bookmarks],
                                selectedIndexs
                            })}
                        disabled={selectedIndexs.length === 0}
                        style={styles.bottomOption}
                    >
                        <Text style={{
                            fontSize: 16,
                            color: selectedIndexs.length > 0 ? '#000' : "#666",
                            fontWeight: "500"
                        }}>Move</Text>
                    </TouchableOpacity>
                </View>
            }
        </SafeAreaView>
    )
}

export default React.memo(SavedCollection)
const IMAGE_SIZE = (SCREEN_WIDTH - 6) / 3
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        width: '100%',

    },
    bottomOptions: {
        flexDirection: 'row',
        height: 64,
        width: '100%',
        bottom: 0,
        left: 0,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: 'rgb(242,242,242)'
    },
    bottomOption: {
        height: 44,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 4,
        width: (SCREEN_WIDTH - 30) / 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backdrop: {
        zIndex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    menu: {
        width: '80%',
        borderRadius: 5,
        height: 44 * 3,
        backgroundColor: "#fff"
    },
    menuItem: {
        paddingHorizontal: 15,
        height: 44,
        justifyContent: 'center'
    },
    menuText: {
        fontSize: 16,
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
