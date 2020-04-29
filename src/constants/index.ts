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
firebase.initializeApp(firebaseConfig)
// firebase.firestore().collectionGroup('comments')
//     .where('userId', '==', 'vucms').get().then(x => console.warn(x.docs[0].data()))
// Refresh stories expired
// firebase.firestore().collection('stories').get().then(docs => {
//     docs.forEach(doc => doc.ref.update({
//         create_at: new Date()
//     }))
// })
export const STATUS_BAR_HEIGHT: number = getStatusBarHeight()
export const SCREEN_HEIGHT: number = Math.round(Dimensions.get('window').height)
export const SCREEN_WIDTH: number = Math.round(Dimensions.get('window').width)

export const LIMIT_PER_LOADING = 2
export const seenTypes = {
    NOTSEEN: 0,
    SEEN: 1,
}
export const userActionTypes = {
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    REGISTER_REQUEST: 'REGISTER_REQUEST',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE'
}
export const storyActionTypes = {
    FETCH_STORY_LIST_REQUEST: 'FETCH_STORY_LIST_REQUEST',
    FETCH_STORY_LIST_SUCCESS: 'FETCH_STORY_LIST_SUCCESS',
    FETCH_STORY_LIST_FAILURE: 'FETCH_STORY_LIST_FAILURE',
}
export const postActionTypes = {
    FETCH_POST_LIST_REQUEST: 'FETCH_POST_LIST_REQUEST',
    FETCH_POST_LIST_SUCCESS: 'FETCH_POST_LIST_SUCCESS',
    FETCH_POST_LIST_FAILURE: 'FETCH_POST_LIST_FAILURE',
    LOAD_MORE_POST_LIST_REQUEST: 'LOAD_MORE_POST_LIST_REQUEST',
    LOAD_MORE_POST_LIST_SUCCESS: 'LOAD_MORE_POST_LIST_SUCCESS',
    LOAD_MORE_POST_LIST_FAILURE: 'LOAD_MORE_POST_LIST_FAILURE',
    COMMENT_POST_REQUEST: 'COMMENT_POST_REQUEST',
    COMMENT_POST_SUCCESS: 'COMMENT_POST_SUCCESS',
    COMMENT_POST_FAILURE: 'COMMENT_POST_FAILURE',
}