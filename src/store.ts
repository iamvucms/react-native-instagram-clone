import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducers/index'
import thunk from 'redux-thunk';
const middlewares = [thunk]
const enhancers = [applyMiddleware(...middlewares)]
let store = createStore(reducer, compose(...enhancers))
export default store
