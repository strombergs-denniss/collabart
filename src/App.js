import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Form, Input, Button, List } from 'antd'
import { createLine, deleteLine } from './Firebase'
import 'antd/dist/antd.css'
import './App.css'

const firebase = initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
})
const firestore = getFirestore(firebase)
const auth = getAuth()

function Auth() {
    const [mode, setMode] = useState(true)

    const onFinish = values => {
        const { email, password } = values

        if (mode) {
            signInWithEmailAndPassword(auth, email, password)
                .then(credential => {
                    console.log(credential.user)
                })
                .catch(error => {
                    console.error(error)
                })
        } else {
            createUserWithEmailAndPassword(auth, email, password)
                .then(credential => {
                    console.log(credential.user)
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }

    const onSwitchMode = () => {
        setMode(!mode)
    }

    return (
        <Form onFinish={ onFinish }>
            <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', required: true, message: 'Email must not be empty' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Password must not be empty' }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    { mode ? 'Sign In' : 'Create' }
                </Button>
                <Button type="link" htmlType="button" onClick={ onSwitchMode }>
                    { mode ? 'Create' : 'Sign In' }
                </Button>
            </Form.Item>
        </Form>
    )
}

function Lines() {
    const [lines, setLines] = useState([])
    const [input, setInput] = useState('')
    
    useEffect(() => {
        const lineQuery = query(collection(firestore, 'lines'), orderBy('timestamp'))

        onSnapshot(lineQuery, snapshot => {
            const lines = []

            snapshot.forEach(doc => {
                lines.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            setLines(lines)
        })
    }, [])

    const renderItem = item => {
        const { id, data } = item

        const onDelete = () => {
            deleteLine(firestore, id)
        }

        return (
            <List.Item
                actions={[
                    <a onClick={ onDelete } key="delete">Delete</a>
                ]}
            >
                { data }
            </List.Item>
        )
    }

    const onPressEnter = e => {
        e.preventDefault()

        if (input) {
            createLine(firestore, { data: input })
            setInput('')
        }
    }

    const onChange = e => {
        setInput(e.target.value)
    }

    return (
        <div className="Lines">
            <div className="Lines-Wrapper">
                <List
                    dataSource={ lines }
                    renderItem={ renderItem }
                />
            </div>
            <Input.TextArea value={ input } showCount rows={ 2 } maxLength={ 640 } onPressEnter={ onPressEnter } onChange={ onChange } autoSize />
        </div>
    )
}

function App() {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            setUser(user)
            setIsLoading(false)
        })
    }, [])

    if (isLoading) {
        return (
            <>
                Loading
            </>
        )
    }

    if (!user) {
        return (
            <Auth />
        )
    }

    return (
        <>
            <Lines />
        </>
    )
}

export default App
