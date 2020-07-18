import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, ImageBackground, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { FetchProfileXRequest, ResetProfileXRequest } from '../../../actions/profileXActions'
import AccountGallery from '../../../components/AccountGallery'
import { SCREEN_HEIGHT, SCREEN_WIDTH, STATUS_BAR_HEIGHT } from '../../../constants'
import { goBack, navigate, push } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
import { Post } from '../../../reducers/postReducer'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import NavigationBar from '../../../components/NavigationBar'
import { ToggleFollowUserRequest, ToggleSendFollowRequest } from '../../../actions/userActions'
type Params = {
    ProfileX: {
        username: string
    }
}
type ProfileXRouteProp = RouteProp<Params, 'ProfileX'>
type ProfileXProps = {
    route: ProfileXRouteProp
}
const ProfileX = ({ route }: ProfileXProps) => {
    const userXname = route.params.username
    const me = useSelector(state => state.user.user.userInfo)
    const dispatch = useDispatch()
    const userX = useSelector(state => state.profileX)
    const { isBlock } = userX
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [selectedPhoto, setSelectedPhoto] = useState<Post>({})
    const scrollVRef = useRef<ScrollView>(null)
    const scrollTabRef = useRef<ScrollView>(null)
    const _headerTabOpacity = React.useMemo(() => new Animated.Value(-1), [])
    const [followType, setFollowType] = useState<number>(2)
    const ref = useRef<{
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
        currentGalleryTab: 1,
        prePopupImage: { pX: 0, pY: 0, w: 0, h: 0 }
    })
    const _tabLineOffsetX = React.useMemo(() => new Animated.Value(0), [])
    const _onRefreshing = () => {
        (async () => {
            setRefreshing(true)
            await dispatch(FetchProfileXRequest(userXname))
            setRefreshing(false)
        })()
    }
    useEffect(() => {
        const type = (userX.requestedList && userX.requestedList.indexOf(me?.username || '') > -1)
            ? 3 : (
                (me?.followings && me.followings.indexOf(userXname) > -1) ? 1 : 2
            )
        setFollowType(type)
    }, [userX])
    useEffect(() => {
        if (me?.username === userXname) {
            return navigate('AccountIndex')
        }
        dispatch(FetchProfileXRequest(userXname))
        return () => {
            dispatch(ResetProfileXRequest())
        }
    }, [userXname])
    const _scrollToPosts = () => {
        scrollVRef.current?.scrollTo({
            x: 0,
            y: ref.current.headerHeight,
            animated: true
        })
    }
    const _onShowOptions = () => {
        navigate('ProfileOptions', {
            userX: { ...userX }
        })
    }

    const _onToggleGalleryTab = (tab: number) => {
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
    const _onScrollEndDragGalleryTabScroll = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
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
            Image.getSize(selectedPhoto.source[0].uri, (xwidth: number, xheight: number) => {
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
    if (isBlock) {
        return (
            <SafeAreaView style={{
                ...styles.container,
                backgroundColor: "#fff"
            }}>
                <NavigationBar title="Not Found" callback={goBack} />
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: SCREEN_HEIGHT - getStatusBarHeight() - 44 - STATUS_BAR_HEIGHT
                }}>
                    <Image style={{
                        height: 80,
                        width: 80
                    }} source={require('../../../assets/icons/error.png')} />
                    <Text style={{
                        marginVertical: 10,
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '600'
                    }}>Not Found</Text>
                    <Text style={{
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        This screen could not be found. Try again!
                    </Text>
                </View>
            </SafeAreaView>
        )
    }
    const _onToggleFollow = () => {
        const privateAccount = userX.privacySetting?.accountPrivacy?.private
        if (followType === 1) {
            // dispatch(ToggleFollowUserRequest(userXname))
            // setFollowType(2)
            navigate('ProfileInteractionOptions', {
                userX,
                followType,
                setFollowType
            })
        } else if (followType === 2) {
            if (privateAccount) {
                dispatch(ToggleSendFollowRequest(userXname))
                setFollowType(3)
            } else {
                dispatch(ToggleFollowUserRequest(userXname))
                setFollowType(1)
            }
        } else {
            navigate('ProfileInteractionOptions', {
                userX,
                followType,
                setFollowType
            })
        }
    }
    const _onShowSuggestion = () => {
        //wait for post's label
    }
    const _onViewFollow = () => {

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
                    }} source={{ uri: selectedPhoto.source[0].uri, }} >
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
                                source={{ uri: userX.avatarURL, priority: FastImage.priority.normal }} />
                            <Text style={{ fontWeight: '500' }}>{userX.username}</Text>
                        </View>
                        <Animated.View style={{
                            height: _popupImageHeight,
                            width: _popupImageWidth
                        }}>
                            <FastImage style={{
                                width: '100%',
                                height: '100%'
                            }} source={{ uri: selectedPhoto.source[0].uri, priority: FastImage.priority.high }}
                            />
                        </Animated.View>
                    </Animated.View>
                </ImageBackground>
            </View>}
            <View
                style={styles.profileContainer}>
                <Animated.View style={{
                    ...styles.profileHeader,
                    zIndex: _headerTabOpacity
                }}>
                    <View
                        style={styles.btnSwitchAccount}>
                        <TouchableOpacity
                            onPress={goBack}
                            style={styles.centerBtn}>
                            <Icon name="arrow-left" size={20} />
                        </TouchableOpacity>
                        <Text style={{
                            fontWeight: '500',
                            fontSize: 16
                        }}>{userX.username}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={_onShowOptions}
                        style={styles.btnOptions}>
                        <Icon name="dots-vertical" size={24} />
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
                    ref={scrollVRef}
                    onScroll={_onVerticalScrollViewScroll}
                    scrollEventThrottle={20}
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={_onRefreshing}
                    />}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}>
                    <TouchableOpacity
                        activeOpacity={1}>
                        <View onLayout={_onSetHeaderHeight}>
                            <View style={styles.infoWrapper}>
                                <TouchableOpacity style={styles.avatarWrapper}>
                                    <FastImage style={styles.mainAvatar}
                                        source={{ uri: userX.avatarURL }} />
                                </TouchableOpacity>
                                <View style={styles.extraInfoWrapper}>
                                    <TouchableOpacity
                                        onPress={_scrollToPosts}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: "500"
                                        }}>{userX.posts?.length || 0}</Text>
                                        <Text>Posts</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            push('ProfileXFollow', { userX, type: 1 })
                                        }}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: "500"
                                        }}>{userX.followers?.length}</Text>
                                        <Text>Followers</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            push('ProfileXFollow', { userX, type: 2 })
                                        }}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: "500"
                                        }}>{userX.followings?.length}</Text>
                                        <Text>Following</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.bioWrapper}>
                                <Text style={{
                                    fontWeight: '500',
                                }}>{userX.fullname}</Text>
                                <Text>{userX.bio}</Text>
                            </View>
                            <View style={styles.actionsWrapper}>
                                <TouchableOpacity
                                    onPress={_onToggleFollow}
                                    style={{
                                        ...styles.btnAction,
                                        backgroundColor: (followType === 1 || followType === 3) ? '#fff' : '#318bfb',
                                        borderWidth: (followType === 1 || followType === 3) ? 1 : 0
                                    }}>
                                    <Text style={{
                                        color: (followType === 1 || followType === 3) ? '#000' : '#fff',
                                        fontWeight: '600'
                                    }}>{followType === 1 ? 'Following' : (
                                        followType === 2 ? 'Follow' : 'Requested'
                                    )
                                        }</Text>
                                    {(followType === 1 || followType === 3) &&
                                        <Icon name="chevron-down" size={20} style={{
                                            marginLeft: 5
                                        }} />
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    ...styles.btnAction,
                                    borderWidth: 1,
                                }}>
                                    <Text style={{
                                        fontWeight: '600'
                                    }}>Message</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={_onShowSuggestion}
                                    style={{
                                        ...styles.btnAction,
                                        borderWidth: 1,
                                        width: 30
                                    }}>
                                    <Icon name="chevron-down" size={20} />
                                </TouchableOpacity>
                            </View>
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
                                        photos={userX.posts || []}
                                        hidePopupImage={_hidePopupImage}
                                        showPopupImage={_showPopupImage}
                                    />
                                    <AccountGallery
                                        photos={userX.tagPhotos || []}
                                        hidePopupImage={_hidePopupImage}
                                        showPopupImage={_showPopupImage}
                                    />
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView >)
}

export default ProfileX

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(250,250,250)',
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
    centerBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
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
    },
    actionsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingHorizontal: 15,
        marginVertical: 5
    },
    btnAction: {
        flexDirection: 'row',
        height: 30,
        width: (SCREEN_WIDTH - 30 - 30 - 10) / 2,
        borderColor: '#ddd',
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    }
})
