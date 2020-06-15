import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, TextInput, View, SafeAreaView, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH } from '../../../constants'

const index = () => {
    const [query, setQuery] = useState<string>('')
    const [typing, setTyping] = useState<boolean>(false)
    const inputRef = useRef<TextInput>(null)
    useEffect(() => {
        if (query.length > 0) {

        }
    }, [query])
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchWrapper}>
                {typing ? (
                    <TouchableOpacity
                        onPress={() => {
                            setTyping(false)
                            inputRef.current?.blur()
                        }}
                        style={styles.squareBtn}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                ) : (
                        <View style={styles.squareBtn}>
                            <Icon name="magnify" size={20} />
                        </View>
                    )}
                <TextInput
                    ref={inputRef}
                    onFocus={setTyping.bind(null, true)}
                    placeholder="Search"
                    onChangeText={setQuery}
                    value={query}
                    autoCapitalize="none"
                    style={{
                        ...styles.searchInput,
                        width: SCREEN_WIDTH - (typing ? 44 : 88),
                    }}
                />
                {!typing && <TouchableOpacity style={styles.squareBtn}>
                    <Icon name="qrcode-scan" size={20} />
                </TouchableOpacity>}

            </View>
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{
                    height: 40,
                    alignItems: 'center'
                }}
                style={styles.labelWrapper}>
                <TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity><TouchableOpacity style={styles.labelItem}>
                    <Icon name="shopping" size={16} />
                    <Text style={{
                        marginLeft: 5,
                        fontWeight: "500"
                    }}>Shop</Text>
                </TouchableOpacity>
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
    searchWrapper: {
        width: '100%',
        height: 44,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    searchInput: {
        height: '100%',

        fontSize: 16
    },
    labelWrapper: {
        maxHeight: 40,
    },
    squareBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    labelItem: {
        flexDirection: 'row',
        height: 28,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: 'center',
        marginHorizontal: 5,
    }
})
