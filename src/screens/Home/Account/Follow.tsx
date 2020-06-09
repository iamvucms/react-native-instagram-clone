import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useRef } from 'react'
import { Animated, FlatList, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH } from '../../../constants'
import { goBack } from '../../../navigations/rootNavigation'
import { useSelector } from '../../../reducers'
type FollowRouteProp = RouteProp<{
    Follow: {
        type: 1 | 2
    }
}, 'Follow'>

type FollowNavigationProp = StackNavigationProp<{
    Follow: {
        type: 1 | 2
    }
}, 'Follow'>

type FollowProps = {
    navigation: FollowNavigationProp,
    route: FollowRouteProp
}
const Follow = ({ route }: FollowProps) => {
    const type = route.params.type
    const user = useSelector(state => state.user)
    const username = user.user.userInfo?.username
    const _scrollRef = useRef<ScrollView>(null)
    const _tabLineOffsetX = React.useMemo(() =>
        new Animated.Value((type - 1) * SCREEN_WIDTH / 2), [])
    const ref = useRef<{
        currentTab: 1 | 2
    }>({
        currentTab: type
    })
    const _onSwitchTab = (type: 1 | 2) => {
        if (type === 2 && ref.current.currentTab === 1) {
            ref.current.currentTab = type
            _scrollRef.current?.scrollTo({
                y: 0,
                x: SCREEN_WIDTH,
                animated: true
            })
            return Animated.timing(_tabLineOffsetX, {
                toValue: SCREEN_WIDTH / 2,
                useNativeDriver: false,
                duration: 200
            }).start()
        }
        if (type === 1 && ref.current.currentTab === 2) {
            ref.current.currentTab = type
            _scrollRef.current?.scrollTo({
                y: 0,
                x: 0,
                animated: true
            })
            return Animated.timing(_tabLineOffsetX, {
                toValue: 0,
                useNativeDriver: false,
                duration: 200
            }).start()
        }
    }
    const _onScrollEndDrag = ({ nativeEvent: {
        contentOffset: { x }
    } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (x > SCREEN_WIDTH / 2) {
            _scrollRef.current?.scrollTo({
                y: 0,
                x: SCREEN_WIDTH,
                animated: true
            })
            if (ref.current.currentTab === 1) {
                Animated.timing(_tabLineOffsetX, {
                    toValue: SCREEN_WIDTH / 2,
                    useNativeDriver: false,
                    duration: 200
                }).start()
            }
            ref.current.currentTab = 2
        } else {
            _scrollRef.current?.scrollTo({
                y: 0,
                x: 0,
                animated: true
            })
            if (ref.current.currentTab === 2) {
                Animated.timing(_tabLineOffsetX, {
                    toValue: 0,
                    useNativeDriver: false,
                    duration: 200
                }).start()
            }
            ref.current.currentTab = 1
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 44,
                }}>
                    <TouchableOpacity
                        onPress={goBack}
                        style={styles.btnGoBack}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '500'
                    }}>{username}</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 44,
                }}>
                    <TouchableOpacity
                        onPress={() => _onSwitchTab(1)}
                        style={styles.tab}
                    >
                        <Text style={{
                            fontWeight: '500'
                        }}>Follower</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => _onSwitchTab(2)}
                        style={styles.tab}
                    >
                        <Text style={{
                            fontWeight: '500'
                        }}>Following</Text>
                    </TouchableOpacity>
                    <Animated.View
                        style={{
                            ...styles.tabLine,
                            left: _tabLineOffsetX
                        }} />
                </View>
            </View>
            <ScrollView
                onScrollEndDrag={_onScrollEndDrag}
                scrollEventThrottle={30}
                ref={_scrollRef}
                bounces={false}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.tabContainer}>
                    <FlatList data={[1, 2, 3]}
                        renderItem={({ item }) => <Text>{item}</Text>}
                    />
                </View>
                <View style={styles.tabContainer}>
                    <FlatList data={[1, 2, 3]}
                        renderItem={({ item }) => <Text>{item}</Text>}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Follow

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        height: 88,
        width: '100%',
        borderBottomColor: "#ddd",
        borderBottomWidth: 1,
        marginBottom: 2
    },
    btnGoBack: {
        height: 44,
        width: 66,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab: {
        height: 44,
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabContainer: {
        width: SCREEN_WIDTH,
        height: 500,
    },
    tabLine: {
        position: 'absolute',
        height: 2,
        width: SCREEN_WIDTH / 2,
        backgroundColor: '#333',
        top: '100%',
        zIndex: 1,
    }
})
