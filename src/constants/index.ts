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
// const firebaseConfig = {
//     apiKey: "AIzaSyATgIePHiOXnqlzUN4rRyyaPw4CTWH7yWA",
//     authDomain: "vucms-7f6fa.firebaseapp.com",
//     databaseURL: "https://vucms-7f6fa.firebaseio.com",
//     projectId: "vucms-7f6fa",
//     storageBucket: "vucms-7f6fa.appspot.com",
//     messagingSenderId: "62284682844",
//     appId: "1:62284682844:web:ef8af00934e5fa64dbf899"
// };

firebase.initializeApp(firebaseConfig)
// firebase.firestore().collectionGroup('comments')
//     .where('userId', '==', 'vucms').get().then(x => console.warn(x.docs[0].data()))
// Refresh stories expired
// firebase.firestore().collection('stories').get().then(docs => {
//     docs.forEach(doc => doc.ref.update({
//         create_at: new Date()
//     }))
// })
const sources = [
    'https://www.statnews.com/wp-content/uploads/2019/05/GettyImages-484960237-645x645.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSAFHzgUiwqYL_SoXWfUYVC8iDOEKyvNSQZHZMXIM81SuH64_3E&usqp=CAU',
    'https://r-cf.bstatic.com/images/hotel/max1024x768/206/206081932.jpg',
    'https://media-cdn.tripadvisor.com/media/photo-s/0a/67/34/d3/peaceful-place-in-phan.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT3nz_ua7NkXgQBbfNE4okGZJgf_WZ79pRozAWra0LJ76r3VSxx&usqp=CAU',
    'https://www.baodanang.vn/dataimages/201904/original/images1508152_Hinh_1.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQt_QacIEhOwHXBKrETxPYVP796OZyZPKgdVWlplbxz29BRB6OG&usqp=CAU',
    'https://cdn.tinybuddha.com/wp-content/uploads/2010/03/Peaceful.png',
    'https://pix10.agoda.net/hotelImages/545437/-1/3e3de077901fd04bcbf4ba1435bb9e37.jpg?s=1024x768',
    'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
]
// setInterval(() => {
//     const uid = new Date().getTime()
//     const ref = firebase.firestore()
//     ref.collection('posts').doc(`${uid}`).set({
//         uid,
//         userId: 'vucms',
//         source: [
//             sources[Math.floor(Math.random() * sources.length)]
//         ],
//         content: "Hi, I'm @vucms, a react native developer",
//         create_at: new Date(),
//         likes: ['vucms', 'vucms0202'],
//         isVideo: false,
//         permission: 1
//     })
// }, 1000)
export const STATUS_BAR_HEIGHT: number = getStatusBarHeight()
export const SCREEN_HEIGHT: number = Math.round(Dimensions.get('window').height)
export const SCREEN_WIDTH: number = Math.round(Dimensions.get('window').width)

export const LIMIT_POSTS_PER_LOADING = 2
export const LIMIT_COMMENTS_PER_LOADING = Math.floor(
    (SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - 80 - 60) / 54) + 2
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
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    FETCH_EXTRA_INFO_REQUEST: 'FETCH_EXTRA_INFO_REQUEST',
    FETCH_EXTRA_INFO_SUCCESS: 'FETCH_EXTRA_INFO_SUCCESS',
    FETCH_EXTRA_INFO_FAILURE: 'FETCH_EXTRA_INFO_FAILURE',
    UNFOLLOW_REQUEST: 'UNFOLLOW_REQUEST',
    UNFOLLOW_SUCCESS: 'UNFOLLOW_SUCCESS',
    UNFOLLOW_FAILURE: 'UNFOLLOW_FAILURE'
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
    TOGGLE_LIKE_POST_REQUEST: 'TOGGLE_LIKE_POST_REQUEST',
    TOGGLE_LIKE_POST_SUCCESS: 'TOGGLE_LIKE_POST_SUCCESS',
    TOGGLE_LIKE_POST_FAILURE: 'TOGGLE_LIKE_POST_FAILURE',
}
export const commentActionTypes = {
    FETCH_COMMENTS_REQUEST: 'FETCH_COMMENTS_REQUEST',
    FETCH_COMMENTS_SUCCESS: 'FETCH_COMMENTS_SUCCESS',
    FETCH_COMMENTS_FAILURE: 'FETCH_COMMENTS_FAILURE',
    LOAD_MORE_COMMENTS_REQUEST: 'LOAD_MORE_COMMENTS_REQUEST',
    LOAD_MORE_COMMENTS_SUCCESS: 'LOAD_MORE_COMMENTS_SUCCESS',
    LOAD_MORE_COMMENTS_FAILURE: 'LOAD_MORE_COMMENTS_FAILURE',
    TOGGLE_LIKE_COMMENT_REQUEST: 'TOGGLE_LIKE_COMMENT_REQUEST',
    TOGGLE_LIKE_COMMENT_SUCCESS: 'TOGGLE_LIKE_COMMENT_SUCCESS',
    TOGGLE_LIKE_COMMENT_FAILURE: 'TOGGLE_LIKE_COMMENT_FAILURE',
    TOGGLE_LIKE_REPLY_REQUEST: 'TOGGLE_LIKE_REPLY_REQUEST',
    TOGGLE_LIKE_REPLY_SUCCESS: 'TOGGLE_LIKE_REPLY_SUCCESS',
    TOGGLE_LIKE_REPLY_FAILURE: 'TOGGLE_LIKE_REPLY_FAILURE',
    REPLY_COMMENT_REQUEST: 'REPLY_COMMENT_REQUEST',
    REPLY_COMMENT_SUCCESS: 'REPLY_COMMENT_SUCCESS',
    REPLY_COMMENT_FAILURE: 'REPLY_COMMENT_FAILURE',
}