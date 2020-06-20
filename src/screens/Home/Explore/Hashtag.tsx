import { RouteProp } from '@react-navigation/native'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import NavigationBar from '../../../components/NavigationBar'
import { SCREEN_WIDTH } from '../../../constants'
import { goBack, navigate, push } from '../../../navigations/rootNavigation'
import { Post } from '../../../reducers/postReducer'
import { HashTag } from '../../../reducers/userReducer'
import { store } from '../../../store'
type HashtagRouteProp = RouteProp<{
    Hashtag: {
        hashtag: string
    }
}, 'Hashtag'>

type HashtagProps = {
    route: HashtagRouteProp
}
const Hashtag = ({ route }: HashtagProps) => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const { hashtag } = route.params
    const [hashtagInfo, setHashtagInfo] = useState<HashTag>({})
    const [hashtagPosts, setHashtagPosts] = useState<Post[]>([])
    const _scrollRef = useRef<ScrollView>(null)
    const [currentTab, setCurrentTab] = useState<1 | 2>(1)
    const _activeLineOffsetX = React.useMemo(() => new Animated.Value(0), [])
    useEffect(() => {
        fetchHashtagInfo(hashtag, setHashtagInfo, setHashtagPosts)
    }, [hashtag])
    let postCount: string = ''
    if (hashtagInfo.sources) {
        postCount = hashtagInfo.sources.length < 1000 ? `${hashtagInfo.sources.length}` : (
            hashtagInfo.sources.length < 1000000
                ? Math.round(hashtagInfo.sources.length / 1000) + 'K'
                : Math.round(hashtagInfo.sources.length / 1000000) + 'M'
        )
    }
    const _onViewHashtagProfile = (hashtagName: string) => {
        push('Hashtag', {
            hashtag: hashtagName
        })
    }
    const _onToggleFollow = async () => {
        const ref = firestore()
        const rq = await ref.collection('hashtags').doc(`${hashtag}`).get()
        const data: HashTag = rq.data() || {}
        const currentFollowers = data.followers || []
        const index = currentFollowers.indexOf(myUsername)
        if (index > -1) {
            currentFollowers.splice(index, 1)
        } else currentFollowers.push(myUsername)
        rq.ref.update({
            followers: currentFollowers
        })
        setHashtagInfo({
            ...hashtagInfo,
            followers: currentFollowers
        })
    }
    const _onSwitchTab = (tab: 1 | 2) => {
        if (tab === 1 && currentTab !== 1) {
            _scrollRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: false
            })
            _activeLineOffsetX.setValue(0)
            setCurrentTab(1)
        } else if (tab === 2 && currentTab !== 2) {
            _scrollRef.current?.scrollTo({
                x: SCREEN_WIDTH,
                y: 0,
                animated: false
            })
            _activeLineOffsetX.setValue(SCREEN_WIDTH / 2)
            setCurrentTab(2)
        }

    }
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <NavigationBar title={hashtag}
                    callback={goBack}
                />
                <TouchableOpacity
                    onPress={() => navigate('FeedbackOptions', {
                        hashtag: { ...hashtagInfo }
                    })}
                    style={styles.btnFeedback}>
                    <Icon name="dots-vertical" size={24} />
                </TouchableOpacity>
            </View>
            <View style={styles.headerContainer}>
                <View style={styles.infoWrapper}>
                    <Image
                        style={styles.avatar}
                        source={{
                            uri: hashtagInfo.avatar?.uri
                        }}
                    />
                    <View style={styles.info}>
                        <Text style={{
                            color: "#666"
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: "#000"
                            }}>{postCount} </Text>
                        posts
                        </Text>
                        <View style={styles.btnGroups}>
                            <TouchableOpacity
                                onPress={_onToggleFollow}
                                style={{
                                    ...styles.btnFollow,
                                    backgroundColor: (hashtagInfo.followers || []).indexOf(myUsername) > -1
                                        ? '#fff' : '#318bfb',
                                    borderWidth: (hashtagInfo.followers || []).indexOf(myUsername) > -1
                                        ? 1 : 0
                                }}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: (hashtagInfo.followers || []).indexOf(myUsername) > -1
                                        ? '#000' : '#fff'
                                }}>
                                    {(hashtagInfo.followers || []).indexOf(myUsername) > -1
                                        ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnOption}>
                                <Icon name="chevron-down" size={16} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{
                            marginVertical: 5,
                            color: '#666',
                            fontSize: 12
                        }}>
                            See a few top posts each week
                        </Text>
                    </View>
                </View>
                <FlatList
                    ListHeaderComponent={
                        <View style={styles.relatedItem}>
                            <Text style={{
                                color: '#666'
                            }}>Related:</Text>
                        </View>}
                    style={styles.relatedWrapper}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={hashtagInfo.relatedTags || []}
                    renderItem={({ item, index }) =>
                        <TouchableOpacity
                            onPress={() =>
                                _onViewHashtagProfile(item)
                            }
                            activeOpacity={0.8}
                            style={styles.relatedItem}>
                            <Text style={styles.hashtagTxt}>{item}</Text>
                        </TouchableOpacity>
                    }
                    keyExtractor={(item, index) => `${index}`}
                />
                <View style={styles.hashtagTabWrapper}>
                    <TouchableOpacity
                        onPress={_onSwitchTab.bind(null, 1)}
                        style={styles.hashtagTab}>
                        <Text style={{
                            fontWeight: '500',
                            color: currentTab === 1 ? '#000' : '#666'
                        }}>Top</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={_onSwitchTab.bind(null, 2)}
                        style={styles.hashtagTab}>
                        <Text style={{
                            fontWeight: '500',
                            color: currentTab === 2 ? '#000' : '#666'
                        }}>Recent</Text>
                    </TouchableOpacity>
                    <Animated.View style={{
                        height: 2,
                        width: SCREEN_WIDTH / 2,
                        backgroundColor: "#000",
                        position: 'absolute',
                        bottom: 2,
                        transform: [{
                            translateX: _activeLineOffsetX
                        }],
                        zIndex: 1,
                    }} />
                </View>
                <ScrollView
                    ref={_scrollRef}
                    scrollEnabled={false}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                >
                    <FlatList
                        style={{
                            width: SCREEN_WIDTH,
                            height: "100%"
                        }}
                        data={[...hashtagPosts].sort((a, b) =>
                            -((a.likes || []).length + (a.commentList || []).length)
                            + (b.likes || []).length + (b.commentList || []).length
                        )}
                        renderItem={({ item, index }) =>
                            <PhotoItem {...{ item, index }} key={index} />
                        }
                        numColumns={3}
                        keyExtractor={(item, index) => `${index}`}
                    />
                    <FlatList
                        style={{
                            width: SCREEN_WIDTH,
                            height: "100%"
                        }}
                        data={hashtagPosts}
                        renderItem={({ item, index }) =>
                            <PhotoItem {...{ item, index }} key={index} />
                        }
                        numColumns={3}
                        keyExtractor={(item, index) => `${index}`}
                    />
                </ScrollView>
            </View>
        </SafeAreaView >
    )
}

