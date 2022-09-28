import { useEffect, useRef, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Form, Input, Button, List, Typography, Modal } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { createLine, deleteLine, updateLine, createUser, LINE_COLLECTION } from './Firebase'
import './App.less'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Stories from './Stories'
import Story from './Story'
import { Lines as StoryLines } from './Lines'

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
        <div className="Auth">
            <Typography.Title level={ 1 }>
                { mode ? 'Sign In' : 'Create' }
            </Typography.Title>
            <Form className="Auth-Form" onFinish={ onFinish }>
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
        </div>
    )
}

function Lines(props) {
    const { user, users } = props
    const [lines, setLines] = useState([])
    const [input, setInput] = useState('')
    const [editableLine, setEditableLine] = useState(null)
    const [deletableLine, setDeletableLine] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const ref = useRef({})

    useEffect(() => {
        onSnapshot(query(collection(firestore, LINE_COLLECTION), orderBy('timestamp')), snapshot => {
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
        const { data, uid } = item
        const lineUser = users.find(user => uid == user.id) || {}

        const onEdit = () => {
            setEditableLine(item.id)
            setInput(data)
        }

        const onDelete = () => {
            setDeletableLine(item.id)
            setIsModalOpen(true)
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
                <div className="Line-Content" style={{ color: lineUser.color }}>
                    <div className="Line-Data">
                        { data }
                    </div>
                </div>
            </List.Item>
        )
    }

    const onPressEnter = e => {
        if (!e.shiftKey) {
            e.preventDefault()

            if (input) {
                if (editableLine) {
                    updateLine(firestore, editableLine, input)
                    setEditableLine(null)
                    setInput('')
                } else {
                    const lastLine = lines[lines.length - 1]

                    if (!lastLine) {
                        if (user.uid === users[0].id) {
                            createLine(firestore, { uid: user.uid, data: input })
                            setInput('')

                            if (ref.current) {
                                ref.current.scrollTo(0, ref.current.scrollHeight + 100)
                            }
                        }
                    }

                    const userIndex = users.indexOf(users.find(u => user.uid == u.id) || {})
                    const previousUserIndex = (users.length + (userIndex - 1) % users.length) % users.length
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

    const cancelEdit = () => {
        setEditableLine(null)
        setInput('')
    }

    const handleOk = () => {
        deleteLine(firestore, deletableLine)
        setIsModalOpen(false)
        setDeletableLine(null)
    }
    
    const handleCancel = () => {
        setIsModalOpen(false)
    }

    function getNextUser() {
        const lastLine = lines[lines.length - 1]
        
        if (!lastLine) {
            return users[0]
        }

        const lastLineUserIndex = users.findIndex(u => u.id === lastLine.uid)
        const nextUserIndex = (users.length + (lastLineUserIndex + 1) % users.length) % users.length
        const nextUser = users[nextUserIndex]

        return nextUser
    }

    const nextUser = getNextUser()

    return (
        <div className="Lines">
            <div className="Lines-Wrapper" ref={ ref }>
                <List
                    dataSource={ lines }
                    renderItem={ renderItem }
                />
            </div>
            <Modal
                title="Delete line"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
            >
                <p>You are about to delete this line!</p>
            </Modal>
            <div>
                { nextUser && (<span style={{ color: nextUser.color }}>
                    { `${ nextUser.name }'s turn` }
                </span>) }
                { editableLine && (<Button type="link" onClick={ cancelEdit }>
                    Cancel Edit
                </Button>) }
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
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        Notification.requestPermission()

        onAuthStateChanged(auth, user => {
            setUser(user)
            setIsLoading(false)
        })

        onSnapshot(query(collection(firestore, 'users'), orderBy('order'), where('order', '>', -1)), snapshot => {
            const users = []

            snapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            setUsers(users)
        })
    }, [])

    if (isLoading || !users.length) {
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
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={ <Lines user={ user } users={ users } /> } />
                    <Route path="/stories" element={ <Stories firestore={ firestore } /> } />
                    <Route path="/stories/:id" element={ <Story /> } />
                    <Route path="/stories/:id/lines" element={ <StoryLines /> } />
                </Routes>
            </Router>
        </div>
    )
}

export default App
