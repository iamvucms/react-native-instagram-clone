import React, { useRef, useState } from 'react'
import { StyleSheet, Text, View, StyleProp, ViewProps, ViewStyle, ScrollView, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { SCREEN_WIDTH } from '../../constants'
import { useEffect } from 'react';
import { date } from 'yup';
export const MONTH_ALIAS = ['Jan', 'Feb', 'Mar',
    'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'
]
const DAY_LIMITS = [31, 28, 31, 30, 31,
    30, 31, 31, 30, 31, 30, 31]
const DATES = [...Array(32).keys()].splice(1, 31);
const YEARS = [...Array(2021).keys()].splice(1900, 121);
export interface DatePickerProps {
    style?: StyleProp<ViewStyle>,
    defaultYear?: number,
    defaultMonth?: 'Jan' | 'Feb' | 'Mar' |
    'Apr' | 'May' | 'Jun' |
    'Jul' | 'Aug' | 'Sep' |
    'Oct' | 'Nov' | 'Dec',
    defaultDate?: number,
    onDateChange?: (date: number) => void,
    onMonthIndexChange?: (index: number) => void,
    onYearChange?: (year: number) => void,
}
const DatePicker = (props: DatePickerProps): JSX.Element => {
    const dateRef = useRef<ScrollView>(null)
    const monthRef = useRef<ScrollView>(null)
    const yearRef = useRef<ScrollView>(null)
    const [activeDateIndex, setActiveDateIndex] = useState<number>(
        props.defaultDate ? DATES.indexOf(props.defaultDate) : 1)
    const [activeMonthIndex, setActiveMonthIndex] = useState<number>(
        props.defaultMonth ? MONTH_ALIAS.indexOf(props.defaultMonth) : 1)
    const [activeYearIndex, setActiveYearIndex] = useState<number>(
        props.defaultYear ? YEARS.indexOf(props.defaultYear) : 1)
    const { _onScrollDate,
        _onScrollMonth,
        _onScrollYear } = scrollEventHandlers(props.onYearChange || Function, props.onMonthIndexChange || Function, props.onDateChange || Function, activeDateIndex, setActiveDateIndex,
            activeMonthIndex, setActiveMonthIndex,
            activeYearIndex, setActiveYearIndex);
    const _onScrollEnd = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>, type: number) => {
        /**
         * TYPE:1 => SCROLLDATE
         * TYPE:2=>SCROLLMONTH
         * TYPE:3=>SCROLLYEAR
         */
        const offsetY = nativeEvent.contentOffset.y;
        const offsetForScroll = offsetY / 44 - Math.floor(offsetY / 44);
        let nextIndex: number = 0;
        if (offsetForScroll > 0.5) nextIndex = Math.floor(offsetY / 44) + 1;
        else nextIndex = Math.floor(offsetY / 44);
        switch (type) {
            case 1:
                dateRef.current?.scrollTo({
                    x: 0,
                    y: nextIndex * 44,
                    animated: true
                })
                break;
            case 2:
                monthRef.current?.scrollTo({
                    x: 0,
                    y: nextIndex * 44,
                    animated: true
                })
                break;
            case 3:
                yearRef.current?.scrollTo({
                    x: 0,
                    y: nextIndex * 44,
                    animated: true
                })
                break;
        }
    }
    const _onSelectMonth = (index: number) => {
        monthRef.current?.scrollTo({
            x: 0,
            y: index * 44
        })
        if (props.onMonthIndexChange) {
            props.onMonthIndexChange(index)
        }
    }
    const _onSelectDate = (index: number) => {
        dateRef.current?.scrollTo({
            x: 0,
            y: index * 44
        })
        if (props.onDateChange) {
            props.onDateChange(DATES[index])
        }
    }
    const _onSelectYear = (index: number) => {
        yearRef.current?.scrollTo({
            x: 0,
            y: index * 44
        })
        if (props.onYearChange) {
            props.onYearChange(YEARS[index])
        }
    }
    return (
        <View style={[styles.container, props.style]}>
            <View style={styles.wrapper}>
                <ScrollView
                    onScrollEndDrag={(e) => {
                        _onScrollEnd(e, 2)
                    }}
                    scrollEventThrottle={30}
                    onScroll={_onScrollMonth}
                    onLayout={() => {
                        monthRef.current?.scrollTo({
                            x: 0,
                            y: activeMonthIndex * 44,
                            animated: false
                        })
                    }}
                    ref={monthRef}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.timeColumn}
                >
                    <View>
                        <TouchableOpacity activeOpacity={1} style={styles.optionItem}>

                        </TouchableOpacity>
                        {MONTH_ALIAS.map((month: string, index: number) => (
                            <TouchableOpacity
                                onPress={_onSelectMonth.bind(null, index)}
                                activeOpacity={1}
                                key={index} style={styles.optionItem}>
                                <Text style={{
                                    color: activeMonthIndex === index ? '#000' : '#666',
                                    fontWeight: activeMonthIndex === index ? '600' : '400',
                                    fontSize: activeMonthIndex === index ? 16 : 14
                                }}>{month}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity activeOpacity={1} style={styles.optionItem}>

                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <ScrollView
                    onScrollEndDrag={(e) => {
                        _onScrollEnd(e, 1)
                    }}
                    scrollEventThrottle={30}
                    onScroll={_onScrollDate}
                    onLayout={() => {
                        dateRef.current?.scrollTo({
                            x: 0,
                            y: activeDateIndex * 44,
                            animated: false
                        })
                    }}
                    ref={dateRef}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.timeColumn}>
                    <View>
                        <TouchableOpacity activeOpacity={1} style={styles.optionItem}>

                        </TouchableOpacity>
                        {DATES.map((date: number, index: number) => (
                            <TouchableOpacity
                                onPress={_onSelectDate.bind(null, index)}
                                activeOpacity={1}
                                key={index} style={styles.optionItem}>
                                <Text style={{
                                    color: activeDateIndex === index ? '#000' : '#666',
                                    fontWeight: activeDateIndex === index ? '600' : '400',
                                    fontSize: activeDateIndex === index ? 16 : 14
                                }}>{date}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity activeOpacity={1} style={styles.optionItem}>

                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <ScrollView
                    onScrollEndDrag={(e) => {
                        _onScrollEnd(e, 3)
                    }}
                    scrollEventThrottle={30}
                    onScroll={_onScrollYear}
                    onLayout={() => {
                        yearRef.current?.scrollTo({
                            x: 0,
                            y: activeYearIndex * 44,
                            animated: false
                        })
                    }}
                    ref={yearRef}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.timeColumn}>
                    <View>
                        <TouchableOpacity activeOpacity={1} style={styles.optionItem}>

                        </TouchableOpacity>
                        {YEARS.map((years: number, index: number) => (
                            <TouchableOpacity
                                onPress={_onSelectYear.bind(null, index)}
                                activeOpacity={1}
                                key={index} style={styles.optionItem}>
                                <Text style={{
                                    color: activeYearIndex === index ? '#000' : '#666',
                                    fontWeight: activeYearIndex === index ? '600' : '400',
                                    fontSize: activeYearIndex === index ? 16 : 14
                                }}>{years}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity activeOpacity={1} style={styles.optionItem}>

                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <View style={styles.activeTopLine}>
                    <View style={styles.blackLine} />
                    <View style={styles.blackLine} />
                    <View style={styles.blackLine} />
                </View>
                <View style={styles.activeBottomLine}>
                    <View style={styles.blackLine} />
                    <View style={styles.blackLine} />
                    <View style={styles.blackLine} />
                </View>
            </View>
        </View>
    )
}

export default DatePicker

const styles = StyleSheet.create({
    container: {
        width: 0.6 * SCREEN_WIDTH,
    },
    wrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 44 * 3,
        overflow: 'hidden'
    },
    timeColumn: {
        width: '32%'
    },
    optionItem: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeTopLine: {
        width: '100%',
        top: 44,
        left: 0,
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    activeBottomLine: {
        width: '100%',
        top: 88,
        left: 0,
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    blackLine: {
        height: 2,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: '32%'
    }
})
function scrollEventHandlers(onYearChange: Function, onMonthIndexChange: Function, onDateChange: Function, activeDateIndex: number, setActiveDateIndex: React.Dispatch<React.SetStateAction<number>>, activeMonthIndex: number, setActiveMonthIndex: React.Dispatch<React.SetStateAction<number>>, activeYearIndex: number, setActiveYearIndex: React.Dispatch<React.SetStateAction<number>>) {
    const _onScrollDate = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {

        const offsetY = nativeEvent.contentOffset.y;
        const offsetForScroll = offsetY / 44 - Math.floor(offsetY / 44);
        let nextIndex: number = 0;
        if (offsetForScroll > 0.5) {
            nextIndex = Math.floor(offsetY / 44) + 1;
        }
        else
            nextIndex = Math.floor(offsetY / 44);
        if (activeDateIndex !== nextIndex) {
            setActiveDateIndex(nextIndex);
            onDateChange(DATES[nextIndex])
        }

    };
    const _onScrollMonth = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = nativeEvent.contentOffset.y;

        const offsetForScroll = offsetY / 44 - Math.floor(offsetY / 44);
        console.log(offsetForScroll)
        let nextIndex: number = 0;
        if (offsetForScroll > 0.5) {
            nextIndex = Math.floor(offsetY / 44) + 1;
        }
        else
            nextIndex = Math.floor(offsetY / 44);
        if (activeMonthIndex !== nextIndex) {
            setActiveMonthIndex(nextIndex);
            onMonthIndexChange(nextIndex)
        }

    };
    const _onScrollYear = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = nativeEvent.contentOffset.y;
        const offsetForScroll = offsetY / 44 - Math.floor(offsetY / 44);
        let nextIndex: number = 0;
        if (offsetForScroll > 0.5) {
            nextIndex = Math.floor(offsetY / 44) + 1;
        }
        else
            nextIndex = Math.floor(offsetY / 44);
        if (activeYearIndex !== nextIndex) {
            setActiveYearIndex(nextIndex)
            onYearChange(YEARS[nextIndex])
        }

    };
    return { _onScrollDate, _onScrollMonth, _onScrollYear };
}

