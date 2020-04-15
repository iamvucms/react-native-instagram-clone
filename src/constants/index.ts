import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Dimensions } from 'react-native'
import firestore from '@react-native-firebase/firestore'
export const db = firestore()

export const STATUS_BAR_HEIGHT: number = getStatusBarHeight()
export const SCREEN_HEIGHT: number = Math.round(Dimensions.get('window').height)
export const SCREEN_WIDTH: number = Math.round(Dimensions.get('window').width)
export const userActionTypes = {
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE'
}