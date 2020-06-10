import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, Animated } from 'react-native'
import { navigation } from '../../../../../navigations/rootNavigation'
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import Contacts from 'react-native-contacts'
import { useDispatch } from 'react-redux';
import { FollowContactsRequest } from '../../../../../actions/userActions';
const FollowContacts = (): JSX.Element => {
    const dispatch = useDispatch()
    const [syncing, setSyncing] = useState<boolean>(false)
    const _loadingDeg = new Animated.Value(0)
    const _animateLoading = () => {
        Animated.timing(_loadingDeg, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false
        }).start(() => {
            if (syncing) {
                _loadingDeg.setValue(0)
                _animateLoading()
            }
        })
    }
    useEffect(() => {
        return () => {
            setSyncing(false)
        }
    }, [])
    const _onSyncContactsHandler = () => {
        check(PERMISSIONS.IOS.CONTACTS).then(result => {
            switch (result) {
                case RESULTS.UNAVAILABLE:
                    Alert.alert("Error", `This service isn't availabel in your device!`)
                    break;
                case RESULTS.DENIED:
                    request(PERMISSIONS.IOS.CONTACTS).then(result2 => {
                        switch (result2) {
                            case RESULTS.BLOCKED:
                                Alert.alert("Error", `This service isn't availabel in your device!`)
                                navigation.goBack()
                                break;
                            case RESULTS.DENIED:
                                Alert.alert("Error", `This service isn't availabel in your device!`)
                                navigation.goBack()
                                break;
                            case RESULTS.GRANTED:
                                setSyncing(true)
                                Contacts.getAllWithoutPhotos((err, contacts) => {
                                    if (err) {
                                        Alert.alert("Error", `This service isn't availabel in your device!`)
                                    } else {
                                        const phoneList: string[] = []
                                        contacts.map(contact => {
                                            contact.phoneNumbers.map(phone => {
                                                phoneList.push(phone.number)
                                            })
                                        });
                                        (async () => await dispatch(FollowContactsRequest(phoneList)))()
                                            .then(() => {
                                                setSyncing(false)
                                                navigation.goBack()
                                            })
                                    }
                                })
                                break;
                            default:
                                break;
                        }
                    })
                    break;
                case RESULTS.GRANTED:
                    setSyncing(true)
                    Contacts.getAllWithoutPhotos((err, contacts) => {
                        if (err) {
                            Alert.alert("Error", `This service isn't availabel in your device!`)
                        } else {
                            const phoneList: string[] = []
                            contacts.map(contact => {
                                contact.phoneNumbers.map(phone => {
                                    phoneList.push(phone.number)
                                })
                            });
                            (async () => await dispatch(FollowContactsRequest(phoneList)))()
                                .then(() => {
                                    setSyncing(false)
                                    navigation.goBack()
                                })
                        }
                        // navigation.goBack()
                    })
                    break;
                case RESULTS.BLOCKED:
                    Alert.alert("Error", `This service isn't availabel in your device!`)
                    navigation.goBack()
                    break;
            }
        })
    }
    return (
        <View style={styles.container}>
            {syncing &&
                <View style={styles.syncingContainer}>
                    <Animated.Image
                        onLayout={_animateLoading}
                        style={{
                            height: 36,
                            width: 36,
                            marginRight: 10,
                            transform: [{
                                rotate: _loadingDeg.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                })
                            }]
                        }}
                        source={require('../../../../../assets/icons/waiting.png')} />
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '500'
                    }}>Syncing your contacts...</Text>
                </View>
            }
            <TouchableOpacity
                onPress={() => {
                    navigation.goBack()
                }}
                activeOpacity={1}
                style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    ...styles.backdrop
                }}>
            </TouchableOpacity>
            {!syncing && <View style={styles.mainContainer}>
                <Image source={require('../../../../../assets/images/follow-contact.png')} />
                <Text style={{
                    fontWeight: '600',
                    fontSize: 22,
                    marginVertical: 10,
                }}>Find People to Follow</Text>
                <Text style={{
                    lineHeight: 20,
                    color: '#666',
                    textAlign: 'center',
                    paddingHorizontal: 25,
                }}>To help people connect on Instagram, you can choose to have your contacts periodically synced and stored on our servers.
                You pick which contacts to follow. Disconnect anytime to stop asyncing.</Text>
                <View style={styles.optionsWrapper}>
                    <TouchableOpacity
                        onPress={_onSyncContactsHandler}
                        style={styles.optionItem}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#318bfb'
                        }}>Get Started</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionItem}>
                        <Text style={{
                            fontSize: 16
                        }}>Learn more</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack()
                        }}
                        style={styles.optionItem}>
                        <Text style={{
                            fontSize: 16
                        }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
            }
        </View >
    )
}

export default FollowContacts

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: "100%",
        justifyContent: 'center',
        alignItems: 'center'
    },
    syncingContainer: {
        zIndex: 1,
        width: '80%',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    backdrop: {
        position: 'absolute',
        height: "100%",
        width: "100%",
        top: 0,
        left: 0,
        zIndex: -1,
    },
    mainContainer: {
        padding: 15,
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionsWrapper: {
        marginVertical: 10,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.1)"
    },
    optionItem: {
        height: 44,
        width: "100%",
        backgroundColor: "#fff",
        justifyContent: 'center',
        alignItems: 'center'
    }
})
