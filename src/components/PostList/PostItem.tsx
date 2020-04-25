import React from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import PhotoShower from './PhotoShower'
const PostItem = () => {
    return (
        <View style={styles.container}>
            <View style={styles.postHeader}>
                <View
                    style={styles.infoWrapper}>
                    <TouchableOpacity>
                        <Image style={styles.avatar}
                            source={{ uri: 'https://miro.medium.com/max/1200/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg' }} />
                    </TouchableOpacity>
                    <Text style={{
                        fontWeight: '600'
                    }}>vucms</Text>
                </View>
                <TouchableOpacity>
                    <Icons name="dots-vertical" size={24} />
                </TouchableOpacity>
            </View>
            <View style={styles.body}>
                <PhotoShower />
            </View>
            <View style={styles.reactionsWrapper}>
                <View style={styles.reactions}>
                    <View style={styles.lReactions}>
                        <TouchableOpacity>
                            <Icons name="heart-outline" size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icons name="comment-outline" size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icons name="send-outline" size={24} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                        <Icons name="heart-outline" size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default PostItem

const styles = StyleSheet.create({
    container: {

    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderTopColor: '#ddd',
        borderTopWidth: 0.5,
        borderBottomColor: '#ddd',
        borderBottomWidth: 0.5,
    },
    infoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    body: {

    },
    avatar: {
        borderColor: '#ddd',
        borderWidth: 0.3,
        height: 30,
        width: 30,
        borderRadius: 30,
        marginRight: 10,
    },
    reactionsWrapper: {
        padding: 10
    },
    reactions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    lReactions: {
        flexDirection: 'row'
    }
})
