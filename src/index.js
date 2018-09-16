import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

const jsx = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

const root = document.getElementById('root')

ReactDOM.hydrate(jsx, root)
registerServiceWorker()
