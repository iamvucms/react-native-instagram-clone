import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, FlatList, Image, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants'
import { useKeyboardStatus } from '../../../hooks/useKeyboardStatus'
import { SuperRootStackParamList } from '../../../navigations'
import { goBack } from '../../../navigations/rootNavigation'
import { PrivacySetting, UserInfo } from '../../../reducers/userReducer'
import { store } from '../../../store'
import { ProcessedImage } from './GalleryChooser'
type TagPeopleRouteProp = RouteProp<SuperRootStackParamList, 'TagPeople'>

type TagPeopleNavigationProp = StackNavigationProp<SuperRootStackParamList, 'TagPeople'>

type TagPeopleProps = {
    navigation: TagPeopleNavigationProp,
    route: TagPeopleRouteProp
}
type MixedUserInfo = UserInfo & { privacySetting?: PrivacySetting }
export default function TagPeople({ navigation, route }: TagPeopleProps) {
    const me = store.getState().user.user.userInfo

    const [images, setImages] =
        useState<ProcessedImage[]>([...route.params.images])
    const [tagging, setTagging] = useState<boolean>(false)
    const [query, setQuery] = useState<string>('')
    const [enableGesture, setEnableGesture] = useState<boolean>(true)
    const [searchResult, setSearchResult] = useState<MixedUserInfo[]>([])
    const _scrollRef = useRef<ScrollView>(null)
    const _whoLableOffsetX = React.useMemo(() => new Animated.Value(0), [])
    const _whoLableOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const _whoLableOffsetOpacity = React.useMemo(() => new Animated.Value(0), [])
    const isShowKeyboard = useKeyboardStatus()
    const ref = useRef<{
        timeout: NodeJS.Timeout,
        currentItem: number,
        whoLabel: {
            x: number,
            y: number,
            width: number,
            height: number,
        },
    }>({
        timeout: setTimeout(() => { }, 0),
        currentItem: 0,
        whoLabel: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }
    })
    useEffect(() => {
        if (tagging && isShowKeyboard === false) {
            _onHideKeyboard()
        }
        return () => {
        }
    }, [isShowKeyboard])
    useEffect(() => {
        if (query.length > 0) {
            clearTimeout(ref.current.timeout);
            ref.current.timeout = setTimeout(async () => {
                const rq = await firestore().collection('users')
                    .where('keyword', 'array-contains', query)
                    .get()
                const rq2 = await firestore().collection('users')
                    .doc(`${me?.username}`)
                    .get()
                const myInfo: UserInfo = rq2.data() || {}
                const users: MixedUserInfo[] = []
                rq.docs.map(user => {
                    const data: MixedUserInfo = user.data()
                    const didntTag = images[ref.current.currentItem]
                        .tags.every(tag => tag.username !== data.username)
                    if (data.username !== myInfo.username
                        && didntTag) {
                        const type = (data.privacySetting?.tags?.allowTagFrom as (undefined | 0 | 1 | 2))
                        if (type === 0
                            || ((type === 1 || undefined)
                                && data.followings
                                && data.followings?.indexOf(myInfo.username || '') > -1)
                        ) {
                            users.push(data)
                        }
                    }
                })
                setSearchResult([...users])
            }, 300);
        } else setSearchResult([])
    }, [query])
    const _onHideKeyboard = () => {
        if (searchResult.length === 0) {
            setTagging(false)
            setQuery("")
            setSearchResult([])
            _whoLableOffsetOpacity.setValue(0)
        }
    }
    const _onTag = (x: number, y: number) => {
        if (!tagging) {
            const img = images[ref.current.currentItem]
            const curImageWidth = img.height > img.width ? img.width * SCREEN_WIDTH / img.height : SCREEN_WIDTH
            const curImageHeight = img.height > img.width ? SCREEN_WIDTH : img.height * SCREEN_WIDTH / img.width
            _whoLableOffsetOpacity.setValue(1)

            let nextOffsetX = x - ref.current.whoLabel.width / 2
            if (nextOffsetX < 0)
                nextOffsetX = 0
            else if (nextOffsetX > curImageWidth - ref.current.whoLabel.width)
                nextOffsetX = curImageWidth - ref.current.whoLabel.width
            _whoLableOffsetX.setValue(nextOffsetX)
            ref.current.whoLabel.x = nextOffsetX

            let nextOffsetY = y - ref.current.whoLabel.height / 2
            if (nextOffsetY < 0)
                nextOffsetY = 0
            if (nextOffsetY > curImageHeight - ref.current.whoLabel.height)
                nextOffsetX = curImageHeight - ref.current.whoLabel.height
            _whoLableOffsetY.setValue(nextOffsetY)
            ref.current.whoLabel.y = nextOffsetY
            setTagging(true)
        }
    }
    const _onEndDrag = ({ nativeEvent: { contentOffset: { x } } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.floor(x / SCREEN_WIDTH)
        const offsetRatio = (x - index * SCREEN_WIDTH) / SCREEN_WIDTH
        let nextIndex = 0
        if (offsetRatio > 0.5) {
            nextIndex = index + 1
        } else {
            nextIndex = index
        }
        _scrollRef.current?.scrollTo({
            x: nextIndex * SCREEN_WIDTH,
            y: 0,
            animated: true
        })
        if (ref.current.currentItem !== nextIndex) {
            _whoLableOffsetOpacity.setValue(0)
            setImages([...images])
        }

        ref.current.currentItem = nextIndex

    }
    const _onGoBack = () => {
        setQuery("")
        setSearchResult([])
        setTagging(false)
        _whoLableOffsetOpacity.setValue(0)
    }
    const _onTagUser = (item: UserInfo) => {
        const img = { ...images[ref.current.currentItem] }
        if (!img.tags) img.tags = []
        img.tags.push({
            showBtnDelete: false,
            x: ref.current.whoLabel.x,
            y: ref.current.whoLabel.y,
            username: item.username || '',
            animX: new Animated.Value(ref.current.whoLabel.x),
            animY: new Animated.Value(ref.current.whoLabel.y)
        })
        const temp = [...images]
        temp[ref.current.currentItem] = img
        setImages(temp)
        _whoLableOffsetOpacity.setValue(0)
        setTagging(false)
        setSearchResult([])
        setQuery("")
    }
    const _toggleShowDelBtn = React.useCallback((index: number,
        preX: number,
        preY: number, ) => {
        const imgs = [...images]
        const img = { ...images[ref.current.currentItem] }
        img.tags[index].showBtnDelete = !img.tags[index].showBtnDelete
        imgs[ref.current.currentItem] = img
        setImages(imgs)
    }, [])
    const _onDragLabel = (index: number,
        animX: Animated.Value,
        animY: Animated.Value,
        preX: number,
        preY: number,
        translationX: number,
        translationY: number
    ) => {
        const img = images[ref.current.currentItem]
        const curImageWidth = img.height > img.width ? img.width * SCREEN_WIDTH / img.height : SCREEN_WIDTH
        const curImageHeight = img.height > img.width ? SCREEN_WIDTH : img.height * SCREEN_WIDTH / img.width
        const labelWidth = images[ref.current.currentItem].tags[index].width || 0
        const labelHeight = images[ref.current.currentItem].tags[index].height || 0
        let nextOffsetX = preX + translationX
        let nextOffsetY = preY + translationY
        if (nextOffsetX < 0) nextOffsetX = 0
        if (nextOffsetY < 0) nextOffsetY = 0
        if (nextOffsetX > curImageWidth - labelWidth)
            nextOffsetX = curImageWidth - labelWidth
        if (nextOffsetY > curImageHeight - labelHeight)
            nextOffsetY = curImageHeight - labelHeight
        animX.setValue(nextOffsetX)
        animY.setValue(nextOffsetY)
    }
    const _onEndDragLabel = (index: number,
        preX: number,
        preY: number,
        { nativeEvent: {
            translationX,
            translationY,
            state
        } }: PanGestureHandlerGestureEvent
    ) => {
        if (state === State.END) {
            preX += translationX
            preY += translationY
            const imgs = [...images]
            const img = { ...images[ref.current.currentItem] }
            img.tags[index].x = preX
            img.tags[index].y = preY
            imgs[ref.current.currentItem] = img
            setImages(imgs)
        }
    }
    const _updateLabelSize = (index: number,
        width: number,
        height: number
    ) => {
        const imgs = [...images]
        const img = { ...images[ref.current.currentItem] }
        img.tags[index].width = width
        img.tags[index].height = height
        imgs[ref.current.currentItem] = img
        setImages(imgs)
    }
    const _onDeleteLabel = (index: number) => {
        const imgs = [...images]
        const img = { ...images[ref.current.currentItem] }
        img.tags.splice(index, 1)
        imgs[ref.current.currentItem] = img
        setImages(imgs)
    }
    return (
        <SafeAreaView style={styles.container}>
            {!tagging ? (
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
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500'
                        }}>
                            Tag People
                    </Text>
                    </View>
                    <TouchableOpacity style={styles.btnNavigation}>
                        <Image
                            style={{
                                height: 20,
                                width: 20
                            }}
                            source={require("../../../assets/icons/correct.png")} />
                    </TouchableOpacity>
                </View>
            ) : (
                    <View style={styles.navigationBar}>
                        <TouchableOpacity
                            onPress={_onGoBack}
                            style={styles.btnNavigation}>
                            <Icon name="arrow-left" size={20} />
                        </TouchableOpacity>
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            autoFocus={true}
                            autoCapitalize="none"
                            placeholder="Search for a user"
                            style={styles.inputSearch} />
                        <TouchableOpacity
                            style={styles.btnNavigation}>
                            <Text>✕</Text>
                        </TouchableOpacity>
                        {searchResult.length > 0 &&
                            <View style={styles.searchResultWrapper}>
                                <FlatList data={searchResult}
                                    renderItem={({ item, index }) =>
                                        <UserItem {...{
                                            item,
                                            onTagUser: _onTagUser,
                                            key: index
                                        }} />
                                    }
                                    keyExtractor={(item, index) => `${index}`}
                                />
                            </View>
                        }
                    </View>
                )}
            <ScrollView
                onScrollEndDrag={_onEndDrag}
                scrollEnabled={enableGesture}
                ref={_scrollRef}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
            >
                {images.map((img, index) =>
                    <View style={styles.imageWrapper} key={index}>
                        <TouchableOpacity
                            style={{
                                width: img.height > img.width ? img.width * SCREEN_WIDTH / img.height : SCREEN_WIDTH,
                                height: img.height > img.width ? SCREEN_WIDTH : img.height * SCREEN_WIDTH / img.width
                            }}
                            key={index}
                            activeOpacity={1}
                            onPress={({ nativeEvent: {
                                locationX, locationY
                            } }) => _onTag(locationX, locationY)}
                        >
                            <Animated.View
                                onLayout={({ nativeEvent:
                                    { layout: { width, height } } }: LayoutChangeEvent) => {
                                    ref.current.whoLabel.width = width
                                    ref.current.whoLabel.height = height
                                }} style={{
                                    ...styles.whoLabel,
                                    top: _whoLableOffsetY,
                                    left: _whoLableOffsetX,
                                    opacity: _whoLableOffsetOpacity
                                }}>
                                <TouchableOpacity style={{
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{
                                        color: '#fff',
                                    }}>Who's this?</Text>
                                </TouchableOpacity>
                            </Animated.View>
                            {ref.current.currentItem === index && images[ref.current.currentItem]
                                .tags.map((tag, tagIndex) => (
                                    <Animated.View
                                        onLayout={({
                                            nativeEvent:
                                            { layout: { width, height } }
                                        }: LayoutChangeEvent) =>
                                            _updateLabelSize(tagIndex, width, height)
                                        }
                                        key={tagIndex}
                                        style={{
                                            ...styles.whoLabel,
                                            top: tag.animY,
                                            left: tag.animX,
                                        }}>
                                        {tag.showBtnDelete &&
                                            <TouchableOpacity
                                                onPress={() => {
                                                    _onDeleteLabel(tagIndex)
                                                }}
                                                style={{
                                                    ...styles.btnDelLabel,
                                                    ...(tag.x > (tag.width || 0) / 2 ?
                                                        {
                                                            left: -12
                                                        } : {
                                                            right: -12
                                                        }),
                                                    ...(tag.y > (tag.height || 0) / 2 ?
                                                        {
                                                            top: -12
                                                        } : {
                                                            bottom: -12
                                                        }),

                                                }}>
                                                <Text>✕</Text>
                                            </TouchableOpacity>
                                        }
                                        <TouchableOpacity
                                            onPress={() =>
                                                _toggleShowDelBtn(tagIndex,
                                                    tag.x, tag.y,
                                                )
                                            }
                                        >
                                            <PanGestureHandler
                                                onGestureEvent={({ nativeEvent: { translationX, translationY } }) =>
                                                    _onDragLabel(
                                                        tagIndex,
                                                        tag.animX,
                                                        tag.animY,
                                                        tag.x,
                                                        tag.y,
                                                        translationX,
                                                        translationY
                                                    )}
                                                onHandlerStateChange={
                                                    _onEndDragLabel.bind(null,
                                                        tagIndex,
                                                        tag.x,
                                                        tag.y,
                                                    )}
                                            >
                                                <View style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Text style={{
                                                        color: '#fff',
                                                    }}>@{tag.username}</Text>
                                                </View>
                                            </PanGestureHandler>
                                        </TouchableOpacity>

                                    </Animated.View>
                                ))}

                            <Image
                                style={{
                                    width: img.height > img.width ? img.width * SCREEN_WIDTH / img.height : SCREEN_WIDTH,
                                    height: img.height > img.width ? SCREEN_WIDTH : img.height * SCREEN_WIDTH / img.width
                                }}
                                source={{
                                    uri: img.uri
                                }} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
            <View style={{
                height: 200,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{
                    color: '#999'
                }}>
                    Tap photo to tag people
                </Text>
                <Text style={{
                    color: '#999'
                }}>
                    Drag to move, or tap to delete
                </Text>
            </View>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        zIndex: 9,
        height: 44,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1
    },
    btnNavigation: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageWrapper: {
        height: SCREEN_WIDTH,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center'
    },
    whoLabel: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        zIndex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        top: 20,
        left: 20
    },
    inputSearch: {
        fontSize: 16,
        width: SCREEN_WIDTH - 88,
        height: '100%'
    },
    searchResultWrapper: {
        position: 'absolute',
        zIndex: 1,
        top: 44,
        width: "100%",
        left: 0,
        padding: 15,
        height: SCREEN_HEIGHT,
        backgroundColor: "#fff"
    },
    userItemContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginVertical: 5,
        alignItems: 'center',
    },
    btnDelLabel: {
        height: 24,
        width: 24,
        borderRadius: 24,
        position: 'absolute',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

function UserItem({ item, onTagUser }: { item: UserInfo, onTagUser?: (item: UserInfo) => void }) {
    return (
        <TouchableOpacity
            onPress={() => {
                if (onTagUser) onTagUser(item)
            }}
            style={styles.userItemContainer}>
            <Image style={{
                height: 64,
                width: 64,
                borderRadius: 32,
                borderColor: '#333',
                borderWidth: 0.3,
                marginRight: 10
            }} source={{
                uri: item.avatarURL
            }} />
            <View>
                <Text>{item.username}</Text>
                <Text style={{
                    color: '#666',
                    fontWeight: '500'
                }}>{item.fullname}</Text>
            </View>
        </TouchableOpacity>
    )
}

