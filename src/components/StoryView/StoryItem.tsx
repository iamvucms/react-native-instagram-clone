import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Story, ExtraStory } from '../../reducers/storyReducer'
import SuperImage from '../SuperImage'
import { STATUS_BAR_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants'
import { StoryController } from '.'
import FastImage from 'react-native-fast-image'
import { timestampToString } from '../../utils'
export interface StoryProps {
    item: ExtraStory,
    index: number,
    controller: StoryController
}
const StoryItem = ({ item, index, controller }: StoryProps) => {
    useEffect(() => {
        if (controller.currentGroupIndex === index) {

        } else {

        }
    }, [controller])
    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFillObject}>
                <SuperImage superId={item.storyList[0].source as number} />
            </View>
            <View style={styles.topWrapper}>
                <View style={styles.topInfo}>
                    <FastImage style={styles.avatar} source={{
                        uri: item.ownUser.avatarURL
                    }} />
                    <Text style={{
                        fontWeight: '600',
                        color: '#fff',
                        marginLeft: 10
                    }}>{item.ownUser.username}</Text>
                    {controller.currentGroupIndex === index && <Text style={{
                        fontWeight: '600',
                        color: '#ddd',
                        marginLeft: 10
                    }}>{timestampToString(item.storyList[controller.currentChildIndex].create_at?.toMillis() || 0)}</Text>}
                </View>
                <View style={styles.timeoutBar}>
                    {item.storyList.map(item => {

                    })}
                </View>
            </View>
            <View style={styles.bottomWrapper}></View>
        </View>
    )
}

export default React.memo(StoryItem)

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    topWrapper: {
        height: 50 + STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT
    },
    timeoutBar: {
        position: 'absolute',
        top: STATUS_BAR_HEIGHT,
        height: 3,
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: "row",
        alignItems: 'center',
        backgroundColor: 'red'
    },
    topInfo: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginVertical: 5
    },
    bottomWrapper: {
        height: 80,
        flexDirection: "row",
        alignItems: 'center',

    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 30
    }
})
