import Clipboard from '@react-native-community/clipboard'
import { RouteProp } from '@react-navigation/native'
import { firestore } from 'firebase'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { FetchProfileXRequest } from '../../actions/profileXActions'
import { FetchExtraInfoRequest, UpdatePrivacySettingsRequest } from '../../actions/userActions'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants'
import { SuperRootStackParamList } from '../../navigations'
import { goBack, navigation } from '../../navigations/rootNavigation'
import { useSelector } from '../../reducers'
import { ProfileX } from '../../reducers/profileXReducer'
import { store } from '../../store'
import { shareProfile } from '../../utils'
type ProfileOptionsRouteProp = RouteProp<SuperRootStackParamList, 'ProfileOptions'>
type ProfileOptionsProps = {
    route: ProfileOptionsRouteProp
}
const ProfileOptions = ({ route }: ProfileOptionsProps) => {
    const myUsername = store.getState().user.user.userInfo?.username || ''
    const me = useSelector(state => state.user)
    const userX = route.params.userX
    const [confirmBlock, setConfirmBlock] = useState<boolean>(false)
    const [confirmRestrict, setConfirmRestrict] = useState<boolean>(false)
    const dispatch = useDispatch()
    const _onBlock = () => {
        setConfirmBlock(true)
    }
    const _onRestrict = () => {
        setConfirmRestrict(true)
    }

    const _onConfirmBlock = async () => {
        const ref = firestore()
        const rq = await ref.collection('users').doc(myUsername).get()
        const targetUser = await ref.collection('users').doc(userX.username).get()
        if (rq.exists) {
            const myUserData: ProfileX = rq.data() || {}
            const currentBlockList = myUserData.privacySetting?.blockedAccounts?.blockedAccounts || []
            const currentFollowingList = myUserData.followings || []
            if (currentBlockList.indexOf(userX.username || '') < 0) {
                currentBlockList.push(userX.username || '')
                dispatch(UpdatePrivacySettingsRequest({
                    blockedAccounts: {
                        blockedAccounts: currentBlockList
                    }
                }))
            }
            const followIndex = currentFollowingList.indexOf(userX.username || '')
            if (followIndex > -1) {
                currentFollowingList.splice(followIndex, 1)
                rq.ref.update({
                    followings: currentFollowingList
                })
            }
            const targetUserData: ProfileX = targetUser.data() || {}
            const currentTargetUserFollowings = targetUserData.followings || []
            const targetFollowingIndex = currentTargetUserFollowings.indexOf(myUsername)
            if (targetFollowingIndex > -1) {
                currentTargetUserFollowings.splice(targetFollowingIndex, 1)
                targetUser.ref.update({
                    followings: currentTargetUserFollowings
                })
            }
        }
        dispatch(FetchProfileXRequest(userX.username || ''))
        dispatch(FetchExtraInfoRequest())
        setConfirmBlock(false)
        goBack()
    }
    const _onConfirmRestrict = async () => {
        const ref = firestore()
        const rq = await ref.collection('users').doc(myUsername).get()
        if (rq.exists) {
            const myUserData: ProfileX = rq.data() || {}
            const currentRestrictList = myUserData.privacySetting?.restrictedAccounts?.restrictedAccounts || []
            if (currentRestrictList.indexOf(userX.username || '') < 0) {
                currentRestrictList.push(userX.username || '')
                dispatch(UpdatePrivacySettingsRequest({
                    restrictedAccounts: {
                        restrictedAccounts: currentRestrictList
                    }
                }))
            }
            const currentFollowingList = myUserData.followings || []
            const followIndex = currentFollowingList.indexOf(userX.username || '')
            if (followIndex > -1) {
                currentFollowingList.splice(followIndex, 1)
                rq.ref.update({
                    followings: currentFollowingList
                })
            }
        }
        dispatch(FetchExtraInfoRequest())
        setConfirmRestrict(false)
        goBack()
    }
    return (
        <>
            {confirmBlock && <TouchableOpacity
                onPress={setConfirmBlock.bind(null, false)}
                activeOpacity={1}
                style={styles.backdrop}>
                <View style={styles.confirmBlock}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '500'
                    }}>Block {userX.username}?</Text>
                    <Text style={{
                        marginTop: 10,
                        width: '80%',
                        textAlign: 'center',
                        color: '#666',
                        marginBottom: 20
                    }}>They won't be able to find your profile, posts or story on Instagram. Instagram won't let them know you blocked them.</Text>
                    <TouchableOpacity
                        onPress={_onConfirmBlock}
                        style={styles.btn}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#318bfb'
                        }}>Block</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={setConfirmBlock.bind(null, false)}
                        style={styles.btn}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                        }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            }
            {confirmRestrict && <TouchableOpacity
                onPress={setConfirmRestrict.bind(null, false)}
                activeOpacity={1}
                style={styles.backdrop}>
                <View style={styles.confirmBlock}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '500'
                    }}>Restrict {userX.username}?</Text>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: "center",
                        marginVertical: 5,
                        width: '100%',
                        paddingHorizontal: 15
                    }}>
                        <Icon name="shield-check-outline" size={30} />
                        <Text style={{
                            marginLeft: 10,
                            width: SCREEN_WIDTH * 0.9 - 30 - 30 - 10,
                            color: '#666'
                        }}>Limit unwanted interactions without having to block or unfollow someone you know.
                            </Text>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: "center",
                        marginVertical: 5,
                        width: '100%',
                        paddingHorizontal: 15
                    }}>
                        <Icon name="comment-outline" size={30} />
                        <Text style={{
                            marginLeft: 10,
                            width: SCREEN_WIDTH * 0.9 - 30 - 30 - 10,
                            color: '#666'
                        }}>You'll control if others can see their new comments on your posts.You'll control if others can see their new comments on your posts.</Text>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: "center",
                        marginVertical: 5,
                        width: '100%',
                        paddingHorizontal: 15
                    }}>
                        <Icon name="send" size={30} />
                        <Text style={{
                            marginLeft: 10,
                            width: SCREEN_WIDTH * 0.9 - 30 - 30 - 10,
                            color: '#666'
                        }}>Their chat will be moved to your Message Requests, so they won't see when you've read it.</Text>
                    </View>
                    <TouchableOpacity
                        onPress={_onConfirmRestrict}
                        style={styles.btn}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#318bfb'
                        }}>Restrict</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={setConfirmRestrict.bind(null, false)}
                        style={styles.btn}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                        }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            }
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => navigation.goBack()}
                style={{
                    ...styles.container,
                }}>
                <View style={styles.mainOptions}>
                    <View style={{ backgroundColor: "#000" }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.optionItem}>
                            <Text>Report...</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ backgroundColor: "#000" }}>
                        <TouchableOpacity
                            onPress={_onBlock}
                            activeOpacity={0.8}
                            style={styles.optionItem}>
                            <Text>Block</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ backgroundColor: "#000" }}>
                        <TouchableOpacity
                            onPress={_onRestrict}
                            activeOpacity={0.8}
                            style={styles.optionItem}>
                            <Text>Restrict</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ backgroundColor: "#000" }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.optionItem}>
                            <Text>Hide Your Story</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ backgroundColor: "#000" }}>
                        <TouchableOpacity
                            onPress={() => {
                                Clipboard.setString('https://instagram.com/' + 1)
                                goBack()
                            }}
                            activeOpacity={0.8}
                            style={styles.optionItem}>
                            <Text>Copy Profile URL</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ backgroundColor: "#000" }}>
                        <TouchableOpacity
                            onPress={() => shareProfile(userX)}
                            activeOpacity={0.8}
                            style={styles.optionItem}>
                            <Text>Share this Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </>
    )
}

export default ProfileOptions

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: "100%",
        justifyContent: "center",
        alignItems: 'center'
    },
    mainOptions: {
        width: SCREEN_WIDTH * 0.6,
        borderRadius: 5,
        padding: 5,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 20,

        elevation: 7,
    },
    optionItem: {
        backgroundColor: '#fff',
        height: 44,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 10
    },
    backdrop: {
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        position: 'absolute',
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBlock: {
        width: "90%",
        paddingTop: 20,
        backgroundColor: '#fff',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btn: {
        borderColor: "#ddd",
        borderTopWidth: 0.5,
        width: "100%",
        height: 44,
        justifyContent: 'center',
        alignItems: "center"
    }
})
