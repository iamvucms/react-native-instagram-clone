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
import { StyleSheet, YellowBox } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import RootStackNavigation from './src/navigations'
import { Provider } from 'react-redux'
import { persistor, store } from './src/store'
import { PersistGate } from 'redux-persist/integration/react'
YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state',
]);
const App = () => {
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
