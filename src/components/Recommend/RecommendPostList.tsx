import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, StyleProp, ViewProps, ViewStyle, FlatList, Animated } from 'react-native'
import RecommendItem from './RecommendItem'
import { firestore } from 'firebase'
import { store } from '../../store'
import { Post } from '../../reducers/postReducer'
export interface RecommendPostListProps extends ViewProps {
    containerStyle?: StyleProp<ViewStyle>
}
export type RecommendPost = Post & {
    className: string
}
const RecommendPostList = ({ containerStyle, ...rest }: RecommendPostListProps) => {

    const [loading, setLoading] = useState<boolean>(true)
    const [reloading, setReloading] = useState<boolean>(false)
    const [enjoyLabels, setEnjoyLabels] = useState<string[]>([])
    const [diffMonth, setDiffMonth] = useState<number>(6)
    const [reactedPosts, setReactedPosts] = useState<number[]>([])
    const [recommendPosts, setRecommendPosts] = useState<RecommendPost[]>([])
    const [limit, setLimit] = useState<number>(21)
    const _loadingAnim = React.useMemo(() => new Animated.Value(0), [])
    useEffect(() => {
        getRecommendLabels(diffMonth).then(({ labels, reactedPostUids }) => {
            setEnjoyLabels(labels)
            setReactedPosts(reactedPostUids)
        })
    }, [diffMonth])
    const fetchRecommendPosts = () => {
        return new Promise<RecommendPost[]>(async (resolve, reject) => {
            const myUsername = `${store.getState().user.user.userInfo?.username}`
            const currentBlockedList = store.getState().user
                .setting?.privacy?.blockedAccounts?.blockedAccounts || []
            const userRef = firestore().collection('users')
            const blockMe = await userRef
                .where('privacySetting.blockedAccounts.blockedAccounts',
                    'array-contains', myUsername)
                .get()
            const blockedMeList = blockMe.docs.map(x => x.data().username)
            const postRef = firestore().collection('posts')
            const tasks: Promise<RecommendPost[]>[] = enjoyLabels.map(async (label) => {
                const post = await postRef.orderBy('create_at', 'desc').
                    where('labels', 'array-contains', label)
                    .get()
                return post.docs.map(x => ({
                    ...(x.data()),
                    className: label
                }))
            })
            Promise.all(tasks).then(nestedPostList => {
                const collection: RecommendPost[] = []
                nestedPostList.map(posts => posts.map(post => collection.push(post))
                )
                const finalRecomendList = collection
                    .filter(x => currentBlockedList.indexOf(`${x.userId}`) < 0
                        && blockedMeList.indexOf(`${x.userId}`) < 0
                        && x.userId !== myUsername
                    )
                resolve(finalRecomendList)
            })
        })
    }
    useEffect(() => {
        //Fetch recommend posts
        if (enjoyLabels.length > 0) {
            fetchRecommendPosts().then(recommends => {
                setRecommendPosts(recommends)
                setLoading(false)
            })
        }
    }, [enjoyLabels, limit])
    const _onAnimation = () => {
        _loadingAnim.setValue(0)
        Animated.loop(Animated.timing(_loadingAnim, {
            toValue: 1,
            useNativeDriver: true,
            duration: 1000
        }), { iterations: 10 }).start()
    }
    const _onRefresh = async () => {
        setReloading(true)
        const recommends = await fetchRecommendPosts()
        setRecommendPosts([...recommends])
        setReloading(false)
    }
    const _onScrollToEnd = () => {
        setLimit(limit + 12)
    }
    return (
        <View style={[styles.container, containerStyle]}>
            {!loading &&
                <FlatList style={{
                    height: '100%'
                }}
                    refreshing={reloading}
                    onRefresh={_onRefresh}
                    numColumns={3}
                    data={recommendPosts}
                    renderItem={({ item, index }) =>
                        <RecommendItem {...{ item, index, showClassMask: true }} />
                    }
                    keyExtractor={(item) => `${item.uid}`}
                    onEndReached={_onScrollToEnd}
                    onEndReachedThreshold={0.5}
                />
            }
            {loading &&
                <View style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Animated.View onLayout={_onAnimation} style={{
                        ...styles.loadingIcon,
                        transform: [{
                            rotate: _loadingAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                                extrapolate: 'clamp'
                            })
                        }]
                    }} />
                </View>
            }
        </View >
    )
}

export default RecommendPostList

const styles = StyleSheet.create({
    container: {

    },
    loadingIcon: {
        borderRadius: 64,
        height: 64,
        width: 64,
        borderColor: "#000",
        borderWidth: 4,
        borderStyle: 'dashed',
    }
})
export async function getRecommendLabels(diffMonth: number): Promise<{
    reactedPostUids: number[],
    labels: string[]
}> {
    const myUsername = `${store.getState().user.user.userInfo?.username}`
    const currentBlockedList = store.getState().user
        .setting?.privacy?.blockedAccounts?.blockedAccounts || []
    const userRef = firestore().collection('users')
    const blockMe = await userRef
        .where('privacySetting.blockedAccounts.blockedAccounts',
            'array-contains', myUsername)
        .get()
    const blockedMeList = blockMe.docs.map(x => x.data().username)
    const currentTime = new Date().getTime()
    const from = currentTime - 3600 * 1000 * 24 * diffMonth * 30
    const postRef = firestore().collection('posts')
    const posts = await postRef.where('create_at', '>=', new Date(from))
        .where('likes', 'array-contains', myUsername)
        .orderBy('create_at', 'desc').get()
    const reactedPosts = posts.docs.map(x => x.data() as Post)
        .filter(x => currentBlockedList.indexOf(`${x.userId}`) < 0
            && blockedMeList.indexOf(`${x.userId}`) < 0
            && x.userId !== myUsername
        )
    const posts2 = await postRef.where('create_at', '>=', new Date(from))
        .where('commentList', 'array-contains', myUsername)
        .orderBy('create_at', 'desc').get()
    posts2.docs.map(x => x.data() as Post)
        .filter(x => currentBlockedList.indexOf(`${x.userId}`) < 0
            && blockedMeList.indexOf(`${x.userId}`) < 0
            && x.userId !== myUsername
        ).map(post => {
            if (!!!reactedPosts.find(x => x.uid === post.uid)) {
                reactedPosts.push(post)
            }
        })
    const labels: string[] = []
    reactedPosts.map(post => {
        post.labels?.map(label => labels.indexOf(label) < 0 && labels.push(label))
    })
    return {
        reactedPostUids: reactedPosts.map(x => x.uid as number),
        labels
    }
}

