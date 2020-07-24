/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, YellowBox, AppState } from 'react-native';
import { Provider } from 'react-redux';
import SplashScreen from 'react-native-splash-screen'
import { PersistGate } from 'redux-persist/integration/react';
import RootStackNavigation from './src/navigations';
import { persistor, store } from './src/store';
import { getImageClass, convertToFirebaseDatabasePathName } from './src/utils';
import { firestore, database } from 'firebase';
import { Post } from './src/reducers/postReducer';
YellowBox.ignoreWarnings([
	'',
]);
const App = () => {
	const myUsername = store.getState().user.user?.userInfo?.username
	const ref = useRef<{ itv: NodeJS.Timeout }>({
		itv: setInterval(() => { }, 3000)
	})
	useEffect(() => {
		clearInterval(ref.current.itv)
		SplashScreen.hide()
		// const db = firestore()
		// db.collection('posts').get().then(rs => {
		// 	rs.docs.map(doc => {
		// 		const post: Post = doc.data() as Post
		// 		if (post.source) {
		// 			const tasks = post.source.map(async x => {
		// 				const className = await getImageClass(x.uri)
		// 				return className
		// 			})
		// 			Promise.all(tasks).then(classes => {
		// 				doc.ref.update({
		// 					labels: classes
		// 				})
		// 			})
		// 		}
		// 	})
		// })
		if (myUsername) {
			// limit functions quota
			ref.current.itv = setInterval(() => {
				if (AppState.currentState === 'active') {
					database().ref(`/online/${convertToFirebaseDatabasePathName(myUsername)}`)
						.update({
							last_online: new Date().getTime(),
							status: 1
						})
				}
			}, 60000)
		}
	}, [])
	console.log("render")
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<RootStackNavigation />
			</PersistGate>
		</Provider>
	);
};

const styles = StyleSheet.create({
});

export default App;
