import { FolderOpenOutlined } from '@ant-design/icons'
import { Button, Form, List, Modal } from 'antd'
import { onSnapshot } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Context from './Context'
import { createStory, storiesQuery } from './Firebase'
import Loader from './Loader'
import StoryExporter from './StoryExporter'
import StoryForm from './StoryForm'
import StoryImporter from './StoryImporter'

function Stories() {
    const navigate = useNavigate()
    const { db } = useContext(Context)
    const [form] = Form.useForm()
    const [stories, setStories] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        onSnapshot(storiesQuery(db), collection => {
            const stories = []

            collection.forEach(doc => {
                stories.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            setStories(stories)
        })
    }, [])

    const openModal = () => {
        setIsModalOpen(true)
    }

    const handleOk = () => {
        form.validateFields().then(values => {
            form.resetFields()
            createStory(db, values)
            setIsModalOpen(false)
        })
    }

    const handleCancel = () => {
        setIsModalOpen(false)
    }

    const renderStory = story => {
        const { id, name } = story

        const onClick = () => {
            navigate(`/stories/${ id }`)
        }

        const actions = [
            <Button type="link" shape="circle" onClick={ onClick } key="open">
                <FolderOpenOutlined />
            </Button>,
            <StoryExporter key="export" />
        ]

        return (
            <List.Item
                className="Stories-Item"
                actions={ actions }
            >
                { name }
            </List.Item>
        )
    }

    if (!stories) {
        return (
            <Loader />
        )
    }

    return (
        <div className="Stories">
            <div className="Stories-Controls">
                <Button onClick={ openModal } >
                    NEW
                </Button>
                <StoryImporter />
            </div>
            <Modal
                title="New Story"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
                width={ 1024 }
            >
                <StoryForm form={ form } />
            </Modal>
            <List
                dataSource={ stories }
                renderItem={ renderStory }
            />
        </div>
    )
}

export default Stories
