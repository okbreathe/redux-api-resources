import React from "react"
import ReactDOM from "react-dom"
import { createStore, applyMiddleware, combineReducers } from "redux"
import { Provider }  from 'react-redux'
import thunkMiddleware from "redux-thunk"

import resourceReducers from "./reducers/resources"
import App from './app'
import './index.css'

const store = createStore( combineReducers({ ...resourceReducers }), applyMiddleware(thunkMiddleware) )

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('./reducers/resources', () => {
    const nextRootReducer = require('./reducers/resources').default
    store.replaceReducer(nextRootReducer)
  })
}

const Root = <Provider store={store}><App /></Provider>

ReactDOM.render(Root, document.querySelector('#app'))
