import { SettingOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Typography } from 'antd'
import { onSnapshot } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Context from './Context'
import { storyDoc, updateStory } from './Firebase'
import Lines from './Lines'
import Loader from './Loader'
import StoryForm from './StoryForm'

function Story() {
    const { id } = useParams()
    const { db } = useContext(Context)
    const [form] = Form.useForm()
    const [story, setStory] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [mode, setMode] = useState(false)

    useEffect(() => {
        onSnapshot(storyDoc(db, id), doc => {
            setStory({
                id: doc.id,
                ...doc.data()
            })
            form.setFieldsValue(doc.data())
        })
    }, [])

    const openModal = () => {
        setIsModalOpen(true)
        form.setFieldsValue(story)
    }

    const handleOk = () => {
        form.validateFields().then(values => {
            form.resetFields()
            updateStory(db, story, values)
            setIsModalOpen(false)
        })
    }

    const handleCancel = () => {
        setIsModalOpen(false)
    }

    const switchMode = () => {
        setMode(!mode)
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
                <div>
                    <Button
                        onClick={ switchMode }
                        style={ { marginRight: 4 } }
                    >
                        { mode ? 'WRITE' : 'READ' }
                    </Button>
                    <Button
                        onClick={ openModal }
                        type="link"
                        shape="circle"
                    >
                        <SettingOutlined />
                    </Button>
                </div>
            </div>
            <Modal
                title="Story"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
                width={ 1024 }
                okText="Save"
            >
                <StoryForm form={ form } story={ story } editMode />
            </Modal>
            <Lines story={ story } mode={ mode } />
        </div>
    )
}

export default Story
