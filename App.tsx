/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import RootStackNavigation from './src/navigations'
import { Provider } from 'react-redux'
import store from './src/store'
const App = () => {
  return (
    <Provider store={store}>
      <RootStackNavigation />
    </Provider>
  );
};

const styles = StyleSheet.create({
});

export default App;
