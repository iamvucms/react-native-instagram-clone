import { RouteProp } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Animated } from 'react-native'
import StoryView from '../../components/StoryView'
import { SuperRootStackParamList } from '../../navigations'
import { useSelector } from '../../reducers'
import { useDispatch } from 'react-redux'
import { FetchStoryListRequest } from '../../actions/storyActions'
import HighlightView from '../../components/Highlight/HighlightView'
type HighlightFullViewRouteProp = RouteProp<SuperRootStackParamList, 'HighlightFullView'>
type HighlightFullViewProps = {
    route: HighlightFullViewRouteProp
}
const HighlightFullView = ({ route }: HighlightFullViewProps) => {
    const dispatch = useDispatch()
    const highlight = route.params.highlight
    const isMyHighlight = !!route.params.isMyHighlight
    const [loaded, setLoading] = useState<boolean>(false)
    const _loadingAnim = React.useMemo(() => new Animated.Value(0), [])
    useEffect(() => {
        ; (async () => {
            await dispatch(FetchStoryListRequest())
            setLoading(true)
        })()
    }, [])
    const _onAnimation = () => {
        Animated.loop(Animated.timing(_loadingAnim, {
            useNativeDriver: true,
            toValue: 1,
            duration: 1000
        }), {
            iterations: 20
        }).start()
    }
    return (
        <View style={styles.container}>
            {loaded && <HighlightView {...{ isMyHighlight, highlight }} />}
            {!loaded &&
                <View style={{
                    height: "100%",
                    width: '100%',
                    ...StyleSheet.absoluteFillObject,
                    zIndex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Animated.View
                        onLayout={_onAnimation}
                        style={{
                            height: 64,
                            width: 64,
                            borderRadius: 64,
                            borderColor: "#fff",
                            borderWidth: 4,
                            borderStyle: 'dashed',
                            transform: [{
                                rotate: _loadingAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                })
                            }]
                        }} />
                </View>
            }
        </View>
    )
}

export default HighlightFullView

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
