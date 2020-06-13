import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSuggestion } from '../../../hooks/useSuggestion'
import { navigate } from '../../../navigations/rootNavigation'
import FastImage from 'react-native-fast-image'
import { UserInfo } from '../../../reducers/userReducer'
import { useSelector } from '../../../reducers'
import { firestore } from 'firebase'

const index = () => {
    const extraInfo = useSelector(state => state.user.extraInfo)
    const [suggests, setSuggests] = useSuggestion(20)
    const [lastRequest, setLastRequest] = useState<UserInfo>({})
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        if (extraInfo) {
            const ref = firestore()
            const requestedUsrname = [...extraInfo.requestedList].pop()
            if (requestedUsrname) {
                ref.collection('users').doc(requestedUsrname).get().then(rs => {
                    setLastRequest(rs.data() || {})
                })
            }
        }
        return () => {
        }
    }, [extraInfo?.requestedList])
    const _onRefresh = async () => {

    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationBar}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: '600'
                }}>Activity</Text>
            </View>
            <ScrollView
                refreshControl={<RefreshControl
                    refreshing={loading}
                    onRefresh={_onRefresh}
                />}
                showsVerticalScrollIndicator={false}
            >
                {lastRequest.hasOwnProperty('username') &&
                    <TouchableOpacity
                        onPress={() => navigate('ActivityFollowRequests')}
                        style={styles.requestListWrapper}>
                        <View style={{
                            height: 40,
                            width: 40,
                            marginRight: 10,
                        }}>
                            <FastImage
                                source={{
                                    uri: lastRequest.avatarURL
                                }}
                                style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 40,
                                    borderColor: '#333',
                                    borderWidth: 0.3
                                }} />
                            <View style={styles.requestNumber}>
                                <Text style={{
                                    color: '#fff',
                                    fontWeight: "bold"
                                }}>{extraInfo?.requestedList.length}</Text>
                            </View>
                        </View>
                        <View>
                            <Text>Follow Request</Text>
                            <Text style={{
                                color: "#666"
                            }}>Approve or ignore requests</Text>
                        </View>
                    </TouchableOpacity>

                }
            </ScrollView>
        </SafeAreaView >
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        height: 44,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    requestListWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 15,
    },
    requestNumber: {
        position: 'absolute',
        height: 18,
        width: 18,
        borderRadius: 18,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        right: 0
    },
})
