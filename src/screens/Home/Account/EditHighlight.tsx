import { RouteProp } from '@react-navigation/native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../constants'
import { useDispatch } from 'react-redux'
import SuperImage from '../../../components/SuperImage'
import { MONTH_ALIAS } from '../../../components/DatePicker'
import { StoryArchive } from '../../../reducers/userReducer'
import { RemoveHighlightRequest, EditHighlightRequest } from '../../../actions/userActions'
import { firestore } from 'firebase'
import { StoryProcessedImage } from '../../Others/StoryProcessor'
type EditHighlightRouteProp = RouteProp<SuperRootStackParamList, 'EditHighlight'>
type EditHighlightProps = {
    route: EditHighlightRouteProp
}
const EditHighlight = ({ route }: EditHighlightProps) => {
    const dispatch = useDispatch()
    const highlightName = `${route.params.name}`
    const highlight = useSelector(state => state.user
        .highlights?.find(x => x.name === highlightName))
    const highlightStories = highlight?.stories || []
    const stories = useSelector(state => state.user.archive?.stories || [])
    const selectedStories = React.useMemo(() => [...highlightStories], [])
    const [coverUri, setCoverUri] = useState<string>(`${highlight?.avatarUri}`)
    const [imgUris, setImgUris] = useState<string[]>([])
    const [selectedIndexs, setSelectedIndexs] = useState<number[]>(
        [...highlightStories].map(x => stories.findIndex(y => x.uid === y.uid))
    )
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
    const [name, setName] = useState<string>(highlight?.name || '')
    /**
     * mode
     * 1: UNSELECT
     * 2: ADD
     */
    const [mode, setMode] = useState<number>(1)
    const [showCovers, setShowCovers] = useState<boolean>(false)
    const _scrollRef = useRef<ScrollView>(null)

    useEffect(() => {
        const to = setTimeout(async () => {
            const ref = firestore()
            const superIds = stories.map(x => x.superId)
            const fetchTasks: Promise<StoryProcessedImage>[] = superIds
                .map(async superId => {
                    const rq = await ref.collection('superimages')
                        .doc(`${superId}`)
                        .get()
                    return rq.data() as StoryProcessedImage
                })
            Promise.all(fetchTasks).then(superImage => {
                const uris = superImage.map(x => x.uri)
                setImgUris([...uris])
            })
        }, 300);
        return () => clearTimeout(to)
    }, [stories])
    useEffect(() => {
        selectedIndexs.map(idx => {
            if (!!!selectedStories.find(x => x.uid === stories[idx].uid)) {
                selectedStories.push(stories[idx])
            }
        })
    }, [selectedIndexs])
    const _onChangeMode = (type: number) => {
        if (mode !== type) setMode(type)
        _scrollRef.current?.scrollTo({
            animated: true,
            y: 0,
            x: (type - 1) * SCREEN_WIDTH
        })
    }
    const _onScrollEnd = ({ nativeEvent: {
        contentOffset: {
            x
        }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (x >= SCREEN_WIDTH) {
            if (mode !== 2) setMode(2)
        } else {
            if (mode !== 1) setMode(1)
        }
    }
    const _onGoBack = () => {
        if (showCovers) setShowCovers(false)
        else goBack()
    }
    const _onSelectImage = (story: StoryArchive) => {
        const rootIndex = stories.findIndex(x => x.uid === story.uid)
        const selectedIdxs = [...selectedIndexs]
        const position = selectedIdxs.indexOf(rootIndex)
        if (position > -1) {
            selectedIdxs.splice(position, 1)
        } else {
            selectedIdxs.push(rootIndex)
        }
        setSelectedIndexs(selectedIdxs)
    }
    const _onSelectImage2 = (index: number) => {
        const selectedIdxs = [...selectedIndexs]
        const position = selectedIdxs.indexOf(index)
        if (position > -1) {
            selectedIdxs.splice(position, 1)
        } else {
            selectedIdxs.push(index)
        }
        setSelectedIndexs(selectedIdxs)
    }
    const _onDone = () => {
        if (selectedIndexs.length === 0) setShowConfirmDelete(true)
        else {
            if (highlight) {
                dispatch(EditHighlightRequest({
                    name,
                    stories: selectedIndexs.map(idx => stories[idx]),
                    avatarUri: coverUri
                }, highlight.name))
            }
            navigate('AccountIndex')
        }
    }
    const _onSelectCover = (item: StoryArchive) => {
        const rootIndex = stories.findIndex(x => x.uid === item.uid)
        setCoverUri(imgUris[rootIndex])
        setShowCovers(false)
    }
    const _onConfirmDelete = () => {
        navigate('AccountIndex')
        dispatch(RemoveHighlightRequest(`${highlight?.name}`))
    }

    if (!!!highlight) return null
    return (
        <React.Fragment>
            {showConfirmDelete &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                        setShowConfirmDelete(false)
                    }}
                    style={styles.backdrop}>
                    <View style={styles.confirmBox}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600",
                            marginBottom: 15
                        }}>Do you want delete Highlight?</Text>
                        <TouchableOpacity
                            onPress={_onConfirmDelete}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: 'red'
                            }}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowConfirmDelete(false)
                            }}
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
                            onPress={_onGoBack}
                            style={styles.btnNavigation}>
                            <Icon name="arrow-left" size={20} />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600'
                        }}>Edit {showCovers ? 'Cover' : 'Highlight'}</Text>
                    </View>
                    {!showCovers &&
                        <TouchableOpacity
                            onPress={_onDone}
                            style={{
                                ...styles.btnNavigation,
                                width: 70
                            }}>
                            <Text style={{
                                color: "#318bfb",
                                fontSize: 16,
                                fontWeight: '500'
                            }}>Done</Text>
                        </TouchableOpacity>
                    }
                </View>
                <View style={{
                    ...styles.coverListWrapper,
                    zIndex: showCovers ? 1111 : -111
                }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        numColumns={3}
                        data={selectedIndexs.map(idx => stories[idx])}
                        style={styles.galleryWrapper}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => _onSelectCover(item)}
                                activeOpacity={0.8}
                            >
                                <StoryArchiveItem {...{ item, index }} />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => `${item.uid}`}
                    />
                </View>
                <View style={styles.coverWrapper}>
                    <TouchableOpacity
                        onPress={() => setShowCovers(true)}
                        activeOpacity={0.8}
                        style={styles.coverBorder}>
                        <FastImage source={{
                            uri: coverUri
                        }}
                            style={styles.cover}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowCovers(true)}
                        activeOpacity={0.8}
                        style={{
                            marginVertical: 5
                        }}>
                        <Text style={{
                            color: '#318bfb',
                        }}>Edit Cover</Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    paddingBottom: 15,
                    backgroundColor: '#fff'
                }}>
                    <Text style={{
                        margin: 15,
                        fontSize: 16,
                        marginBottom: 0,
                        color: "#999"
                    }}>Title</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={styles.nameInput}
                        placeholder="Highlight"
                    />
                </View>
                <View style={{
                    backgroundColor: '#fff'
                }}>
                    <View style={styles.navigationOptions}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => _onChangeMode(1)}
                            style={styles.optionItem}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '500',
                                color: mode === 2 ? '#999' : '#000'
                            }}>SELECTED</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => _onChangeMode(2)}
                            style={styles.optionItem}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '500',
                                color: mode === 1 ? '#999' : '#000'
                            }}>ADD</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        ref={_scrollRef}
                        decelerationRate={0.99}
                        onMomentumScrollEnd={_onScrollEnd}
                        snapToInterval={SCREEN_WIDTH}
                        horizontal
                        bounces={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            numColumns={3}
                            data={selectedStories}
                            style={styles.galleryWrapper}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    onPress={() => _onSelectImage(item)}
                                    activeOpacity={0.8}
                                >
                                    <StoryArchiveItem {...{ item, index }} />
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
                                        backgroundColor: selectedIndexs.indexOf(stories.findIndex(x => x.uid === item.uid)) > -1
                                            ? '#318bfb' : 'rgba(0,0,0,0.3)'
                                    }}>
                                        {selectedIndexs.indexOf(stories.findIndex(x => x.uid === item.uid)) > -1 &&
                                            <Text style={{
                                                color: '#fff'
                                            }}>
                                                {selectedIndexs.indexOf(stories.findIndex(x => x.uid === item.uid)) + 1}
                                            </Text>
                                        }
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => `${item.uid}`}
                        />
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            numColumns={3}
                            data={stories}
                            style={styles.galleryWrapper}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    onPress={() => _onSelectImage2(index)}
                                    activeOpacity={0.8}
                                >
                                    <StoryArchiveItem {...{ item, index }} />
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
                    </ScrollView>
                </View>
            </SafeAreaView>
        </React.Fragment>
    )
}

