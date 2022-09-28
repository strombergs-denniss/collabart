import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import Context from './Context'
import store from './store'
import App from './App'

const firebase = initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
})
const db = getFirestore(firebase)
const auth = getAuth()
const value = {
    db,
    auth
}

createRoot(document.getElementById('root')).render(
    <Context.Provider value={ value }>
        <Provider store={ store }>
            <App />
        </Provider>
    </Context.Provider>
)
