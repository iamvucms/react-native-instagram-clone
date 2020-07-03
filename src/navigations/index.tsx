import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import { ExtraPost } from '../reducers/postReducer';
import { ProfileX } from '../reducers/profileXReducer';
import { HashTag, UserInfo } from '../reducers/userReducer';
import DiscoverPeople from '../screens/Home/Account/DiscoverPeople';
import EditProfile from '../screens/Home/Account/EditProfile';
import GalleryChooser, { ProcessedImage } from '../screens/Home/Account/GalleryChooser';
import LocationChooser from '../screens/Home/Account/LocationChooser';
import MuteOptions from '../screens/Home/Account/MuteOptions';
import NotificationOptions from '../screens/Home/Account/NotificationOptions';
import CloseFriends from '../screens/Home/Account/Setting/Privacy/CloseFriends';
import HideStoryFrom from '../screens/Home/Account/Setting/Privacy/HideStoryFrom';
import StoryPravicy from '../screens/Home/Account/Setting/Privacy/Story';
import TagPeople from '../screens/Home/Account/TagPeople';
import HashtagScreen from '../screens/Home/Explore/Hashtag';
import LocationScreen from '../screens/Home/Explore/Location';
import ProfileXScreen from '../screens/Home/Explore/ProfileX';
import ProfileXFollow from '../screens/Home/Explore/ProfileXFollow';
import PostDetail from '../screens/Home/PostDetail';
import FeedbackOptions from '../screens/Others/FeedbackOptions';
import PostOptions from '../screens/Others/PostOptions';
import PreUploadSuperImage from '../screens/Others/PreUploadSuperImage';
import ProfileInteractionOptions from '../screens/Others/ProfileInteractionOptions';
import ProfileOptions from '../screens/Others/ProfileOptions';
import ShareToDirect from '../screens/Others/ShareToDirect';
import StoryProcessor, { StoryProcessedImage } from '../screens/Others/StoryProcessor';
import StoryTaker, { StoryImageSpec } from '../screens/Others/StoryTaker';
import Comment from '../screens/Root/Comment';
import StoryFullView from '../screens/Root/StoryFullView';
import { MapBoxAddress } from '../utils';
import { navigationRef } from './rootNavigation';
import RootTab from './RootTab';
import Conversation from '../screens/Others/Direct/Conversation'
import ImageFullView from '../screens/Others/Direct/ImageFullView';
import EmojiOptions from '../screens/Others/Direct/EmojiOptions';
export type SuperRootStackParamList = {
    RootTab: undefined,
    Comment: {
        postId: number,
        postData?: ExtraPost
    },
    PostOptions: {
        item: ExtraPost,
        setPost?: React.Dispatch<React.SetStateAction<ExtraPost>>
    },
    EditProfile: undefined,
    GalleryChooser: { isChooseProfilePhoto?: boolean },
    TagPeople: {
        images: ProcessedImage[],
        onDone?: (images: ProcessedImage[]) => void
    },
    LocationChooser: {
        address?: MapBoxAddress,
        onDone?: (address: MapBoxAddress) => void
    },
    NotificationOptions: {
        user: UserInfo
    },
    MuteOptions: {
        user: UserInfo
    },
    DiscoverPeople: undefined,
    PostDetail: {
        postId: number
    },
    ProfileOptions: {
        userX: ProfileX
    },
    ProfileInteractionOptions: {
        userX: ProfileX,
        followType: 1 | 2 | 3,
        setFollowType: React.Dispatch<React.SetStateAction<number>>
    },
    FeedbackOptions: {
        hashtag: HashTag
    },
    ShareToDirect: {
        item: MapBoxAddress | ExtraPost
    },
    StoryPrivacy: undefined,
    CloseFriends: undefined,
    HideStoryFrom: undefined
    StoryProcessor: {
        images: StoryImageSpec[]
    },
    PreUploadSuperImage: {
        images: StoryProcessedImage[]
    },
    StoryFullView: {
        groupIndex: number
    },
    ProfileX: undefined,
    Hashtag: undefined,
    Location: undefined,
    AccountIndex: undefined,
    ProfileXFollow: undefined,
    StoryTaker: {
        sendToDirect?: boolean,
        username?: string
    },
    Conversation: {
        username: string
    },
    ImageFullView: {
        pX: number,
        pY: number,
        pH: number,
        pW: number,
        oH: number,
        oW: number,
        pScale: number,
        uri: string
    },
    EmojiOptions: {
        targetUsername: string
    }
};
const RootStack = createStackNavigator<SuperRootStackParamList>()
const index = (): JSX.Element => {
    const navigationOptions: StackNavigationOptions = {
        headerShown: false,
        gestureEnabled: false,
        cardStyle: {
        }
    }
    return (
        <NavigationContainer ref={navigationRef}>
            <RootStack.Navigator
                initialRouteName='RootTab'
                screenOptions={navigationOptions}>
                <RootStack.Screen name="RootTab" component={RootTab} />
                <RootStack.Screen name="Comment" component={Comment} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="PostOptions" component={PostOptions} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="ProfileOptions" component={ProfileOptions} />
                <RootStack.Screen options={{
                    animationEnabled: false,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="EditProfile" component={EditProfile} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                }} name="GalleryChooser" component={GalleryChooser} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                }} name="TagPeople" component={TagPeople} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                }} name="LocationChooser" component={LocationChooser} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="NotificationOptions" component={NotificationOptions} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="MuteOptions" component={MuteOptions} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="FeedbackOptions" component={FeedbackOptions} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="ShareToDirect" component={ShareToDirect} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                }} component={StoryProcessor} name="StoryProcessor" />
                <RootStack.Screen component={PreUploadSuperImage} name="PreUploadSuperImage" />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="ProfileInteractionOptions" component={ProfileInteractionOptions} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    gestureEnabled: true,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="StoryFullView" component={StoryFullView} />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                    gestureEnabled: true,
                    cardStyle: { backgroundColor: 'transparent' }
                }} name="EmojiOptions" component={EmojiOptions} />
                <RootStack.Screen name="ProfileX" component={ProfileXScreen} />
                <RootStack.Screen name="Hashtag" component={HashtagScreen} />
                <RootStack.Screen name="Location" component={LocationScreen} />
                <RootStack.Screen name="ProfileXFollow" component={ProfileXFollow} />
                <RootStack.Screen component={DiscoverPeople} name="DiscoverPeople" />
                <RootStack.Screen component={PostDetail} name="PostDetail" />
                <RootStack.Screen component={StoryPravicy} name="StoryPrivacy" />
                <RootStack.Screen component={CloseFriends} name="CloseFriends" />
                <RootStack.Screen component={HideStoryFrom} name="HideStoryFrom" />
                <RootStack.Screen options={{
                    ...TransitionPresets.ModalTransition,
                }} name="StoryTaker" component={StoryTaker} />
                <RootStack.Screen name="Conversation" component={Conversation} />
                <RootStack.Screen options={{
                    cardStyle: { backgroundColor: 'transparent' },
                    animationEnabled: false
                }} name="ImageFullView" component={ImageFullView} />
            </RootStack.Navigator>
        </NavigationContainer>
    )
}
export default index

