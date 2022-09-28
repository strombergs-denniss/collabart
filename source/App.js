import { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import Context from './Context'
import { setUser, setUsers } from './userSlice'
import { userQuery } from './Firebase'
import Auth from './Auth'
import Home from './Home'
import Stories from './Stories'
import Story from './Story'
import './App.less'

function App() {
    const dispatch = useDispatch()
    const { db, auth } = useContext(Context)
    const user = useSelector(state => state.user.user)
    const users = useSelector(state => state.user.users)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            dispatch(setUser({
                id: user.uid
            }))
            setIsLoading(false)
        })

        onSnapshot(userQuery(db), collection => {
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
            <div className="App">
                Loading
            </div>
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
