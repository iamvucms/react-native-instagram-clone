import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native'
import { RouteProp } from '@react-navigation/native'
import { SuperRootStackParamList } from '../../navigations'
import NavigationBar from '../../components/NavigationBar'
import { goBack, navigate } from '../../navigations/rootNavigation'
import { useDispatch } from 'react-redux'
import { uploadSuperImages, Timestamp } from '../../utils'
import { SCREEN_WIDTH } from '../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import FastImage from 'react-native-fast-image'
import { useSelector } from '../../reducers'
import { firestore } from 'firebase'
import { Comment } from '../../reducers/commentReducer'
import { ProfileX } from '../../reducers/profileXReducer'
import { Story, storyPermissions } from '../../reducers/storyReducer'
import { PostStoryRequest } from '../../actions/storyActions'
type PreUploadSuperImageRouteProp = RouteProp<SuperRootStackParamList, 'PreUploadSuperImage'>
type PreUploadSuperImageProps = {
    route: PreUploadSuperImageRouteProp
}

const PreUploadSuperImage = ({ route }: PreUploadSuperImageProps) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.user)
    const myUsername = user?.user?.userInfo?.username || ''
    const closeFriends = user.setting?.privacy?.closeFriends?.closeFriends || []
    const images = route.params?.images || []
    const [searching, setSearching] = useState<boolean>(false)
    const [suggestionList, setSuggestionList] = useState<ProfileX[]>([])

    useEffect(() => {
        fetchSuggestionList()
    }, [])
    const _onShareToStory = async () => {
        const superImagesIdList = await Promise.all(uploadSuperImages(images))
        const storyImages: Story[] = superImagesIdList.map(sourceId => ({
            permission: storyPermissions.ALL,
            create_at: Timestamp(),
            seenList: [],
            source: sourceId,
            userId: myUsername,
            messagesList: [],
            reactions: [],
        }))
        dispatch(PostStoryRequest(storyImages))
    }
    const _handlerGoBack = () => {
        if (searching) setSearching(false)
        else goBack()
    }
    const fetchSuggestionList = async () => {
        const ref = firestore()
        const rq = await ref.collection('posts')
            .where('userId', '==', myUsername)
            .limit(25)
            .get()
        type Suggestion = {
            username: string,
            score: number
        }
        let preList: Suggestion[] = []
        const getSuggestIdTasks: Promise<void>[] = rq.docs.map(async (rs, index) => {
            const likes = (rs.data().likes as string[]) || []
            const comments = (rs.data().commentList as string[]) || []
            likes.concat(comments).map(usr => {
                if (usr !== myUsername) {
                    let i = -1
                    preList.every((x, index2) => {
                        if (x.username === usr) {
                            i = index2
                            return false
                        }
                        return true
                    })
                    if (i > -1) preList[i].score += 1
                    else preList.push({
                        username: usr,
                        score: 1
                    })
                }
            })
            const rq2 = await rs.ref.collection('comments').get()
            rq2.docs.map((rs2) => {
                const comment: Comment = rs2.data() || {}
                if (comment.userId !== myUsername
                ) {
                    let i = -1
                    preList.every((x, index2) => {
                        if (x.username === comment.userId) {
                            i = index2
                            return false
                        }
                        return true
                    })
                    if (i > -1) preList[i].score += 1
                    else preList.push({
                        username: comment.userId || '',
                        score: 1
                    })
                }
            })
        })
        await Promise.all(getSuggestIdTasks)
        preList = preList.sort((a, b) => b.score - a.score)
        const fetchSuggestionInfo: Promise<ProfileX>[] = preList.map(async suggestion => {
            const rq = await ref.collection('users').doc(`${suggestion.username}`).get()
            if (rq.exists) {
                return rq.data() || {}
            } else return {}
        })
        const suggestionData = await Promise.all(fetchSuggestionInfo)
        setSuggestionList([...suggestionData])
    }
    return (
        <SafeAreaView style={styles.container}>
            {!searching ?
                <NavigationBar title="Share" callback={_handlerGoBack} />
                : (
                    <View style={styles.searchBar}>

                    </View>
                )
            }

            <FlatList
                showsVerticalScrollIndicator={false}
                bounces={false}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            onPress={setSearching.bind(null, true)}
                            style={styles.mockSearchBar}>
                            <View style={{
                                height: 36,
                                width: 36,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Icon name="magnify" size={18} color="#666" />
                            </View>
                            <Text style={{
                                color: '#666'
                            }}>Search</Text>
                        </TouchableOpacity>
                        <Text style={{
                            margin: 15,
                            fontWeight: '600',
                            fontSize: 16
                        }}>
                            Stories
                        </Text>
                        <TouchableOpacity style={styles.sendMethodItem}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: "center"
                            }}>
                                <FastImage source={{
                                    uri: user?.user.userInfo?.avatarURL
                                }}
                                    style={styles.avatar}
                                />
                                <Text style={{
                                    marginLeft: 10,
                                    fontWeight: '600',
                                }}>Your Story</Text>
                            </View>
                            <TouchableOpacity
                                onPress={_onShareToStory}
                                style={styles.btnUpload}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#fff'
                                }}>Share</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                        <View style={styles.sendMethodItem}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: "center"
                            }}>
                                <View style={styles.starWrapper}>
                                    <Icon name="star" size={24} color="#fff" />
                                </View>
                                <View style={{
                                    marginLeft: 10,
                                }}>
                                    <Text style={{
                                        fontWeight: '600',
                                    }}>Close Friends</Text>
                                    <TouchableOpacity
                                        onPress={() => navigate('CloseFriends')}
                                    >
                                        <Text style={{
                                            color: '#666'
                                        }}>{closeFriends.length} people</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.btnUpload}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#fff'
                                }}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                data={suggestionList}
                renderItem={({ item, index }) =>
                    <>
                        {index === 0 &&
                            <Text style={{
                                margin: 15,
                                marginTop: 0,
                                fontWeight: '600',
                                fontSize: 16
                            }}>
                                Messages
                            </Text>
                        }
                        <View style={styles.receiverItem}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <FastImage style={styles.avatar}
                                    source={{
                                        uri: item.avatarURL
                                    }}
                                />
                                <View style={{
                                    marginLeft: 10
                                }}>
                                    <Text style={{
                                        fontWeight: '500'
                                    }}>{item.fullname}</Text>
                                    <Text style={{
                                        fontWeight: '600',
                                        color: "#666"
                                    }}>{item.username}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.btnUpload}>
                                <Text style={{
                                    fontWeight: '600',
                                    color: '#fff'
                                }}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                keyExtractor={(item, index) => `${index}`}
            />
        </SafeAreaView>
    )
}

export default PreUploadSuperImage

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: "#fff"
    },
    searchBar: {
        flexDirection: 'row',
    },
    headerContainer: {
        marginVertical: 20
    },
    mockSearchBar: {
        width: SCREEN_WIDTH - 30,
        flexDirection: 'row',
        borderRadius: 5,
        marginHorizontal: 15,
        height: 36,
        borderColor: '#ddd',
        borderWidth: 1,
        alignItems: 'center'
    },
    receiverItem: {
        marginVertical: 5,
        flexDirection: 'row',
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: "space-between"
    },
    sendMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    starWrapper: {
        backgroundColor: '#22bb33',
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
        borderWidth: 0.3,
        borderColor: "#333"
    },
    btnUpload: {
        height: 30,
        paddingHorizontal: 10,
        backgroundColor: '#318bfb',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    }
})
