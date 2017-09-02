import React from "react"
import ReactDOM from "react-dom"
import { Provider }  from 'react-redux'

import store from "./store"
import App from './App'
import './index.css'

const Root = <Provider store={store}><App /></Provider>

ReactDOM.render(Root, document.querySelector('#app'))

if (module.hot) module.hot.accept()
