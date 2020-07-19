import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { FetchArchiveRequest } from '../../../actions/userActions'
import { getTabBarHeight } from '../../../components/BottomTabBar'
import { MONTH_ALIAS } from '../../../components/DatePicker'
import SuperImage from '../../../components/SuperImage'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../../constants'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { PostArchive, StoryArchive } from '../../../reducers/userReducer'
const LIST_HEIGHT = SCREEN_HEIGHT - 44 - STATUS_BAR_HEIGHT - getTabBarHeight()
const Archive = () => {
    const dispatch = useDispatch()
    const stories = useSelector(state => state.user.archive?.stories || [])
    const posts = useSelector(state => state.user.archive?.posts || [])
    /**
     * type 
     * 1: show stories
     * 2: show posts
     */
    const [showType, setShowType] = useState<number>(1)
    const [showOptions, setShowOptions] = useState<boolean>(false)
    const [showTypeOptions, setShowTypeOptions] = useState<boolean>(false)

    //Effect
    useEffect(() => {
        dispatch(FetchArchiveRequest())
    }, [])
    return (
        <SafeAreaView style={styles.container}>
            {showOptions &&
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowOptions(false)}
                    style={styles.backdrop}>
                    <View style={styles.optionsWrapper}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '600',
                            marginBottom: 15
                        }}>More Options</Text>
                        <TouchableOpacity
                            onPress={() => { navigate('CreateHighlight'); setShowOptions(false) }}
                            style={styles.btnOption}>
                            <Text style={{
                                fontSize: 16
                            }}>Create Highlight</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { navigate('StoryPrivacy'); setShowOptions(false) }}
                            style={styles.btnOption}>
                            <Text style={{
                                fontSize: 16
                            }}>Setting</Text>
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
                        onPress={goBack}
                        style={styles.btnNavigation}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowTypeOptions(!showTypeOptions)}
                        style={styles.titleWrapper}>
                        <Text style={styles.title}>
                            {showType === 1 ? 'Stories Archive' : 'Posts Archive'}
                        </Text>
                        <Icon name="chevron-down" size={20} />
                        {showTypeOptions &&
                            <View style={styles.showTypeWrapper}>
                                <TouchableOpacity
                                    onPress={() => { setShowType(1); setShowTypeOptions(false) }}
                                    style={styles.showTypeItem}>
                                    <Text style={styles.title}>
                                        Stories Archive
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { setShowType(2); setShowTypeOptions(false) }}
                                    style={styles.showTypeItem}>
                                    <Text style={styles.title}>
                                        Posts Archive
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => setShowOptions(true)}
                    style={styles.btnNavigation}>
                    <Icon name="dots-vertical" size={24} />
                </TouchableOpacity>
            </View>
            <View>
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
                        <StoryArchiveItem {...{ index, item }} />
                    )}
                    keyExtractor={(_, index) => `${index}`}
                />
            </View>
            <View style={{
                zIndex: showType === 1 ? -1 : 0,
                position: 'absolute',
                width: "100%",
                height: LIST_HEIGHT,
                backgroundColor: '#fff',
                top: STATUS_BAR_HEIGHT + 44,
                left: 0
            }}>
                <FlatList
                    style={{
                        height: LIST_HEIGHT
                    }}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    data={posts}
                    numColumns={3}
                    renderItem={({ item, index }) => (
                        <PostArchiveItem {...{ index, item }} />
                    )}
                    keyExtractor={(_, index) => `${index}`}
                />
            </View>
        </SafeAreaView>
    )
}

export default Archive
const ITEM_WIDTH = (SCREEN_WIDTH - 4) / 3
const ITEM_HEIGHT = ITEM_WIDTH * 1.8
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        zIndex: 1,
        height: 44,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: "#ddd",
        borderBottomWidth: 1
    },
    btnNavigation: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleWrapper: {
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: '600'
    },
    showTypeWrapper: {
        backgroundColor: "#fff",
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        top: '100%',
        left: 0
    },
    showTypeItem: {
        width: '100%',
        height: 40,
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
    backdrop: {
        zIndex: 2,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionsWrapper: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        backgroundColor: '#fff',
        borderRadius: 5
    },
    btnOption: {
        borderTopColor: "#ddd",
        borderTopWidth: 0.5,
        height: 44,
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',

    },
})
interface StoryArchiveItemProps {
    item: StoryArchive,
    index: number
}
const StoryArchiveItem = React.memo(({ item, index }: StoryArchiveItemProps) => {
    const month = new Date(item.create_at).getMonth()
    const date = new Date(item.create_at).getDate()
    return (
        <TouchableOpacity
            activeOpacity={0.8}
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
        </TouchableOpacity>
    )
})
interface PostArchiveItemProps {
    item: PostArchive,
    index: number
}
const PostArchiveItem = React.memo(({ item, index }: PostArchiveItemProps) => {
    const month = new Date(item.create_at).getMonth()
    const date = new Date(item.create_at).getDate()
    return (
        <TouchableOpacity
            onPress={() =>
                navigate('PostDetail', {
                    postId: item.uid
                })
            }
            activeOpacity={0.8}
            style={{
                width: ITEM_WIDTH,
                height: ITEM_WIDTH,
                marginHorizontal: (index - 1) % 3 === 0 ? 2 : 0,
                marginBottom: 2
            }}>
            <FastImage
                source={{
                    uri: item.previewUri
                }}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />
            {!!item.multiple &&
                <View style={{
                    position: 'absolute',
                    top: 10,
                    right: 10
                }}>
                    <Icon name="layers" size={24} color="#fff" />
                </View>
            }
        </TouchableOpacity>
    )
})