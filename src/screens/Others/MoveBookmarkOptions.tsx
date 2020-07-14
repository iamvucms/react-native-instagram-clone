
import { RouteProp } from '@react-navigation/native'
import React, { useRef } from 'react'
import { Animated, FlatList, Image, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { MoveBookmarkToCollectionRequest } from '../../actions/userActions'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants'
import { SuperRootStackParamList } from '../../navigations'
import { goBack } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'

type MoveBookmarkOptionsRouteProp = RouteProp<SuperRootStackParamList, 'MoveBookmarkOptions'>
type MoveBookmarkOptionsProps = {
    route: MoveBookmarkOptionsRouteProp
}
const MoveBookmarkOptions = ({ route }: MoveBookmarkOptionsProps) => {
    const dispatch = useDispatch()
    const { bookmarks, fromCollectionName, selectedIndexs }
        = route.params || {}
    const collections = useSelector(state => state.user.bookmarks
        ?.filter(x => x.name !== 'All Posts'))
    const _bottomSheetOffsetY = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        bottomSheetHeight: number
    }>({
        bottomSheetHeight: 0
    })
    const _onGestureEventHandler = ({ nativeEvent: {
        translationY
    } }: PanGestureHandlerGestureEvent) => {
        if (translationY > 0) {
            _bottomSheetOffsetY.setValue(translationY)
        }
    }
    const _onStateChangeHandler = ({
        nativeEvent: {
            translationY,
            state
        }
    }: PanGestureHandlerGestureEvent) => {
        if (state === State.END) {
            if (translationY > ref.current.bottomSheetHeight * 0.6) {
                Animated.timing(_bottomSheetOffsetY, {
                    toValue: ref.current.bottomSheetHeight,
                    useNativeDriver: true,
                    duration: 150
                }).start(() => goBack())
            } else {
                Animated.spring(_bottomSheetOffsetY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start()
            }
        }
    }
    const _onMoveBookmark = async (targetCollectionName: string) => {
        if (collections) {
            Promise.all(selectedIndexs.map(async i => {
                await dispatch(MoveBookmarkToCollectionRequest(fromCollectionName, targetCollectionName, bookmarks[i].postId))
            })).then(goBack)
        }
    }
    return (
        <SafeAreaView>
            <TouchableOpacity
                onPress={goBack}
                style={{
                    height: '100%',
                    width: '100%',
                }}>

            </TouchableOpacity>
            <PanGestureHandler
                onGestureEvent={_onGestureEventHandler}
                onHandlerStateChange={_onStateChangeHandler}
            >
                <Animated.View
                    onLayout={({ nativeEvent: { layout: { height } } }: LayoutChangeEvent) => {
                        ref.current.bottomSheetHeight = height
                    }}
                    style={{
                        ...styles.bottomSheet,
                        transform: [{
                            translateY: _bottomSheetOffsetY
                        }]
                    }}>
                    <View style={styles.titleWrapper}>
                        <View style={{
                            marginBottom: 10,
                            height: 3,
                            width: 40,
                            backgroundColor: '#999',
                            borderRadius: 2,
                        }} />
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '500'
                        }}>Move to Another Collection</Text>
                    </View>
                    <View style={styles.collectionsWrapper}>
                        <FlatList
                            numColumns={4}
                            data={collections}
                            renderItem={({ item, index }) =>
                                <TouchableOpacity
                                    onPress={_onMoveBookmark.bind(null, item.name)}
                                    disabled={item.name === fromCollectionName}
                                    style={{
                                        ...styles.collectionItem,
                                        marginHorizontal: 7.5
                                    }}>
                                    <FastImage
                                        source={{
                                            uri: item.bookmarks[item.avatarIndex || 0]?.previewUri
                                        }}
                                        style={{
                                            borderRadius: 10,
                                            height: (SCREEN_WIDTH - 30 - 15 * 3) / 4,
                                            width: "100%"
                                        }}
                                    />
                                    <View style={{
                                        height: 30,
                                        width: "100%",
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            fontWeight: '500',
                                            fontSize: 14
                                        }}>{item.name}</Text>
                                    </View>
                                    {item.name === fromCollectionName &&
                                        <View style={styles.currentCollection}>
                                            <Image
                                                style={{
                                                    height: 24,
                                                    width: 24,
                                                }}
                                                source={require('../../assets/icons/tick.png')}
                                            />
                                        </View>
                                    }
                                </TouchableOpacity>
                            }
                            keyExtractor={(_, index) => `${index}`}
                        />
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </SafeAreaView>
    )
}

export default MoveBookmarkOptions

const styles = StyleSheet.create({
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: 40,
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    titleWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd'
    },
    collectionsWrapper: {
        maxHeight: SCREEN_HEIGHT * 0.4,
        paddingHorizontal: 7.5,
        paddingVertical: 7.5
    },
    collectionItem: {
        marginVertical: 7.5,
        overflow: 'hidden',
        width: (SCREEN_WIDTH - 30 - 15 * 3) / 4,
        height: (SCREEN_WIDTH - 30 - 15 * 3) / 4 + 30
    },
    currentCollection: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: "100%",
        borderRadius: 10,
        top: 0,
        left: 0,
        height: (SCREEN_WIDTH - 30 - 15 * 3) / 4,
        zIndex: 1
    }
})
