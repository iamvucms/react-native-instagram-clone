import { RouteProp } from '@react-navigation/native'
import React, { useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, SafeAreaViewComponent, FlatList, TouchableOpacity, Image } from 'react-native'
import { SuperRootStackParamList } from '../../../navigations'
import NavigationBar from '../../../components/NavigationBar'
import { goBack, navigate } from '../../../navigations/rootNavigation'
import { Message } from '../../../reducers/messageReducer'
import FastImage from 'react-native-fast-image'
import { SCREEN_WIDTH } from '../../../constants'

type SharedImagesRouteProp = RouteProp<SuperRootStackParamList, 'SharedImages'>
type SharedImagesProps = {
    route: SharedImagesRouteProp
}
const SharedImages = ({ route }: SharedImagesProps) => {
    const sharedImages = route?.params?.imageMessages || []
    return (
        <SafeAreaView style={styles.container}>
            <NavigationBar title="All Media" callback={goBack} />
            <FlatList
                bounces={false}
                showsVerticalScrollIndicator={false}
                data={sharedImages}
                renderItem={({ item }) =>
                    <ShareImage message={item} />
                }
                numColumns={3}
                keyExtractor={(_, index) => `${index}`}
            />
        </SafeAreaView>
    )
}

export default SharedImages
const SHARED_IMG_SIZE = SCREEN_WIDTH / 3
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        height: '100%',
        width: '100%'
    },
    sharedImage: {
        height: SHARED_IMG_SIZE,
        width: SHARED_IMG_SIZE
    }
})
interface ShareImageProps {
    message: Message
}
const ShareImage = ({ message }: ShareImageProps) => {
    const imgRef = useRef<TouchableOpacity>(null)
    const _onShowFull = () => {
        imgRef.current?.measure((x, y, w, h, pX, pY) => {
            navigate('ImageFullView', {
                pH: SHARED_IMG_SIZE,
                pW: SHARED_IMG_SIZE,
                pX,
                pY,
                oH: message.height,
                oW: message.width,
                pScale: SHARED_IMG_SIZE / (message.width as number),
                uri: message.sourceUri,
                borderRadius: false,
                unScaled: true
            })
        })
    }
    return (
        <TouchableOpacity
            ref={imgRef}
            activeOpacity={0.8}
            onPress={_onShowFull}
        >
            <FastImage
                source={{
                    uri: message.sourceUri
                }}
                style={styles.sharedImage}
            />
        </TouchableOpacity>
    )
} 
