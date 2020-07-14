import { RouteProp } from '@react-navigation/native'
import React, { useState } from 'react'
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList } from 'react-native'
import { useSelector } from '../../../../../reducers'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { goBack } from '../../../../../navigations/rootNavigation'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'
import { RemoveBookmarkCollectionRequest, UpdateBookmarkCollectionRequest } from '../../../../../actions/userActions'
import { store } from '../../../../../store'
const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
type EditSavedCollectionRouteProp = RouteProp<{
    EditSavedCollection: {
        collectionName: string
    }
}, 'EditSavedCollection'>
type EditSavedCollectionProps = {
    route: EditSavedCollectionRouteProp
}
const EditSavedCollection = ({ route }: EditSavedCollectionProps) => {
    const dispatch = useDispatch()
    const collectionName = `${route?.params?.collectionName}`
    const collection = store.getState().user.bookmarks?.find(x => x.name === collectionName)
    const bookmarks = [...(collection?.bookmarks || [])]
    bookmarks.reverse()
    /**
     * mode
     * 1:Normal
     * 2:Change cover
     * 3:Confirm deletion
     */
    const [mode, setMode] = useState<number>(1)
    const [name, setName] = useState<string>(`${collection?.name}`)
    const [avatarIndex, setAvatarIndex] = useState<number>(
        collection?.avatarIndex ? bookmarks.length - collection.avatarIndex - 1 : 0)
    const _onGoback = () => {
        if (mode === 1) goBack()
        else setMode(1)
    }
    const _onDone = () => {
        if (collection) {
            const revertedAvatarIndex = bookmarks.length - avatarIndex - 1
            dispatch(UpdateBookmarkCollectionRequest(collectionName, {
                ...collection,
                name,
                avatarIndex: revertedAvatarIndex
            }))
        }
        goBack()
    }
    const _onConfirmDelete = () => {
        dispatch(RemoveBookmarkCollectionRequest(collectionName))
    }

    return (
        <React.Fragment>
            {mode === 3 &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setMode(1)}
                    style={styles.backdrop}>
                    <View style={styles.confirmBox}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600"
                        }}>Delete Collection?</Text>
                        <TouchableOpacity
                            onPress={_onConfirmDelete}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: 'red'
                            }}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setMode(1)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            <SafeAreaView style={styles.container}>
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
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600"
                        }}>{mode === 2 ? 'Change Cover' : 'Edit Collection'}</Text>
                    </View>
                    {mode !== 2 &&
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
                    }
                </View>
                {mode !== 2 &&
                    <React.Fragment>
                        <View style={styles.headerWrapper}>
                            <FastImage
                                source={{
                                    uri: bookmarks[avatarIndex].previewUri
                                }}
                                style={styles.coverImage}
                            />
                            <TouchableOpacity
                                onPress={() => setMode(2)}
                            >
                                <Text style={{
                                    fontSize: 18,
                                    color: "#318bfb",
                                    marginVertical: 10
                                }}>Change Cover</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{
                                margin: 15,
                                fontSize: 16,
                                fontWeight: "600"
                            }}>Name</Text>
                            <TextInput
                                placeholder="Collection Name"
                                value={name}
                                onChangeText={setName}
                                style={styles.nameInput} />
                            <Text style={{
                                margin: 15,
                                fontSize: 16,
                                fontWeight: "600"
                            }}>Manage</Text>
                            <TouchableOpacity
                                onPress={() => setMode(3)}
                            >
                                <Text style={{
                                    margin: 15,
                                    fontSize: 16,
                                    color: 'red',
                                }}>Delete Collection</Text>
                            </TouchableOpacity>
                            <Text style={{
                                margin: 15,
                                fontSize: 13,
                                color: '#666',
                            }}>When you delete this collection, the photos and videos will still be saved</Text>
                        </View>
                    </React.Fragment>
                }
                {mode === 2 &&
                    <FlatList
                        bounces={false}
                        numColumns={3}
                        data={bookmarks}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setAvatarIndex(index)
                                    setMode(1)
                                }}
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
                            </TouchableOpacity>
                        )}
                        keyExtractor={(_, index) => `${index}`}
                    />
                }
            </SafeAreaView>
        </React.Fragment>
    )
}

export default EditSavedCollection
const IMAGE_SIZE = (SCREEN_WIDTH - 6) / 3
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: "100%",
        backgroundColor: '#fff'
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
    headerWrapper: {
        height: 0.25 * SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    coverImage: {
        height: 84,
        width: 84,
        borderRadius: 10
    },
    nameInput: {
        height: 44,
        borderBottomColor: "#ddd",
        borderBottomWidth: 0.5,
        paddingHorizontal: 15,
        fontSize: 16
    },
    backdrop: {
        zIndex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBox: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        backgroundColor: '#fff',
        borderRadius: 10
    },
    btnConfirm: {
        height: 44,
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: '#ddd',
        borderTopWidth: 1
    },
    bookmarkImage: {
        height: IMAGE_SIZE,
        width: IMAGE_SIZE
    }
})
