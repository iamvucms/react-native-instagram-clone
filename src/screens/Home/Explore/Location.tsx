import { RouteProp, Link } from '@react-navigation/native'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Linking, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import NavigationBar from '../../../components/NavigationBar'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../constants'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { Post } from '../../../reducers/postReducer'
import { store } from '../../../store'
import { MapBoxAddress, searchLocation } from '../../../utils'
import { PhotoItem } from './Hashtag'
import MapView from 'react-native-maps';
import { getTabBarHeight } from '../../../components/BottomTabBar'
type LocationRouteProp = RouteProp<{
    Location: {
        address: MapBoxAddress
    }
}, 'Location'>

type LocationProps = {
    route: LocationRouteProp
}
const Location = ({ route }: LocationProps) => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const { address } = route.params
    const [showFullMapConfirm, setShowFullMapConfirm] = useState<boolean>(false)
    const [addressInfo, setLocationInfo] = useState<MapBoxAddress>({ ...address })
    const [addressPosts, setLocationPosts] = useState<Post[]>([])
    const _scrollRef = useRef<ScrollView>(null)
    const [currentTab, setCurrentTab] = useState<1 | 2>(1)
    const [headerHeight, setHeaderHeight] = useState<number>(500)
    const _activeLineOffsetX = React.useMemo(() => new Animated.Value(0), [])

    useEffect(() => {
        (async () => {
            const ref = firestore()
            const rq = await ref.collection('posts')
                .where('address.id', '==', address.id).get()
            const postList: Post[] = rq.docs.map(x => x.data() || {})
            postList.reverse()
            const addressExtraInfo = await searchLocation(`${address.id}`)
            setLocationInfo({
                ...(addressExtraInfo.length > 0 ? { ...addressExtraInfo[0] } : {}),
                sources: postList.map(x => x.uid) as number[],
                avatarURI: postList.length > 0 ? (
                    postList[0].source && postList[0].source[0].uri
                ) : ''
            })
            setLocationPosts([...postList])
        })()
    }, [])
    let postCount: string = ''
    if (addressInfo.sources) {
        postCount = addressInfo.sources.length < 1000 ? `${addressInfo.sources.length}` : (
            addressInfo.sources.length < 1000000
                ? Math.round(addressInfo.sources.length / 1000) + 'K'
                : Math.round(addressInfo.sources.length / 1000000) + 'M'
        )
    }
    const _onViewMore = async () => {

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
    const _onShowFullMap = () => {
        const coordinate = [...(addressInfo.center || [])]
        coordinate.reverse()
        Linking.openURL(`http://maps.apple.com/?ll=${coordinate.join(',')}&z=10`)
        setShowFullMapConfirm(false)
    }
    return (
        <>
            {showFullMapConfirm &&
                <TouchableOpacity
                    onPress={setShowFullMapConfirm.bind(null, false)}
                    activeOpacity={1}
                    style={styles.backdrop}
                >
                    <View style={styles.confirmWrapper}>
                        <Text style={{
                            margin: 15,
                            marginTop: 0,
                            fontSize: 16,
                            fontWeight: "500"
                        }}>
                            Do you want to open full map ?
                        </Text>
                        <TouchableOpacity style={styles.btnConfirm}>
                            <Text
                                onPress={_onShowFullMap}
                                style={{
                                    color: '#318bfb',
                                    fontSize: 16,
                                    fontWeight: '500'
                                }}>Open</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={setShowFullMapConfirm.bind(null, false)}
                            style={styles.btnConfirm}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '500'
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            }
            <SafeAreaView style={styles.container}>
                <View>
                    <NavigationBar title={address.place_name || ""}
                        callback={goBack}
                    />
                    <TouchableOpacity
                        onPress={() => navigate('ShareToDirect', {
                            item: { ...addressInfo }
                        })}
                        style={styles.btnFeedback}>
                        <Image style={{
                            height: 20,
                            width: 20
                        }} source={require('./../../../assets/icons/send.png')} />
                    </TouchableOpacity>
                </View>
                <View onLayout={({ nativeEvent: { layout: { height } } }) => setHeaderHeight(height)} style={styles.headerContainer}>
                    <View style={styles.infoWrapper}>
                        <Image
                            style={styles.avatar}
                            source={{
                                uri: addressInfo.avatarURI
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
                                    onPress={_onViewMore}
                                    style={{
                                        ...styles.btnFollow,
                                        borderWidth: 1,
                                        backgroundColor: "#fff"
                                    }}>
                                    <Text style={{
                                        fontWeight: '600',
                                        color: '#000'
                                    }}>
                                        More Information
                                </Text>
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
                    <View
                        style={styles.locationPreviewWrapper}>
                        <MapView
                            scrollEnabled={false}
                            region={{
                                longitude: (addressInfo.center || [])[0] as number,
                                latitude: (addressInfo.center || [])[1] as number,
                                latitudeDelta: 1,
                                longitudeDelta: 1,
                            }}
                            style={{
                                height: "100%"
                            }}
                        />
                        <TouchableOpacity
                            onPress={setShowFullMapConfirm.bind(null, true)}
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 999
                            }}
                        />
                    </View>
                    <View style={styles.addressTabWrapper}>
                        <TouchableOpacity
                            onPress={_onSwitchTab.bind(null, 1)}
                            style={styles.addressTab}>
                            <Text style={{
                                fontWeight: '500',
                                color: currentTab === 1 ? '#000' : '#666'
                            }}>Top</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={_onSwitchTab.bind(null, 2)}
                            style={styles.addressTab}>
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
                </View>
                <ScrollView
                    ref={_scrollRef}
                    scrollEnabled={false}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                >
                    <FlatList
                        style={{
                            flex: 1
                        }}
                        data={[...addressPosts].sort((a, b) =>
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
                            flex: 1
                        }}
                        data={addressPosts}
                        renderItem={({ item, index }) =>
                            <PhotoItem {...{ item, index }} key={index} />
                        }
                        numColumns={3}
                        keyExtractor={(item, index) => `${index}`}
                    />
                </ScrollView>
            </SafeAreaView >
        </>
    )
}

export default Location

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    headerContainer: {
        paddingTop: 15
    },
    locationPreviewWrapper: {
        marginTop: 15,
        height: 200
    },
    backdrop: {
        height: SCREEN_HEIGHT - getTabBarHeight(),
        width: SCREEN_WIDTH,
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmWrapper: {
        width: '90%',
        paddingTop: 15,
        backgroundColor: '#fff',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnConfirm: {
        width: '100%',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: '#ddd',
        borderTopWidth: 0.3
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
    addressTxt: {
        color: '#318bfb'
    },
    addressTabWrapper: {
        height: 44,
        width: SCREEN_WIDTH,
        flexDirection: 'row'
    },
    addressTab: {
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