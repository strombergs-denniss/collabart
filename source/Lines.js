import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Input, List, Modal } from 'antd'
import { onSnapshot } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import Context from './Context'
import { createLine, deleteLine, linesQuery, updateLine } from './Firebase'

function Lines(props) {
    const { story } = props
    const { db } = useContext(Context)
    const { id: storyId } = useParams()
    const user = useSelector(state => state.user.user)
    const users = useSelector(state => state.user.users)
    const [lines, setLines] = useState([])
    const [input, setInput] = useState('')
    const [editableLine, setEditableLine] = useState(null)
    const [deletableLine, setDeletableLine] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        onSnapshot(linesQuery(db, storyId), collection => {
            const lines = []

            collection.forEach(doc => {
                lines.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            setLines(lines)
        })
    }, [])

    const renderLine = line => {
        const { id, uid, data } = line
        const lineUser = users.find(user => uid == user.id) || {}

        const onEdit = () => {
            setEditableLine(id)
            setInput(data)
        }

        const onDelete = () => {
            setDeletableLine(id)
            setIsModalOpen(true)
        }

        return (
            <List.Item
                className="Line"
                actions={ user.id === uid ? [
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
                    updateLine(db, storyId, editableLine, input)
                    setEditableLine(null)
                    setInput('')
                } else {
                    const lastLine = lines[lines.length - 1]

                    if (!lastLine) {
                        if (user.id === users[0].id) {
                            createLine(db, storyId, { uid: user.id, data: input })
                            setInput('')
                        }
                    }

                    const userIndex = users.indexOf(users.find(u => user.id == u.id) || {})
                    const previousUserIndex = (users.length + (userIndex - 1) % users.length) % users.length
                    const previousUser = users[previousUserIndex]

                    if (lastLine.uid === previousUser.id) {
                        createLine(db, storyId, { uid: user.id, data: input })
                        setInput('')
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
        deleteLine(db, storyId, deletableLine)
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
            <div className="Lines-Wrapper">
                <List
                    dataSource={ lines }
                    renderItem={ renderLine }
                />
            </div>
            <Modal
                title="Delete Line"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
            >
                <p>
                    You are about to delete this line!
                </p>
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
                maxLength={ story.inputLimit }
                onPressEnter={ onPressEnter }
                onChange={ onChange }
                autoSize
            />
        </div>
    )
}

export default Lines