export default Hashtag

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    headerContainer: {
        paddingVertical: 15
    },
    infoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    avatar: {
        height: 84,
        width: 84,
        borderRadius: 84,
        borderWidth: 0.3,
        borderColor: '#333'
    },
    info: {
        width: SCREEN_WIDTH - 30 - 84,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnFollow: {
        borderColor: '#ddd',
        height: 30,
        width: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: '#318bfb'
    },
    btnOption: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        width: 30,
        borderColor: '#ddd',
        marginLeft: 5,
        borderWidth: 1
    },
    btnGroups: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },
    relatedWrapper: {
        backgroundColor: 'rgb(250,250,250)',
        borderTopColor: '#ddd',
        borderTopWidth: 0.5,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5,
        marginTop: 15
    },
    relatedItem: {
        paddingHorizontal: 10,
        height: 44,
        lineHeight: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    hashtagTxt: {
        color: '#318bfb'
    },
    hashtagTabWrapper: {
        height: 44,
        width: SCREEN_WIDTH,
        flexDirection: 'row'
    },
    hashtagTab: {
        height: '100%',
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    photoItemContainer: {
        width: (SCREEN_WIDTH - 5) / 3,
        height: (SCREEN_WIDTH - 5) / 3,
        marginVertical: 1.25
    },
    multipleIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    btnFeedback: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1
    }
})
interface PhotoItemProps {
    item: Post,
    index: number
}
export const PhotoItem = React.memo(
    ({ item, index }: PhotoItemProps) => {
        return (
            <TouchableOpacity
                onPress={() => navigate('PostDetail', {
                    postId: item.uid
                })}
                style={{
                    ...styles.photoItemContainer,
                    marginHorizontal: (index - 1) % 3 === 0 ? 2.5 : 0
                }}>
                <FastImage
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                    source={{
                        uri: item.source && item.source[0].uri
                    }}
                />
                {(item.source && item.source.length > 1) &&
                    <View style={styles.multipleIcon}>
                        <Icon name="layers-outline" size={30} color="#fff" />
                    </View>
                }
            </TouchableOpacity>
        )
    }
)

async function fetchHashtagInfo(hashtag: string, setHashtagInfo: React.Dispatch<React.SetStateAction<HashTag>>, setHashtagPosts: React.Dispatch<React.SetStateAction<Post[]>>) {

    const ref = firestore();
    const rq = await ref.collection('hashtags').doc(`${hashtag}`).get()
    if (rq.exists) {
        const data: HashTag = rq.data() || {}
        const postIds = data.sources || []
        const lastPostIds = [...postIds].pop()
        if (lastPostIds) {
            const rq2 = await ref.collection('posts').doc(`${lastPostIds}`).get()
            const postData: Post = rq2.data() || {}
            if (postData.source) {
                const firstImage = postData.source[0]
                if (firstImage) {
                    data.avatar = { ...firstImage }
                }
            }
        }
        setHashtagInfo({ ...data })
        postIds.reverse()
        const fetchPostListTasks: Promise<Post>[] = postIds.map(async (postId) => {
            const rq = await ref.collection('posts').doc(`${postId}`).get()
            const postData: Post = rq.data() || {}
            return postData
        })
        Promise.all(fetchPostListTasks).then(postList => {
            setHashtagPosts([...postList])
        })
    }
}