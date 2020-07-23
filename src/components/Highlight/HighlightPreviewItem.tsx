import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { Highlight } from '../../reducers/userReducer'
import FastImage from 'react-native-fast-image'
import { navigate } from '../../navigations/rootNavigation'
import { useDispatch } from 'react-redux'
import { AddStoryToHighlightRequest, RemoveFromHighlightRequest } from '../../actions/userActions'
export interface HighlightPreviewItemProps {
    item: Highlight,
    isMyHighlight?: boolean,
    inStoryAddition?: boolean,
    addtionUid?: number,
    additionSuperId?: number
}
const HighlightPreviewItem = ({ item,
    addtionUid, additionSuperId,
    isMyHighlight, inStoryAddition }: HighlightPreviewItemProps) => {
    const dispatch = useDispatch()
    const isAdded = !!inStoryAddition
        && !!item.stories.find(x => x.uid === addtionUid)
    const _onViewHighLight = () => {
        if (!!!inStoryAddition) {
            navigate("HighlightFullView", {
                highlight: { ...item },
                isMyHighlight
            })
        } else {
            if (isAdded) {
                dispatch(RemoveFromHighlightRequest(addtionUid as number, item.name))
            } else {
                dispatch(AddStoryToHighlightRequest([{
                    create_at: new Date().getTime(),
                    superId: additionSuperId as number,
                    uid: addtionUid as number
                }], item.name))
            }
        }
    }
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={_onViewHighLight}
            style={styles.container}
        >
            <View
                style={styles.borderCover}>
                <View style={{
                    overflow: 'hidden',
                    borderRadius: 999,
                }}>
                    <FastImage source={{
                        uri: item.avatarUri
                    }}
                        style={styles.avatar}
                    />
                    {isAdded &&
                        <View style={{
                            position: 'absolute',
                            zIndex: 1,
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: "rgba(0,0,0,0.75)"
                        }}>
                            <Image style={{
                                width: 24,
                                height: 24
                            }} source={require('../../assets/icons/tick.png')} />
                        </View>
                    }
                </View>
            </View>
            <Text
                numberOfLines={1}
                style={{
                    fontWeight: '500',
                    marginTop: 5,
                    maxWidth: '100%'
                }}>{item.name}</Text>

        </TouchableOpacity>
    )
}

export default HighlightPreviewItem

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        maxWidth: 70
    },
    borderCover: {
        borderRadius: 999,
        padding: 2,
        borderColor: '#999',
        borderWidth: 1,
        overflow: "hidden",
    },
    avatar: {
        height: 64,
        width: 64,
        borderRadius: 64,
    }
})
