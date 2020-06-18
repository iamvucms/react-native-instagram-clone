import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { HashTag } from '../../reducers/userReducer'
import { MapBoxAddress } from '../../utils'
import { MixedProfileX } from '../../screens/Home/Explore/FollowTab/ProfileXMutual'
export interface PlacesProps {
    resultData: (MixedProfileX | HashTag | MapBoxAddress)[]
}
const Places = ({ resultData }: PlacesProps) => {
    return (
        <View>
            <Text></Text>
        </View>
    )
}

export default Places

const styles = StyleSheet.create({})
