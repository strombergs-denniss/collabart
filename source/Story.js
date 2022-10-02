import { Button, Form, Modal, Typography } from 'antd'
import { onSnapshot } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Context from './Context'
import { storyDoc } from './Firebase'
import Lines from './Lines'
import Loader from './Loader'
import StoryForm from './StoryForm'

function Story() {
    const { id } = useParams()
    const { db } = useContext(Context)
    const [form] = Form.useForm()
    const [story, setStory] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        onSnapshot(storyDoc(db, id), doc => {
            setStory({
                id: doc.id,
                ...doc.data()
            })
        })
    }, [])

    const openModal = () => {
        setIsModalOpen(true)
    }

    const handleOk = () => {

    }

    const handleCancel = () => {
        setIsModalOpen(false)
    }

    if (!story) {
        return (
            <Loader />
        )
    }

    return (
        <div className="Story">
            <div className="Story-Info">
                <Typography.Title level={ 3 }>
                    { story.name }
                </Typography.Title>
                <Button onClick={ openModal }>
                    View
                </Button>
            </div>
            <Modal
                title="Story"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
                width={ 1024 }
            >
                <StoryForm form={ form } story={ story } disabled />
            </Modal>
            <Lines story={ story } />
        </div>
    )
}

export default Story
