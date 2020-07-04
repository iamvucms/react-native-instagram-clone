import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { firestore } from 'firebase'
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from '../../reducers'
import { Post } from '../../reducers/postReducer'
import { HashTag } from '../../reducers/userReducer'
import { MixedProfileX } from '../../screens/Home/Explore/FollowTab/ProfileXMutual'
import { MapBoxAddress, searchLocation } from '../../utils'
import Accounts from './Accounts'
import Places from './Places'
import Tags from './Tags'
import TopResult from './TopResult'
export interface SearchResultProps {
    query: string
}
const Tab = createMaterialTopTabNavigator()
const SearchResult = ({ query }: SearchResultProps) => {
    const [resultData, setResultData] = useState<(MixedProfileX | HashTag | MapBoxAddress)[]>([])
    const [recentList, setRecentList] = useState<(MixedProfileX | HashTag | MapBoxAddress)[]>([])
    const history = useSelector(state =>
        state.user.user.userInfo?.searchRecent) || []
    const user = useSelector(state => state.user.user.userInfo)
    const myUsername = user?.username || ''
    const ref = useRef<{
        timeout: NodeJS.Timeout
    }>({
        timeout: setTimeout(() => { }, 0)
    })
    useEffect(() => {
        if (history) {
            history.reverse()
            const ref = firestore()
            const fetchRecentTasks: Promise<MixedProfileX | HashTag | MapBoxAddress>[] = history.map(async item => {
                let rq = null
                let data: MixedProfileX & HashTag | MapBoxAddress = {}
                if (item.type === 1) {
                    rq = await ref.collection('users').doc(item.username).get()
                    data = rq.data() || {}
                } else if (item.type === 2) {
                    rq = await ref.collection('hashtags').doc(`${item.hashtag}`).get()
                    data = rq.data() || {}
                } else {
                    const rs = await searchLocation(item.address || '')
                    console.warn(item)
                    if (rs.length > 0) {
                        data = rs[0]
                    }
                }
                return data
            })
            Promise.all(fetchRecentTasks).then(result => {
                result = result.map(item => {
                    if ('username' in item) {
                        if ((item as MixedProfileX).requestedList && ((item as MixedProfileX).requestedList || []).indexOf(myUsername) > -1) {
                            (item as MixedProfileX).followType = 3
                            return item
                        }
                        if (user?.followings && user.followings.indexOf(item.username || '') > -1) {
                            item.followType = 1
                        }
                        else item.followType = 2
                        return item
                    } else return item
                })
                setRecentList(result)
            })
        }
    }, [history])
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
                    let check = addressList.every((address, index2) => {
                        if (address.id === x.id && index !== index2) return false
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
            <SearchTab searching={query.length > 0} {...{ resultData, recentList }} />
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
interface SearchTabProps {
    resultData: (MixedProfileX | HashTag | MapBoxAddress)[],
    recentList: (MixedProfileX | HashTag | MapBoxAddress)[],
    searching?: boolean
}
const SearchTab = ({ resultData, recentList, searching }: SearchTabProps) => {
    const filter = (list: (MixedProfileX | HashTag | MapBoxAddress)[]
        , field: string[]) => [...list.filter(x => field.every(f => `${f}` in x))]
    const filteredAccountResults = filter(resultData || [], ['username'])
    const filteredAccountRecents = filter(recentList || [], ['username'])
    const filteredHashtagResults = filter(resultData || [], ['name', 'sources'])
    const filteredHashtagRecents = filter(recentList || [], ['name', 'sources'])
    const filteredPlaceResults = filter(resultData || [], ['place_name'])
    const filteredPlaceRecents = filter(recentList || [], ['place_name'])
    return (
        <Tab.Navigator>
            <Tab.Screen children={() => <TopResult {...{ resultData, recentList, searching }} />}
                name="Top" />
            <Tab.Screen children={() => <Accounts
                searching={searching}
                recentList={filteredAccountRecents}
                resultData={filteredAccountResults} />}
                name="Accounts" />
            <Tab.Screen children={() => <Tags
                searching={searching}
                recentList={filteredHashtagRecents}
                resultData={filteredHashtagResults}
            />}
                name="Tags" />
            <Tab.Screen children={() => <Places
                searching={searching}
                recentList={filteredPlaceRecents}
                resultData={filteredPlaceResults}
            />}
                name="Places" />
        </Tab.Navigator>
    )
}
