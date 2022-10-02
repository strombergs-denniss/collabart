import './App.less'

import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Auth from './Auth'
import Context from './Context'
import { usersQuery } from './Firebase'
import Home from './Home'
import Loader from './Loader'
import Stories from './Stories'
import Story from './Story'
import { setUser, setUsers } from './userSlice'

function App() {
    const dispatch = useDispatch()
    const { db, auth } = useContext(Context)
    const user = useSelector(state => state.user.user)
    const users = useSelector(state => state.user.users)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                dispatch(setUser({
                    id: user.uid
                }))
            }

            setIsLoading(false)
        })

        onSnapshot(usersQuery(db), collection => {
            const users = []

            collection.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            dispatch(setUsers(users))
        })
    }, [])

    if (isLoading || !users.length) {
        return (
            <Loader />
        )
    }

    if (!user) {
        return (
            <Auth />
        )
    }

    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={ <Home /> } />
                    <Route path="/stories" element={ <Stories /> } />
                    <Route path="/stories/:id" element={ <Story /> } />
                </Routes>
            </Router>
        </div>
    )
}

export default App
