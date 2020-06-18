import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MixedProfileX } from '../../screens/Home/Explore/FollowTab/ProfileXMutual'
import { HashTag } from '../../reducers/userReducer'
import { MapBoxAddress } from '../../utils'

export interface AccountsProps {
    resultData: (MixedProfileX | HashTag | MapBoxAddress)[]
}
const Accounts = ({ resultData }: AccountsProps) => {
    return (
        <View>
            <Text></Text>
        </View>
    )
}

export default Accounts

const styles = StyleSheet.create({})
