import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, ImageBackground, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { FetchExtraInfoRequest } from '../../../actions/userActions'
import AccountGallery from '../../../components/AccountGallery'
import { getTabBarHeight } from '../../../components/BottomTabBar'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../../constants'
import { navigate } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { Post } from '../../../reducers/postReducer'
const index = () => {
    const dispatch = useDispatch()
    const [selectedPhoto, setSelectedPhoto] = useState<Post>({})
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const user = useSelector(state => state.user.user)
    const extraInfo = useSelector(state => state.user.extraInfo)
    const photos = useSelector(state => state.user.photos)
    const scrollHRef = useRef<ScrollView>(null)
    const scrollTabRef = useRef<ScrollView>(null)
    const _headerTabOpacity = React.useMemo(() => new Animated.Value(-1), [])
    const ref = useRef<{
        currentTab: number,
        currentGalleryTab: number,
        headerHeight: number,
        showHeaderTab: boolean,
        prePopupImage: {
            pX: number,
            pY: number,
            w: number,
            h: number
        }
    }>({
        showHeaderTab: false,
        headerHeight: 0,
        currentTab: 1,
        currentGalleryTab: 1,
        prePopupImage: { pX: 0, pY: 0, w: 0, h: 0 }
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
        if (photos) {
            FastImage.preload(photos.map(x => ({ uri: x.source ? x.source[0] : '' })))
        }
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
        } else {
            scrollHRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: true
            })
            ref.current.currentTab = 1
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
    const _onScrollEndDragGalleryTabScroll = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        _onBackToMainScreen()
        if (x > SCREEN_WIDTH / 2 && ref.current.currentGalleryTab === 1) {
            ref.current.currentGalleryTab = 2
            scrollTabRef.current?.scrollTo({
                x: SCREEN_WIDTH,
                y: 0,
                animated: true
            })
            Animated.timing(_tabLineOffsetX, {
                toValue: SCREEN_WIDTH / 2,
                duration: 200,
                useNativeDriver: false
            }).start()
        } else if (x < SCREEN_WIDTH / 2 && ref.current.currentGalleryTab === 2) {
            ref.current.currentGalleryTab = 1
            scrollTabRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: true
            })
            Animated.timing(_tabLineOffsetX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start()
        } else if (x < SCREEN_WIDTH / 2 && ref.current.currentGalleryTab === 1) {
            scrollTabRef.current?.scrollTo({
                x: 0,
                y: 0,
                animated: true
            })
            Animated.timing(_tabLineOffsetX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start()
        } else if (x > SCREEN_WIDTH / 2 && ref.current.currentGalleryTab === 2) {
            scrollTabRef.current?.scrollTo({
                x: SCREEN_WIDTH,
                y: 0,
                animated: true
            })
            Animated.timing(_tabLineOffsetX, {
                toValue: SCREEN_WIDTH / 2,
                duration: 200,
                useNativeDriver: false
            }).start()
        }
    }
    const _showPopupImage = (e: { pX: number, pY: number, w: number, h: number }, photo: Post) => {
        ref.current.prePopupImage = e
        setSelectedPhoto(photo)
    }
    const _hidePopupImage = () => {
        Animated.timing(_popupImageTop, {
            toValue: ref.current.prePopupImage.pY - 44 - 40,
            duration: 150,
            useNativeDriver: false
        }).start()
        Animated.timing(_popupImageLeft, {
            toValue: ref.current.prePopupImage.pX,
            duration: 150,
            useNativeDriver: false
        }).start()
        Animated.timing(_popupImageWidth, {
            toValue: ref.current.prePopupImage.w,
            duration: 150,
            useNativeDriver: false
        }).start()
        Animated.timing(_popupImageHeight, {
            toValue: ref.current.prePopupImage.h,
            duration: 150,
            useNativeDriver: false
        }).start(() => setSelectedPhoto({}))

    }
    const _popupImageTop = new Animated.Value(0)
    const _popupImageLeft = new Animated.Value(0)
    const _popupImageWidth = new Animated.Value(0)
    const _popupImageHeight = new Animated.Value(0)
    const _onAnimatePopup = ({ nativeEvent }: LayoutChangeEvent) => {
        if (selectedPhoto.source) {
            Image.getSize(selectedPhoto.source[0], (xwidth: number, xheight: number) => {
                const nextHeight = xheight * 0.9 * SCREEN_WIDTH / xwidth
                _popupImageTop.setValue(ref.current.prePopupImage.pY - 44)
                _popupImageLeft.setValue(ref.current.prePopupImage.pX)
                _popupImageWidth.setValue(ref.current.prePopupImage.w)
                _popupImageHeight.setValue(ref.current.prePopupImage.h)
                Animated.spring(_popupImageTop, {
                    toValue: (nativeEvent.layout.height - nextHeight) / 2,
                    useNativeDriver: false
                }).start()
                Animated.spring(_popupImageLeft, {
                    toValue: (nativeEvent.layout.width - 0.9 * SCREEN_WIDTH) / 2,
                    useNativeDriver: false
                }).start()
                Animated.spring(_popupImageWidth, {
                    toValue: 0.9 * SCREEN_WIDTH,
                    useNativeDriver: false
                }).start()
                Animated.spring(_popupImageHeight, {
                    toValue: nextHeight,
                    useNativeDriver: false
                }).start()

            }, Function)
        }



    }
    const _onSetHeaderHeight = ({ nativeEvent: { layout: { height } } }: LayoutChangeEvent) => {
        ref.current.headerHeight = height
    }
    const _onVerticalScrollViewScroll = ({ nativeEvent: { contentOffset: { y } } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (y > ref.current.headerHeight) {
            if (!ref.current.showHeaderTab) {
                _headerTabOpacity.setValue(1)
                ref.current.showHeaderTab = true
            }
        } else {
            if (ref.current.showHeaderTab) {
                _headerTabOpacity.setValue(-1)
                ref.current.showHeaderTab = false
            }
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            {selectedPhoto.source && <View
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    left: 0,
                    top: STATUS_BAR_HEIGHT,
                    zIndex: 99
                }}>
                <ImageBackground
                    onLayout={_onAnimatePopup}
                    blurRadius={20} style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                    }} source={{ uri: selectedPhoto.source[0] }} >
                    <Animated.View style={{
                        width: _popupImageWidth,
                        position: 'absolute',
                        top: _popupImageTop,
                        left: _popupImageLeft,
                        borderRadius: 20,
                        overflow: 'hidden'
                    }}>
                        <View style={{
                            backgroundColor: '#fff',
                            height: 40,
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <FastImage
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 30,
                                    marginLeft: 15,
                                    marginRight: 10,
                                }}
                                source={{ uri: user.userInfo?.avatarURL, priority: FastImage.priority.normal }} />
                            <Text style={{ fontWeight: '500' }}>{user.userInfo?.username}</Text>
                        </View>
                        <Animated.View style={{
                            height: _popupImageHeight,
                            width: _popupImageWidth
                        }}>
                            <FastImage style={{
                                width: '100%',
                                height: '100%'
                            }} source={{ uri: selectedPhoto.source[0], priority: FastImage.priority.high }}
                            />
                        </Animated.View>
                    </Animated.View>
                </ImageBackground>
            </View>}
            <ScrollView
                onScrollEndDrag={_onScrollEndDragContainerScroll}
                ref={scrollHRef}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                bounces={false}
            >
                <View
                    style={styles.profileContainer}>
                    <Animated.View style={{
                        ...styles.profileHeader,
                        zIndex: _headerTabOpacity
                    }}>
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
                        <Animated.View style={{
                            ...styles.galleryTabWrapper,
                            position: 'absolute',
                            left: 0,
                            top: '100%',
                            backgroundColor: 'rgb(247,248,252)',
                            opacity: _headerTabOpacity,
                        }}>
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
                        </Animated.View>
                    </Animated.View>
                    <ScrollView
                        onScroll={_onVerticalScrollViewScroll}
                        scrollEventThrottle={20}
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
                            <View onLayout={_onSetHeaderHeight}>
                                <View style={styles.infoWrapper}>
                                    <TouchableOpacity style={styles.avatarWrapper}>
                                        <FastImage style={styles.mainAvatar}
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
                                    onPress={() => navigate('EditProfile')}
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
                                    onScrollEndDrag={_onScrollEndDragGalleryTabScroll}
                                    bounces={false}
                                    ref={scrollTabRef}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <TouchableOpacity
                                        style={{
                                            marginTop: 5,
                                            flexDirection: 'row'
                                        }}
                                        activeOpacity={1}
                                    >
                                        <AccountGallery
                                            photos={photos || []}
                                            hidePopupImage={_hidePopupImage}
                                            showPopupImage={_showPopupImage}
                                        />
                                        <AccountGallery
                                            photos={[]}
                                            hidePopupImage={_hidePopupImage}
                                            showPopupImage={_showPopupImage}
                                        />
                                    </TouchableOpacity>
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
                                                        <FastImage style={{
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
                    <View style={styles.profileOptionsHeader}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500'
                        }}>{user.userInfo?.username}</Text>
                    </View>
                    <View style={styles.optionsWrapper}>
                        <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
                            <Icon name="history" size={30} color="#333" />
                            <Text style={{
                                fontSize: 16,
                                marginLeft: 5,
                            }}>Archive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
                            <Icon name="camera-timer" size={30} color="#333" />
                            <Text style={{
                                fontSize: 16,
                                marginLeft: 5,
                            }}>Your Activity</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
                            <Icon name="qrcode-scan" size={30} color="#333" />
                            <Text style={{
                                fontSize: 16,
                                marginLeft: 5,
                            }}>Nametag</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
                            <Icon name="bookmark-outline" size={30} color="#333" />
                            <Text style={{
                                fontSize: 16,
                                marginLeft: 5,
                            }}>Saved</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigate('CloseFriends')}
                            activeOpacity={0.8} style={styles.optionItem}>
                            <Icon name="playlist-star" size={30} color="#333" />
                            <Text style={{
                                fontSize: 16,
                                marginLeft: 5,
                            }}>Close Friends</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
                            <Icon name="account-plus-outline" size={30} color="#333" />
                            <Text style={{
                                fontSize: 16,
                                marginLeft: 5,
                            }}>Discover People</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onBackToMainScreen}
                            activeOpacity={0.8} style={styles.optionItem}>
                            <Icon name="arrow-left" size={30} color="#333" />
                            <Text style={{
                                fontSize: 16,
                                marginLeft: 5,
                            }}>Back</Text>
                        </TouchableOpacity>

                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            navigate('Setting')
                            setTimeout(() => {
                                _onBackToMainScreen()
                            }, 1000);
                        }}
                        activeOpacity={0.8}
                        style={{
                            ...styles.optionItem,
                            position: 'absolute',
                            left: 0,
                            borderTopColor: '#ddd',
                            borderTopWidth: 0.3,
                            bottom: getTabBarHeight() + STATUS_BAR_HEIGHT
                        }}>
                        <Icon name="cogs" size={30} color="#333" />
                        <Text style={{
                            fontSize: 16,
                            marginLeft: 5,
                        }}>Setting</Text>
                    </TouchableOpacity>
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
        width: SCREEN_WIDTH / 2,
        height: SCREEN_HEIGHT,
        backgroundColor: '#fff',
        borderLeftColor: '#ddd',
        borderLeftWidth: 0.3,
        borderTopColor: '#ddd',
        borderTopWidth: 0.3,
    },
    profileOptionsHeader: {
        height: 44,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.3,
    },
    optionsWrapper: {
        backgroundColor: "#000",
        width: '100%',
    },
    optionItem: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        height: 44,
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    btnOptions: {
        height: 44,
        paddingHorizontal: 10,
        justifyContent: 'center'
    }
})
