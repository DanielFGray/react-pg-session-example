import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './Auth.ctx'
import App from './App'
import './styles.css'

const Init = (
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>
)

ReactDOM.render(Init, document.getElementById('root'))
