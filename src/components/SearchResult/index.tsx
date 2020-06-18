import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { HashTag } from '../../reducers/userReducer'
import { MixedUserInfo } from '../../screens/Home/Account/Follow'
import { MapBoxAddress } from '../../utils'
import Accounts from './Accounts'
import Places from './Places'
import Tags from './Tags'
import TopResult from './TopResult'
import { MixedProfileX } from '../../screens/Home/Explore/FollowTab/ProfileXMutual'
import { Post } from '../../reducers/postReducer'
export interface SearchResultProps {
    query: string
}
const Tab = createMaterialTopTabNavigator()
const SearchResult = ({ query }: SearchResultProps) => {
    const [resultData, setResultData] = useState<(MixedProfileX | HashTag | MapBoxAddress)[]>([])
    const ref = useRef<{
        timeout: NodeJS.Timeout
    }>({
        timeout: setTimeout(() => { }, 0)
    })
    useEffect(() => {
        clearTimeout(ref.current.timeout)
        if (query.length > 0) {
            ref.current.timeout = setTimeout(async () => {
                const ref = firestore()
                const hashtag = await ref.collection('hashtags')
                    .where('keyword', 'array-contains', query.trim()).get()
                const hashTagList: HashTag[] = hashtag.docs.map(doc =>
                    doc.data() || {})
                const accounts = await ref.collection('users').
                    where('keyword', 'array-contains', query).get()
                const accountList: MixedProfileX[] = accounts.docs.map(x => x.data() || {})
                const posts = await ref.collection('posts')
                    .where('address.keyword', 'array-contains', query).get()
                const addressList: (MapBoxAddress & {
                    uid?: number
                })[] = posts.docs.map(doc => {
                    const data: Post = doc.data() || {}
                    return data.address || {}
                })
                const temp = [...addressList]
                temp.map((x, index) => {
                    let check = addressList.every(address => {
                        if (address.id === x.id) return false
                        return true
                    })
                    if (!check) addressList.splice(index, 1)
                })
                const finalResult = hashTagList.concat(accountList).concat(addressList)
                setResultData(finalResult)
            }, 400)
        } else setResultData([])
    }, [query])
    return (
        <View style={styles.container}>
            <SearchTab resultData={resultData} />
        </View>
    )
}

export default SearchResult

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "#fff"
    }
})
const SearchTab = ({ resultData }: { resultData: (MixedProfileX | HashTag | MapBoxAddress)[] }) => {
    resultData[0]
    return (
        <Tab.Navigator>
            <Tab.Screen children={() => <TopResult resultData={resultData} />} name="Top" />
            <Tab.Screen children={() => <Accounts resultData={resultData} />} name="Accounts" />
            <Tab.Screen children={() => <Tags resultData={resultData} />} name="Tags" />
            <Tab.Screen children={() => <Places resultData={resultData} />} name="Places" />
        </Tab.Navigator>
    )
}
