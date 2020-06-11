import '@firebase/auth';
import '@firebase/firestore';
// import firestore from '@react-native-firebase/firestore'
import * as firebase from 'firebase';
import { Dimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SettingComponents from '../screens/Home/Account/Setting';
import { defaultUserState } from '../reducers/userReducer';
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
//Add default Setting
// firebase.firestore().collection('users').get().then(docs => {
//     docs.forEach(doc => {
//         if (doc.data().username !== 'vucms') {
//             doc.ref.update({
//                 notificationSetting: defaultUserState.setting?.notification,
//                 privacySetting: defaultUserState.setting?.privacy,
//             })
//         }
//     })
// })
//Add Keyword
// firebase.firestore().collection('users').get().then(x => {
//     x.docs.map(d => {
//         d.ref.update({
//             keyword: generateUsernameKeywords(d.data().username)
//         })
//     })
// })
export const MAPBOX_ACCESS_TOKEN = 'sk.eyJ1IjoidnVjbXMwMjAyIiwiYSI6ImNrYjZqNGlnNDEwNmUycm1pc2d6Y2trbGMifQ.ax-o4ToG3gEb-lQSaqdRjw'
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
export const DEFAULT_PHOTO_URI = 'https://www.pavilionweb.com/wp-content/uploads/2017/03/man-300x300.png'
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
export type SettingNavigation = {
    icon?: string,
    name: string,
    component: () => JSX.Element,
    navigationName: string,
    child?: SettingNavigation[]
}
export const settingNavigationMap: SettingNavigation[] = [
    {
        icon: 'account-plus-outline',
        name: 'Follow and Invite Friends',
        navigationName: 'FollowFriendSetting',
        component: SettingComponents.FollowFriends,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contacts',
                component: SettingComponents.FollowContacts,
                navigationName: 'FollowContact',
            },
            {
                icon: 'email-outline',
                name: 'Invite Friends by Email',
                component: SettingComponents.InviteByEmail,
                navigationName: 'InviteByEmail',
            },
            {
                icon: 'comment-outline',
                name: 'Invite Friends by SMS',
                component: SettingComponents.InviteBySMS,
                navigationName: 'InviteBySMS',
            },
            {
                icon: 'share-outline',
                name: 'Invite Friends by...',
                component: SettingComponents.InviteByOther,
                navigationName: 'InviteByOther',
            }
        ]
    },
    {
        icon: 'bell-outline',
        name: 'Notifications',
        navigationName: 'NotificationsSetting',
        component: SettingComponents.Notifications,
        child: [
            {
                name: 'Posts, Stories and Comments',
                component: SettingComponents.PostStoryComment,
                navigationName: 'PostStoryComment',
            }, {
                name: 'Following and Followers',
                component: SettingComponents.FollowingFollower,
                navigationName: 'FollowingFollower',
            }, {
                name: 'Direct Messages',
                component: SettingComponents.DirectMessages,
                navigationName: 'DirectMessages',
            }, {
                name: 'Live and IGTV',
                component: SettingComponents.LiveIGTV,
                navigationName: 'LiveIGTV',
            }, {
                name: 'From Instagram',
                component: SettingComponents.FromInstagram,
                navigationName: 'FromInstagram',
            }, {
                name: 'SMS and Email',
                component: SettingComponents.EmailAndSMS,
                navigationName: 'EmailAndSMS',
            }
        ]
    }, {
        icon: 'lock-outline',
        name: 'Privacy',
        navigationName: 'PrivacySetting',
        component: SettingComponents.Privacy,
        child: [
            {
                icon: 'comment-outline',
                name: 'Comments',
                component: SettingComponents.Comments,
                navigationName: 'Comments',
            },
            {
                icon: 'tooltip-image-outline',
                name: 'Tags',
                component: SettingComponents.Tags,
                navigationName: 'Tags',
            },
            {
                icon: 'plus-outline',
                name: 'Story',
                component: SettingComponents.Story,
                navigationName: 'StoryPrivacy',
            },
            {
                icon: 'account-check-outline',
                name: 'Activity Status',
                component: SettingComponents.ActivityStatus,
                navigationName: 'ActivityStatus',
            },
            {
                icon: 'lock',
                name: 'Account Privacy',
                component: SettingComponents.AccountPrivacy,
                navigationName: 'AccountPrivacy',
            },
            {
                icon: 'eye-off-outline',
                name: 'Restricted Accounts',
                component: SettingComponents.RestrictedAccounts,
                navigationName: 'RestrictedAccounts',
            },
            {
                icon: 'block-helper',
                name: 'Blocked Accounts',
                component: SettingComponents.BlockedAccounts,
                navigationName: 'BlockedAccounts',
            },
            {
                icon: 'bell-off-outline',
                name: 'Muted Accounts',
                component: SettingComponents.MutedAccounts,
                navigationName: 'MutedAccounts',
            },
            {
                icon: 'account-star',
                name: 'Close Friends',
                component: SettingComponents.CloseFriends,
                navigationName: 'CloseFriends1',
            },
            {
                icon: 'account-multiple-outline',
                name: 'Accounts You Follow',
                component: SettingComponents.AccountYouFollow,
                navigationName: 'Account YouFollow',
            }
        ]
    }, {
        icon: 'shield-check-outline',
        name: 'Security',
        navigationName: 'SecuritySetting',
        component: SettingComponents.Security,
        child: [
            {
                icon: 'key-variant',
                name: 'Password',
                component: SettingComponents.Password,
                navigationName: 'PasswordModify',
            }, {
                icon: 'crosshairs',
                name: 'Login Activity',
                component: SettingComponents.LoginActivity,
                navigationName: 'LoginActivity',
            }, {
                icon: 'account-clock-outline',
                name: 'Saved Login Info',
                component: SettingComponents.SavedLoginInfo,
                navigationName: 'SavedLoginInfo',
            }, {
                icon: 'two-factor-authentication',
                name: 'Two Factor Authentication',
                component: SettingComponents.TwoFactor,
                navigationName: 'TwoFactor',
            }, {
                icon: 'email-outline',
                name: 'Email From Instagram',
                component: SettingComponents.EmailFromInstagram,
                navigationName: 'EmailFromInstagram',
            }
        ]
    }, {
        icon: 'bullhorn-outline',
        name: 'Ads',
        navigationName: 'AdsSetting',
        component: SettingComponents.Ads,
        child: [
            {
                name: 'Ad Activity',
                component: SettingComponents.AdActivity,
                navigationName: 'AdActivity',
            },
            {
                name: 'About Ads',
                component: SettingComponents.AboutAds,
                navigationName: 'AboutAds',
            }
        ]
    }, {
        icon: 'account-circle-outline',
        name: 'Account',
        navigationName: 'AccountSetting',
        component: SettingComponents.Account,
        child: [
            {
                name: 'Your Activity',
                component: SettingComponents.YourActivity,
                navigationName: 'YourActivity',
            },
            {
                name: 'Saved',
                component: SettingComponents.Saved,
                navigationName: 'Saved',
            },
            {
                name: 'Close Friends',
                component: SettingComponents.CloseFriends,
                navigationName: 'CloseFriends',
            }, {
                name: 'Language',
                component: SettingComponents.Language,
                navigationName: 'Language',
            }, {
                name: 'Browser Autofill',
                component: SettingComponents.BrowserAutofill,
                navigationName: 'BrowserAutofill',
            }, {
                name: 'Contacts Syncing',
                component: SettingComponents.ContactSync,
                navigationName: 'ContactSync',
            }, {
                name: 'Linked Accounts',
                component: SettingComponents.LinkedAccounts,
                navigationName: 'LinkedAccounts',
            }, {
                name: 'Request Verification',
                component: SettingComponents.RequestVerification,
                navigationName: 'RequestVerification',
            },
            {
                name: `Posts You've Liked`,
                component: SettingComponents.PostYouLiked,
                navigationName: 'PostYouLiked',
            }
        ]
    },
    {
        icon: 'help-circle-outline',
        name: 'Help',
        navigationName: 'HelpSetting',
        component: SettingComponents.Help,
        child: [
            {
                name: 'Report a Problem',
                component: SettingComponents.ReportProblem,
                navigationName: 'ReportProblem',
            },
            {
                name: 'Help Center',
                component: SettingComponents.HelpCenter,
                navigationName: 'HelpCenter',
            },
            {
                name: 'Privacy and Security Help',
                component: SettingComponents.PrivacySecurityHelp,
                navigationName: 'PrivacySecurityHelp',
            }
        ]
    }, {
        icon: 'alert-circle-outline',
        name: 'About',
        navigationName: 'AboutSetting',
        component: SettingComponents.About,
        child: [
            {
                name: 'App Updates',
                component: SettingComponents.AppUpdate,
                navigationName: 'AppUpdate',
            }, {
                name: 'Data Policy',
                component: SettingComponents.DataPolicy,
                navigationName: 'DataPolicy',
            }, {
                name: 'Term of Use',
                component: SettingComponents.Term,
                navigationName: 'Term',
            }
        ]
    }
]