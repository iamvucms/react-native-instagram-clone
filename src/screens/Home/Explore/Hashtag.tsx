import React, { useEffect, useState } from 'react'
import { StyleSheet, Image, FlatList, Text, View, SafeAreaView, TouchableOpacity } from 'react-native'
import NavigationBar from '../../../components/NavigationBar'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { firestore } from 'firebase'
import { goBack, navigate, push } from '../../../navigations/rootNavigation'
import FastImage from 'react-native-fast-image'
import { SCREEN_WIDTH } from '../../../constants'
import { HashTag } from '../../../reducers/userReducer'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Post } from '../../../reducers/postReducer'
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
    useEffect(() => {
        const ref = firestore();
        (async () => {
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
            }
        })()
    }, [hashtag])
    let postCount: string = ''
    if (hashtagInfo.sources) {
        postCount = hashtagInfo.sources.length < 1000 ? `${hashtagInfo.sources.length}` : (
            hashtagInfo.sources.length < 1000000
                ? Math.round(hashtagInfo.sources.length / 1000) + 'K'
                : Math.round(hashtagInfo.sources.length / 1000000) + 'M'
        )
    }
    hashtagInfo.followers = ['vucms']
    const followType = (hashtagInfo.followers || [])
        .indexOf(myUsername) > -1 ? 1 : 2
    const _onViewHashtagProfile = (hashtagName: string) => {
        push('Hashtag', {
            hashtag: hashtagName
        })
    }
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title={hashtag}
                callback={goBack}
            />
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
                            <TouchableOpacity style={{
                                ...styles.btnFollow,
                                backgroundColor: followType === 1 ? '#fff' : '#318bfb',
                                borderWidth: followType === 1 ? 1 : 0
                            }}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: followType === 1 ? '#000' : '#fff'
                                }}>
                                    {followType === 1 ? 'Following' : 'Follow'}
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
        marginVertical: 15
    },
    relatedItem: {
        paddingHorizontal: 10,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    hashtagTxt: {
        color: '#318bfb'
    }
})
