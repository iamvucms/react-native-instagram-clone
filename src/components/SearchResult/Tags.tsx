import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MixedProfileX } from '../../screens/Home/Explore/FollowTab/ProfileXMutual'
import { HashTag } from '../../reducers/userReducer'
import { MapBoxAddress } from '../../utils'
export interface TagsProps {
    resultData: (MixedProfileX | HashTag | MapBoxAddress)[]
}
const Tags = ({ resultData }: TagsProps) => {
    return (
        <View>
            <Text></Text>
        </View>
    )
}

export default Tags

const styles = StyleSheet.create({})
