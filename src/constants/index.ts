import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Dimensions } from 'react-native'

// import firestore from '@react-native-firebase/firestore'
import * as firebase from 'firebase'
import '@firebase/firestore'
import '@firebase/auth'
const firebaseConfig = {
    apiKey: "AIzaSyATgIePHiOXnqlzUN4rRyyaPw4CTWH7yWA",
    authDomain: "vucms-7f6fa.firebaseapp.com",
    databaseURL: "https://vucms-7f6fa.firebaseio.com",
    projectId: "vucms-7f6fa",
    storageBucket: "vucms-7f6fa.appspot.com",
    messagingSenderId: "62284682844",
    appId: "1:62284682844:web:ef8af00934e5fa64dbf899"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export const STATUS_BAR_HEIGHT: number = getStatusBarHeight()
export const SCREEN_HEIGHT: number = Math.round(Dimensions.get('window').height)
export const SCREEN_WIDTH: number = Math.round(Dimensions.get('window').width)

export const userActionTypes = {
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    REGISTER_REQUEST: 'REGISTER_REQUEST',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE'
}