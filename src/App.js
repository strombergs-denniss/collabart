import { useEffect, useRef, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Form, Input, Button, List } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { createLine, deleteLine, getUsers, updateLine, createUser } from './Firebase'
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
        const { email, name, password } = values

        if (mode) {
            signInWithEmailAndPassword(auth, email, password)
                .catch(error => {
                    console.error(error)
                })
        } else {
            createUserWithEmailAndPassword(auth, email, password)
                .then(credential => {
                    createUser(firestore, {
                        uid: credential.user.uid,
                        name
                    })
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
            { !mode && (
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Name must not be empty' }]}
                >
                    <Input />
                </Form.Item>
            )}
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

function Lines(props) {
    const { user, users } = props
    const [lines, setLines] = useState([])
    const [input, setInput] = useState('')
    const [editableLine, setEditableLine] = useState(null)
    const ref = useRef({})

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
        const { id, data, uid } = item
        const lineUser = users.find(user => uid == user.id) || {}

        const onEdit = () => {
            setEditableLine(item)
            setInput(data)
        }

        const onDelete = () => {
            deleteLine(firestore, id)
        }

        return (
            <List.Item
                className="Line"
                actions={ user.uid === uid ? [
                    <Button type="link" shape="circle" onClick={ onEdit } key="edit">
                        <EditOutlined />
                    </Button>,
                    <Button type="link" shape="circle" onClick={ onDelete } key="delete">
                        <DeleteOutlined />
                    </Button>
                ] : [] }
            >
                <List.Item.Meta
                    title={ lineUser.name }
                    description={ data }
                />
            </List.Item>
        )
    }

    const onPressEnter = e => {
        if (!e.shiftKey) {
            e.preventDefault()

            if (input) {
                if (editableLine) {
                    updateLine(firestore, editableLine.id, input)
                    setEditableLine(null)
                    setInput('')
                } else {
                    const lastLine = lines[lines.length - 1]
                    const lineUser = users.indexOf(users.find(u => user.uid == u.id) || {})
                    const previousUserIndex = (users.length + (lineUser - 1) % users.length) % users.length
                    const previousUser = users[previousUserIndex]

                    if (lastLine.uid === previousUser.id) {
                        createLine(firestore, { uid: user.uid, data: input })
                        setInput('')

                        if (ref.current) {
                            ref.current.scrollTo(0, ref.current.scrollHeight + 100)
                        }
                    }
                }
            }
        }
    }

    const onChange = e => {
        setInput(e.target.value)
    }

    return (
        <div className="Lines">
            <div className="Lines-Wrapper" ref={ ref }>
                <List
                    dataSource={ lines }
                    renderItem={ renderItem }
                />
            </div>
            <Input.TextArea
                value={ input } 
                showCount
                rows={ 2 }
                maxLength={ 640 }
                onPressEnter={ onPressEnter }
                onChange={ onChange }
                autoSize
            />
        </div>
    )
}

function App() {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState(null)

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            setUser(user)
            setIsLoading(false)
        })

        getUsers(firestore, users => {
            setUsers(users)
            setIsLoading(false)
        })
    }, [])

    if (isLoading && !users) {
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
            <Lines user={ user } users={ users} />
        </>
    )
}

export default App
