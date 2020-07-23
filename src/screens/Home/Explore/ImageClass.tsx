import React, { useState, useEffect } from 'react'
import { StyleSheet, FlatList, Text, View, SafeAreaView } from 'react-native'
import { RouteProp } from '@react-navigation/native'
import NavigationBar from '../../../components/NavigationBar'
import { goBack } from '../../../navigations/rootNavigation'
import { RecommendPost } from '../../../components/Recommend/RecommendPostList'
import { firestore } from 'firebase'
import { store } from '../../../store'
import { Post } from '../../../reducers/postReducer'
import RecommendItem from '../../../components/Recommend/RecommendItem'
import { capitalizeFirstLetter } from '../../../utils'

type ImageClassRouteProp = RouteProp<{
    ImageClass: {
        className: string
    }
}, 'ImageClass'>
type ImageClassProps = {
    route: ImageClassRouteProp
}
const ImageClass = ({ route }: ImageClassProps) => {
    const className = `${route?.params.className}`
    const processedClassName = className.toLowerCase()
    const [reloading, setReloading] = useState<boolean>(false)
    const [posts, setPosts] = useState<RecommendPost[]>([])
    const [limit, setLimit] = useState<number>(21)
    useEffect(() => {
        fetchPostsByClassName(processedClassName, limit).then(postList => {
            setPosts(postList)
        })
    }, [limit])
    const fetchPostsByClassName = async (labelName: string, l: number) => {
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
            const post = await postRef
                .where('labels', 'array-contains', labelName)
                .limit(l)
                .get()
            const postList: RecommendPost[] = post.docs.map(x => ({
                ...x.data() as Post,
                className: labelName
            })).filter(x => currentBlockedList.indexOf(`${x.userId}`) < 0
                && blockedMeList.indexOf(`${x.userId}`) < 0
            )
            resolve([...postList])
        })
    }
    const _onRefresh = () => {
        setReloading(true)
        fetchPostsByClassName(processedClassName, limit).then(postList => {
            setPosts(postList)
            setReloading(false)
        })
    }
    const _onScrollToEnd = () => {
        setLimit(limit + 12)
    }
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={capitalizeFirstLetter(className)} callback={goBack} />
            <FlatList style={{
                height: '100%'
            }}
                refreshing={reloading}
                onRefresh={_onRefresh}
                numColumns={3}
                data={posts}
                renderItem={({ item, index }) =>
                    <RecommendItem {...{ item, index }} />
                }
                keyExtractor={(item) => `${item.uid}`}
                onEndReached={_onScrollToEnd}
                onEndReachedThreshold={0.5}
            />
        </SafeAreaView>
    )
}

export default ImageClass

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    }
})