export default EditHighlight
const ITEM_WIDTH = (SCREEN_WIDTH - 4) / 3
const ITEM_HEIGHT = ITEM_WIDTH * 1.8
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        flexDirection: 'row',
        height: 44,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: "#ddd",
        borderBottomWidth: 1
    },
    coverWrapper: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    coverBorder: {
        padding: 2,
        borderColor: '#999',
        borderWidth: 2,
        borderRadius: 999
    },
    cover: {
        height: 80,
        width: 80,
        borderRadius: 80,

    },
    nameInput: {
        height: 30,
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        borderBottomColor: "#318bfb",
        borderBottomWidth: 0.5
    },
    btnNavigation: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    navigationOptions: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee'
    },
    optionItem: {
        height: '100%',
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    galleryWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - (200 + STATUS_BAR_HEIGHT + 44 + 44 + 100)
    },
    storyArchiveItem: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        marginBottom: 2
    },
    dateTimeLabel: {
        height: 44,
        width: 44,
        borderRadius: 5,
        backgroundColor: '#fff',
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    backdrop: {
        height: '100%',
        width: '100%',
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
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
    coverListWrapper: {
        position: 'absolute',
        zIndex: 11111,
        top: STATUS_BAR_HEIGHT + 44,
        left: 0,
        width: '100%',
        height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
        backgroundColor: '#fff'
    }
})
interface StoryArchiveItemProps {
    item: StoryArchive,
    index: number
}
const StoryArchiveItem = React.memo(({ item, index }: StoryArchiveItemProps) => {
    const month = new Date(item.create_at).getMonth()
    const date = new Date(item.create_at).getDate()
    return (
        <View
            style={{
                ...styles.storyArchiveItem,
                marginHorizontal: (index - 1) % 3 === 0 ? 2 : 0
            }}>
            <SuperImage
                showOnlyImage={true}
                disableNavigation={true}
                disablePress={true}
                fitSize={true}
                superId={item.superId}
            />
        </View>
    )
})
