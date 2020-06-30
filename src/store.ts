import { createStore, applyMiddleware, compose } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['user', 'messages']
}
import rootReducer from './reducers/'

const persistedReducer = persistReducer(persistConfig, rootReducer)

import thunk from 'redux-thunk';
const middlewares = [thunk]
const enhancers = [applyMiddleware(...middlewares)]
export const store = createStore(persistedReducer, compose(...enhancers))
export const persistor = persistStore(store)