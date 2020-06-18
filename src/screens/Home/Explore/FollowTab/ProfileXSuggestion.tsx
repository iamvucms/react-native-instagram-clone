import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ProfileX } from '../../../../reducers/profileXReducer'
export interface ProfileXSuggestionProps {
    userX: ProfileX
}
const ProfileXSuggestion = ({ userX }: ProfileXSuggestionProps) => {
    return (
        <View>
            <Text></Text>
        </View>
    )
}

export default ProfileXSuggestion

const styles = StyleSheet.create({})
