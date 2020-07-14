import React, { useEffect, useRef } from 'react'
import { StyleSheet, View, Animated } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSelector } from '../../reducers'
import { store } from '../../store'
import { getTabBarHeight } from '../BottomTabBar'
export interface CustomAccountIconProps {
    focused: boolean
}
const CustomAccountIcon = ({ focused }: CustomAccountIconProps) => {
    const user = useSelector(state => state.user.user.userInfo)
    const collectionAll = (useSelector(state =>
        state.user.bookmarks?.filter(x => x.name === 'All Posts')
    ) || [])[0]
    const _anim = React.useMemo(() => new Animated.Value(0), [])
    const ref = useRef<{
        preBoormarkCount: number,
        animating: boolean
    }>({
        preBoormarkCount: store.getState().user.bookmarks
            ?.filter(x => x.name === 'All Posts')[0].bookmarks.length || 0,
        animating: false
    })
    useEffect(() => {
        const nextCount = collectionAll.bookmarks.length
        if (nextCount > ref.current.preBoormarkCount && !ref.current.animating) {
            ref.current.animating = true
            _onAnimation()
        }
        ref.current.preBoormarkCount = nextCount
    }, [collectionAll])

    const _onAnimation = () => {
        Animated.sequence([
            Animated.timing(_anim, {
                duration: 500,
                toValue: 1,
                useNativeDriver: true
            }),
            Animated.delay(3000)
            ,
            Animated.timing(_anim, {
                duration: 400,
                toValue: 0,
                useNativeDriver: true
            })
        ]).start(() => ref.current.animating = false)
    }
    return (
        <React.Fragment>
            <Animated.View style={{
                ...styles.popupBookmark,
                transform: [{
                    scale: _anim
                }],
            }}>
                <FastImage
                    source={{
                        uri: [...collectionAll.bookmarks].pop()?.previewUri
                    }}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            </Animated.View>
            <View style={{
                height: 24,
                width: 24,
                borderRadius: 24,
                padding: 2,
                borderWidth: focused ? 1 : 0
            }}>
                <FastImage style={styles.avatar} source={{
                    uri: user?.avatarURL
                }} />
            </View>
        </React.Fragment >
    )
}

export default CustomAccountIcon

const styles = StyleSheet.create({
    avatar: {
        height: '100%',
        width: '100%',
        borderRadius: 20,
        borderColor: '#000',
    },
    popupBookmark: {
        position: 'absolute',
        backgroundColor: 'red',
        height: 50,
        width: 50,
        borderRadius: 5,
        overflow: 'hidden',
        top: -60,
        borderColor: "#ddd",
        borderWidth: 0.5
    }
})
