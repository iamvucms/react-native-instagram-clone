import React, { useState } from 'react'
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, KeyboardAvoidingView, TextInput, Keyboard } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { goBack, navigate } from '../../../../../navigations/rootNavigation'
import { useSelector } from '../../../../../reducers'
import FastImage from 'react-native-fast-image'
import { getTabBarHeight } from '../../../../../components/BottomTabBar'
import { BookmarkCollection } from '../../../../../reducers/userReducer'
import { useDispatch } from 'react-redux'
import { CreateBookmarkCollectionRequest } from '../../../../../actions/userActions'
import { getStatusBarHeight } from 'react-native-status-bar-height'
const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const STATUS_BAR_HEIGHT = getStatusBarHeight()
const AddSavedCollection = () => {
    const dispatch = useDispatch()
    //Get bookmarks
    const collection = useSelector(state => state.user
        .bookmarks?.find(x => x.name === `All Posts`))
    const bookmarks = [...(collection?.bookmarks || [])]
    bookmarks.reverse()
    //End get bookmarks
    const [avatarIndex, setAvatarIndex] = useState<number>(0)
    const [collectionName, setCollectionName] = useState<string>('')
    const [step, setStep] = useState<number>(1)
    const [selectedIndexs, setSelectedIndexs] = useState<number[]>([])


    const _onGoBack = () => {
        if (step === 1) goBack()
        else setStep(step - 1)
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
    const _onDone = () => {
        if (step === 1) {
            setAvatarIndex(0)
            setStep(2)
        } else {
            const collection: BookmarkCollection = {
                avatarIndex,
                bookmarks: selectedIndexs.map(i => ({ ...bookmarks[i] })),
                create_at: new Date().getTime(),
                name: collectionName
            }
            dispatch(CreateBookmarkCollectionRequest({ ...collection }))
            goBack()
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        onPress={_onGoBack}
                        style={styles.btnNavigation}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    {step === 1 ? (
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
                    ) : (
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600'
                            }}>Create Collection</Text>
                        )}
                </View>
                {step !== 3 &&
                    <TouchableOpacity
                        disabled={step === 2 && collectionName.length === 0 || step === 1 && selectedIndexs.length === 0}
                        onPress={_onDone}
                        style={{
                            ...styles.btnNavigation,
                            width: 70,
                        }}>
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: 16,
                            color: '#318bfb',
                            opacity: (step === 2 && collectionName.length === 0 || step === 1 && selectedIndexs.length === 0) ? 0.5 : 1
                        }}>{step === 1 ? 'Next' : 'Add'}</Text>
                    </TouchableOpacity>
                }
            </View>
            {step === 1 && (
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
            )}
            {step === 2 && (
                <KeyboardAvoidingView
                    behavior="height"
                    style={styles.collectionInfoWrapper}>
                    <FastImage source={{
                        uri: bookmarks[selectedIndexs[avatarIndex]].previewUri
                    }}
                        style={styles.collectionAvatar}
                    />
                    <TouchableOpacity
                        onPress={() => setStep(3)}
                    >
                        <Text style={{
                            fontSize: 18,
                            color: "#318bfb",
                            marginVertical: 10
                        }}>
                            <Text>Change Cover</Text>
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        value={collectionName}
                        onChangeText={setCollectionName}
                        placeholder="Collection Name"
                        style={styles.collectionNameInput} />
                </KeyboardAvoidingView>
            )}
            {step === 3 && (
                <FlatList
                    bounces={false}
                    numColumns={3}
                    data={selectedIndexs.map(i => ({ ...bookmarks[i] }))}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => {
                                setAvatarIndex(index)
                                setStep(2)
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
            )}
        </SafeAreaView>
    )
}

export default AddSavedCollection
const IMAGE_SIZE = (SCREEN_WIDTH - 6) / 3
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        width: '100%',
        height: SCREEN_HEIGHT
    },
    collectionInfoWrapper: {
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - getTabBarHeight() - 44,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    collectionAvatar: {
        borderRadius: 10,
        backgroundColor: '#fff',
        height: SCREEN_WIDTH / 3,
        width: SCREEN_WIDTH / 3,
    },
    collectionNameInput: {
        height: 44,
        marginVertical: 15,
        fontSize: 18,
        minWidth: 120,
        textAlign: 'center'
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
