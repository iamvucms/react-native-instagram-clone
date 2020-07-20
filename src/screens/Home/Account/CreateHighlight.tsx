import { firestore } from 'firebase'
import React, { useEffect, useState } from 'react'
import { FlatList, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { getTabBarHeight } from '../../../components/BottomTabBar'
import { MONTH_ALIAS } from '../../../components/DatePicker'
import SuperImage from '../../../components/SuperImage'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../../constants'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { StoryArchive } from '../../../reducers/userReducer'
import { StoryProcessedImage } from '../../Others/StoryProcessor'
import { AddStoryToHighlightRequest } from '../../../actions/userActions'
const LIST_HEIGHT = SCREEN_HEIGHT - 44 - STATUS_BAR_HEIGHT - getTabBarHeight()
const CreateHighlight = () => {
    const dispatch = useDispatch()
    const stories = useSelector(state => state.user.archive?.stories || [])
    /**
     * step
     * 1: choose stories
     * 2: choose name
     */
    const [step, setStep] = useState<number>(1)
    const [imgUris, setImgUris] = useState<string[]>([])
    const [coverIndex, setCoverIndex] = useState<number>(0)
    const [selectedIndexs, setSelectedIndexs] = useState<number[]>([])
    const [name, setName] = useState<string>('')
    //Effect
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
    const _onGoBack = () => {
        if (step > 1) setStep(step - 1)
        else goBack()
    }
    const _onSelectImage = (index: number) => {
        const position = selectedIndexs.indexOf(index)
        const newIndexs = [...selectedIndexs]
        if (position > -1) {
            newIndexs.splice(position, 1)
        } else {
            newIndexs.push(index)
        }
        if (newIndexs.length === 1) setCoverIndex(newIndexs[0])
        setSelectedIndexs(newIndexs)
    }
    const _onSelectCover = (index: number) => {
        setCoverIndex(index)
        setStep(2)
    }
    const _onNext = async () => {
        if (step === 1) setStep(2)
        else {
            const storyList = selectedIndexs.map(idx => stories[idx])
            await dispatch(AddStoryToHighlightRequest(storyList, name, imgUris[coverIndex]))
            navigate('AccountIndex')
        }
    }
    const allowNext = step === 1 && selectedIndexs.length === 0 || step === 2 && name.length === 0
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity
                        style={styles.btnNavigation}
                        onPress={_onGoBack}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '600'
                    }}>{step === 1 ?
                        (selectedIndexs.length === 0 ? 'New Highlight' : `${selectedIndexs.length} selected`)
                        : (step === 2 ? 'Title' : 'Edit Cover')}</Text>
                </View>
                {step !== 3 &&
                    <TouchableOpacity
                        disabled={allowNext}
                        onPress={_onNext}
                        style={{
                            marginHorizontal: 15
                        }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: (allowNext) ? '#666' : "#318bfb"
                        }}>{step === 1 ? 'Next' : 'Done'}</Text>
                    </TouchableOpacity>
                }
            </View>
            <FlatList
                style={{
                    height: LIST_HEIGHT,
                    backgroundColor: "#fff"
                }}
                bounces={false}
                showsVerticalScrollIndicator={false}
                data={stories}
                numColumns={3}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => _onSelectImage(index)}
                    >
                        <StoryArchiveItem {...{ index, item }} />
                        <View style={{
                            position: 'absolute',
                            right: 7.5,
                            bottom: 7.5,
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
            {step === 2 &&
                <KeyboardAvoidingView
                    behavior="height"
                    style={{
                        ...styles.coverWrapper,
                        zIndex: 1,
                        height: LIST_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <TouchableOpacity
                        onPress={() => setStep(3)}
                        activeOpacity={0.8}
                        style={styles.borderCover}>
                        <FastImage
                            source={{
                                uri: imgUris[coverIndex]
                            }}
                            style={styles.coverImage}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setStep(3)}
                        activeOpacity={0.8}
                    >
                        <Text style={{
                            color: '#318bfb',
                            fontSize: 16,
                            fontWeight: '500',
                            marginVertical: 10
                        }}>Edit Cover</Text>
                    </TouchableOpacity>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        autoFocus={true}
                        placeholder="Highlights"
                        style={styles.highlightName} />
                </KeyboardAvoidingView>
            }
            <View
                style={{
                    ...styles.coverWrapper,
                    zIndex: step === 3 ? 2 : -1,
                    height: LIST_HEIGHT,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <FlatList
                    style={{
                        width: '100%',
                        height: LIST_HEIGHT,
                        backgroundColor: "#fff"
                    }}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    data={stories.filter((_, idx) => idx in selectedIndexs)}
                    numColumns={3}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => _onSelectCover(index)}
                        >
                            <StoryArchiveItem {...{ index, item }} />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(_, index) => `${index}`}
                />
            </View>
        </SafeAreaView>
    )
}

export default CreateHighlight
const ITEM_WIDTH = (SCREEN_WIDTH - 4) / 3
const ITEM_HEIGHT = ITEM_WIDTH * 1.8
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    },
    navigationBar: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1
    },
    btnNavigation: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
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
    coverWrapper: {
        position: 'absolute',
        top: STATUS_BAR_HEIGHT + 44,
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
    },
    borderCover: {
        padding: 2,
        borderRadius: 999,
        borderColor: '#999',
        borderWidth: 2
    },
    coverImage: {
        height: 100,
        width: 100,
        borderRadius: 100,
    },
    highlightName: {
        fontSize: 24,
        marginTop: 10
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
            <View style={styles.dateTimeLabel}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "600"
                }}>{date}</Text>
                <Text style={{
                    fontSize: 12
                }}>{MONTH_ALIAS[month]}</Text>
            </View>
        </View>
    )
})
