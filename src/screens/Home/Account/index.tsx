import React, { useEffect, useState, useRef } from 'react'
import {
    StyleSheet, Text,
    View, SafeAreaView, ScrollView, TouchableOpacity,
    Image,
    RefreshControl,
    Animated,
    NativeSyntheticEvent,
    NativeScrollEvent
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSelector } from '../../../reducers'
import { SCREEN_WIDTH } from '../../../constants'
import { useDispatch } from 'react-redux'
import { FetchExtraInfoRequest } from '../../../actions/userActions'
import { useIsFocused } from '@react-navigation/native'

const index = () => {
    const isFocused = useIsFocused()
    const dispatch = useDispatch()
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const user = useSelector(state => state.user.user)
    const extraInfo = useSelector(state => state.user.extraInfo)
    const photos = useSelector(state => state.user.photos)
    const scrollHRef = useRef<ScrollView>(null)
    const scrollTabRef = useRef<ScrollView>(null)
    const ref = useRef<{
        currentTab: number,
        currentGalleryTab: number,
    }>({
        currentTab: 1,
        currentGalleryTab: 1,
    })
    const _tabLineOffsetX = new Animated.Value(0)
    const recommendTasks = [
        {
            type: 1,
            name: 'Add Bio',
            done: user.userInfo && user.userInfo.bio !== '',
            description: 'Tell your followers a little bit about yourself.',
            icon: 'comment-outline',
            button: 'Add Bio',
            buttonDone: 'Edit Bio'
        },
        {
            type: 2,
            name: 'Add Profile Photo',
            done: user.userInfo && user.userInfo.avatarURL !== '',
            description: 'Choose a profile photo to represent yourself on Instagram.',
            icon: 'account-box-outline',
            button: 'Add Photo',
            buttonDone: 'Edit Photo'

        },
        {
            type: 3,
            name: 'Add Your Name',
            done: user.userInfo && user.userInfo.fullname !== '',
            description: 'Add your full name so your friends know it\'s your. ',
            icon: 'account-details',
            button: 'Add Name',
            buttonDone: 'Edit Name'
        },
        {
            type: 4,
            name: 'Find People To Follow',
            done: user.userInfo?.followings && user.userInfo.followings.length > 0,
            description: 'Follow peple and interests you care about.',
            icon: 'rss',
            button: 'Find People',
            buttonDone: 'Find More'
        }
    ].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0))

    useEffect(() => {
        (async () => {
            setRefreshing(true)
            await dispatch(FetchExtraInfoRequest())
            setRefreshing(false)
        })()
    }, [])
    const _onRefreshing = () => {
        (async () => {
            setRefreshing(true)
            await dispatch(FetchExtraInfoRequest())
            setRefreshing(false)
        })()
    }
    const _onShowOptions = () => {

        if (ref.current.currentTab === 1) {
            scrollHRef.current?.scrollTo({
                x: SCREEN_WIDTH / 2,
                y: 0,
                animated: true
            })
            ref.current.currentTab = 2
        }
    }
    const _onBackToMainScreen = () => {
        if (ref.current.currentTab === 2) {
            scrollHRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: true
            })
            ref.current.currentTab = 1
        }
    }
    const _onToggleGalleryTab = (tab: number) => {
        _onBackToMainScreen()
        if (ref.current.currentGalleryTab === 1 && tab === 2) {
            ref.current.currentGalleryTab = 2
            Animated.timing(_tabLineOffsetX, {
                toValue: SCREEN_WIDTH / 2,
                duration: 200,
                useNativeDriver: false
            }).start()
            scrollTabRef.current?.scrollTo({
                x: SCREEN_WIDTH,
                y: 0,
                animated: true
            })
        } else if (ref.current.currentGalleryTab === 2 && tab === 1) {
            ref.current.currentGalleryTab = 1
            Animated.timing(_tabLineOffsetX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start()
            scrollTabRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: true
            })
        }
    }
    const _onDoTask = (type: number) => {

    }
    const _onScrollEndDragContainerScroll = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (x > SCREEN_WIDTH / 4 && ref.current.currentTab === 1) {
            ref.current.currentTab = 2
            scrollHRef.current?.scrollTo({
                x: SCREEN_WIDTH / 2,
                y: 0,
                animated: true
            })
        } else if (x < SCREEN_WIDTH / 4 && ref.current.currentTab === 2) {
            ref.current.currentTab = 1
            scrollHRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: true
            })
        } else if (x < SCREEN_WIDTH / 4 && ref.current.currentTab === 1) {
            scrollHRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: true
            })
        } else if (x > SCREEN_WIDTH / 4 && ref.current.currentTab === 2) {
            scrollHRef.current?.scrollTo({
                x: SCREEN_WIDTH / 2,
                y: 0,
                animated: true
            })
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                onScrollEndDrag={_onScrollEndDragContainerScroll}
                ref={scrollHRef}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                bounces={false}
            >
                <View
                    style={styles.profileContainer}>
                    <View style={styles.profileHeader}>
                        <TouchableOpacity
                            style={styles.btnSwitchAccount}>
                            <Text style={{
                                fontWeight: '500',
                                fontSize: 18
                            }}>{user?.userInfo?.username}</Text>
                            <Icon name="chevron-down" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onShowOptions}
                            style={styles.btnOptions}>
                            <Icon name="menu" size={24} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        refreshControl={<RefreshControl
                            refreshing={refreshing}
                            onRefresh={_onRefreshing}
                        />}
                        style={{
                            width: '100%'
                        }}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={_onBackToMainScreen}>
                            <View>
                                <View style={styles.infoWrapper}>
                                    <TouchableOpacity style={styles.avatarWrapper}>
                                        <Image style={styles.mainAvatar}
                                            source={{ uri: user?.userInfo?.avatarURL }} />
                                        <View style={styles.plusIcon}>
                                            <Icon name="plus" size={20} color="#fff" />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.extraInfoWrapper}>
                                        <TouchableOpacity style={{
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{
                                                fontSize: 18,
                                                fontWeight: "500"
                                            }}>{extraInfo?.posts}</Text>
                                            <Text>Posts</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{
                                                fontSize: 18,
                                                fontWeight: "500"
                                            }}>{extraInfo?.followers.length}</Text>
                                            <Text>Followers</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{
                                                fontSize: 18,
                                                fontWeight: "500"
                                            }}>{extraInfo?.followings.length}</Text>
                                            <Text>Following</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.bioWrapper}>
                                    <Text style={{
                                        fontWeight: '500',
                                    }}>{user.userInfo?.fullname}</Text>
                                    <Text>{user.userInfo?.bio}</Text>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    style={styles.btnEditProfile}>
                                    <Text style={{
                                        fontWeight: '500'
                                    }}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.galleryContainer}>
                                <View style={styles.galleryTabWrapper}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={_onToggleGalleryTab.bind(null, 1)}
                                        style={styles.galleryTab}>
                                        <Icon name="grid" size={24} color="#333" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={_onToggleGalleryTab.bind(null, 2)}
                                        style={styles.galleryTab}>
                                        <Icon name="tooltip-image-outline" size={24} color="#333" />
                                    </TouchableOpacity>
                                    <Animated.View style={{
                                        ...styles.tabLine,
                                        left: _tabLineOffsetX
                                    }} />
                                </View>
                                <ScrollView
                                    bounces={false}
                                    ref={scrollTabRef}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={styles.imageWrapper}>
                                        {photos && photos.map((photo, index) => (
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={styles.photoWrapper} key={index}>
                                                <Image source={{
                                                    uri: photo.source && photo.source[0]
                                                }} style={styles.photo} />
                                            </TouchableOpacity>
                                        ))}
                                    </TouchableOpacity>
                                    <View style={styles.imageWrapper}>

                                    </View>
                                </ScrollView>
                            </View>
                            <View style={styles.recommend}>
                                <View style={{
                                    marginHorizontal: 15
                                }}>
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: '500'
                                    }}>Complete your profile</Text>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#666'
                                    }}>
                                        <Text style={{
                                            color: 'green'
                                        }}>{recommendTasks.filter(x => x.done)
                                            .length} OF {recommendTasks.length} </Text>
                                        COMPELTE
                                    </Text>
                                </View>
                                <ScrollView
                                    bounces={false}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{
                                            flexDirection: 'row',
                                            margin: 15
                                        }}>
                                        {recommendTasks.map((task, index) => (
                                            <View key={index} style={styles.recommendItem}>
                                                <View style={{
                                                    ...styles.circleIcon,
                                                    borderColor: task.done
                                                        ? '#333' : '#ddd'
                                                }}>
                                                    <Icon color={task.done
                                                        ? '#333' : '#ddd'}
                                                        name={task.icon}
                                                        size={24} />
                                                    <View style={{
                                                        position: 'absolute',
                                                        bottom: -5,
                                                        right: -5
                                                    }}>
                                                        <Image style={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: 24,
                                                            borderWidth: 2,
                                                            borderColor: '#fff'
                                                        }} source={require('../../../assets/icons/done.png')} />
                                                    </View>
                                                </View>
                                                <Text style={{
                                                    margin: 5,
                                                    fontWeight: '600'
                                                }}>{task.name}</Text>
                                                <Text style={{
                                                    fontSize: 12,
                                                    width: '80%',
                                                    textAlign: 'center',
                                                    color: '#666'
                                                }}>
                                                    {task.description}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={_onDoTask.bind(null, task.type)}
                                                    style={{
                                                        ...styles.btnModifyInfo,
                                                        borderColor: '#ddd',
                                                        borderWidth: task.done ? 1 : 0,
                                                        backgroundColor: task.done ? '#fff' : '#318bfb'
                                                    }}>
                                                    <Text style={{
                                                        color: task.done ? '#333' : '#fff',
                                                        fontWeight: '500'
                                                    }}>{!task.done ? task.button : task.buttonDone}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
                <View style={styles.profileOptions}>

                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f7f8fc',
        width: '100%',
        height: '100%'
    },
    profileContainer: {
        width: SCREEN_WIDTH
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 44,
        width: '100%'
    },
    infoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    avatarWrapper: {
        position: 'relative'
    },
    mainAvatar: {
        height: 80,
        width: 80,
        borderRadius: 80
    },
    plusIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 99,
        backgroundColor: '#318bfb',
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: '#fff'
    },
    extraInfoWrapper: {
        flexDirection: 'row',
        width: SCREEN_WIDTH - 30 - 80,
        justifyContent: 'space-evenly'
    },
    bioWrapper: {
        paddingHorizontal: 15,
        marginVertical: 10
    },
    btnEditProfile: {
        marginVertical: 10,
        width: SCREEN_WIDTH - 30,
        marginHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 3,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center'
    },
    galleryContainer: {
        width: '100%'
    },
    galleryTabWrapper: {
        flexDirection: 'row',
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5,
        borderTopColor: '#ddd',
        borderTopWidth: 0.5
    },
    galleryTab: {
        width: SCREEN_WIDTH * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        height: 44
    },
    tabLine: {
        bottom: -1,
        height: 2,
        backgroundColor: '#000',
        position: 'absolute',
        width: SCREEN_WIDTH / 2
    },
    imageWrapper: {
        width: SCREEN_WIDTH,
        backgroundColor: '#fff',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    photoWrapper: {
        position: 'relative',
        width: SCREEN_WIDTH * 0.33,
        height: SCREEN_WIDTH * 0.33
    },
    photo: {
        width: SCREEN_WIDTH * 0.33,
        height: SCREEN_WIDTH * 0.33
    },
    recommend: {
        marginVertical: 20
    },
    recommendItem: {
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        height: SCREEN_WIDTH * 0.6,
        width: SCREEN_WIDTH * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    circleIcon: {
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 99,
        borderColor: '#ddd',
        borderWidth: 1
    },
    btnModifyInfo: {
        marginVertical: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#318bfb',
        borderRadius: 2
    },
    btnSwitchAccount: {
        flexDirection: 'row',
        height: 44,
        paddingHorizontal: 10,
        alignItems: 'center'
    },
    profileOptions: {
        width: SCREEN_WIDTH / 2
    },
    btnOptions: {
        height: 44,
        paddingHorizontal: 10,
        justifyContent: 'center'
    }
})
