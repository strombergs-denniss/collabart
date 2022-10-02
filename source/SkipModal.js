import { Button, Modal } from 'antd'
import { useContext, useState } from 'react'
import { useSelector } from 'react-redux'

import Context from './Context'
import { setNextPlayer } from './Firebase'
import { loop } from './Utility'

function SkipModal(props) {
    const { story, editableLine } = props
    const { db } = useContext(Context)
    const user = useSelector(state => state.user.user)
    const users = useSelector(state => state.user.users)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => {
        setIsModalOpen(true)
    }

    const handleOk = () => {
        const currentIndex = story.players.findIndex(player => player === story.currentPlayer)
        const nextIndex = loop(currentIndex + 1, story.players.length)
        const nextPlayer = story.players[nextIndex]

        setNextPlayer(db, story.id, nextPlayer)
        setIsModalOpen(false)
    }
    
    const handleCancel = () => {
        setIsModalOpen(false)
    }

    const currentPlayer = users.find(user => user.id === story.currentPlayer)

    if (!story || !currentPlayer || !user || !story.allowTurnSkip) {
        return null
    }

    if (currentPlayer.id !== user.id || editableLine) {
        return null
    }

    return (
        <>
            <Button type="link" onClick={ openModal }>
                SKIP TURN
            </Button>
            <Modal
                title="Skip Turn"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
                width={ 512 }
            >
                <p>
                    You are about to skip turn!
                </p>
            </Modal>
        </>
    )
}

export default SkipModal
