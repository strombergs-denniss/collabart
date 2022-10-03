import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Input, List, Modal } from 'antd'
import { onSnapshot } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import Context from './Context'
import { createLine, deleteLine, linesQuery, PAGE_SIZE, setNextPlayer, updateLine } from './Firebase'
import SkipModal from './SkipModal'
import { loop } from './Utility'

function Lines(props) {
    const { story, mode } = props
    const { db } = useContext(Context)
    const { id: storyId } = useParams()
    const user = useSelector(state => state.user.user)
    const users = useSelector(state => state.user.users)
    const [lines, setLines] = useState([])
    const [input, setInput] = useState('')
    const [editableLine, setEditableLine] = useState(null)
    const [deletableLine, setDeletableLine] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [snap, setSnap] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setSnap({
            unsubscribe: onSnapshot(linesQuery(db, storyId), collection => {
                const lines = []

                collection.forEach(doc => {
                    lines.unshift(doc)
                })

                setLines(lines)
                setIsLoading(false)
            })
        })
    }, [])

    const renderLine = line => {
        const { id } = line
        const { uid, data } = line.data()
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
                    const currentPlayer = users.find(user => user.id === story.currentPlayer)
                    const currentIndex = story.players.findIndex(player => player === story.currentPlayer)
                    const nextIndex = loop(currentIndex + 1, story.players.length)
                    const nextPlayer = story.players[nextIndex]

                    if (currentPlayer && currentPlayer.id === user.id && nextPlayer) {
                        createLine(db, storyId, { uid: user.id, data: input })
                        setNextPlayer(db, storyId, nextPlayer)
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

    const loadMore = () => {
        if (isLoading) {
            return
        }

        if (snap && lines.length === PAGE_SIZE) {
            setIsLoading(true)
            snap.unsubscribe()

            setSnap({
                unsubscribe: onSnapshot(linesQuery(db, storyId, lines[0]), collection => {
                    const lines = []

                    collection.forEach(doc => {
                        lines.unshift(doc)
                    })

                    setLines(lines)
                    setIsLoading(false)
                })
            })
        }
    }

    const renderLoadMore = () => {
        if (lines.length < PAGE_SIZE) {
            return null
        }

        return (
            <div className="Lines-LoadMore">
                <Button onClick={ loadMore }>
                    LOAD MORE
                </Button>
            </div>
        )
    }

    const currentPlayer = users.find(user => user.id === story.currentPlayer)

    return (
        <div className="Lines">
            <div className="Lines-Wrapper">
                <List
                    dataSource={ lines }
                    renderItem={ renderLine }
                    loadMore={ renderLoadMore() }
                    loading={ isLoading }
                />
            </div>
            <Modal
                title="Delete Line"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
                width={ 512 }
            >
                <p>
                    You are about to delete this line!
                </p>
            </Modal>
            <div className="Lines-Controls">
                { currentPlayer && (
                    <span style={{ color: currentPlayer.color }}>
                        { `TURN: ${ currentPlayer.name }` }
                    </span>
                ) }
                { editableLine && (
                    <Button type="link" onClick={ cancelEdit }>
                        CANCEL EDIT
                    </Button>
                ) }
                <SkipModal
                    story={ story }
                    editableLine={ editableLine }
                />
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
