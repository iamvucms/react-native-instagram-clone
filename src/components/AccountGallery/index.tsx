import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SCREEN_WIDTH } from '../../constants'
import GalleryImageItem from '../GalleryImageItem'
import { Post } from '../../reducers/postReducer'
export interface AccountGalleryProps {
    photos: Post[],
    hidePopupImage: () => void,
    showPopupImage: (e: { pX: number, pY: number, w: number, h: number }, photo: Post) => void,
}
const AccountGallery = ({ photos, hidePopupImage, showPopupImage }: AccountGalleryProps) => {
    return (
        <View style={styles.container}>
            {photos && photos.map((photo, index) => (
                <GalleryImageItem
                    _hidePopupImage={hidePopupImage}
                    _showPopupImage={showPopupImage}
                    key={index}
                    index={index}
                    photo={photo} />
            ))}
        </View>
    )
}

export default AccountGallery

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: SCREEN_WIDTH,
        backgroundColor: '#fff',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
})
