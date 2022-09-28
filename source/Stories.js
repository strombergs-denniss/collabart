import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { onSnapshot } from 'firebase/firestore'
import { Button, Form, Input, InputNumber, List, Modal, Select } from 'antd'
import Context from './Context'
import { createStory, storiesQuery } from './Firebase'

function Stories() {
    const navigate = useNavigate()
    const { db } = useContext(Context)
    const users = useSelector(state => state.user.users)
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
            <Button type="link" shape="circle" onClick={ onClick }>
                Open
            </Button>
        ]

        return (
            <List.Item
                className="Story"
                actions={ actions }
            >
                { name }
            </List.Item>
        )
    }

    const renderUserOption = user => {
        return (
            <Select.Option value={ user.id }>
                { user.name }
            </Select.Option>
        )
    }

    if (!stories) {
        return 'Loading'
    }

    return (
        <div className="Stories">
            <Button onClick={ openModal } >
                New
            </Button>
            <Modal
                title="New Story"
                open={ isModalOpen }
                onOk={ handleOk }
                onCancel={ handleCancel }
            >
                <Form
                    form={ form }
                    initialValues={ { inputLimit: 1024 } }
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={ [{
                            required: true,
                            message:'Name must not be empty'
                        }] }
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={ [{
                            required: true,
                            message:'Description must not be empty'
                        }] }
                    >
                        <Input.TextArea
                            maxLength={ 4096 }
                            showCount
                            autoSize={ {
                                minRows: 2,
                                maxRows: 6
                            } }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Input Limit"
                        name="inputLimit"
                        rules={ [{
                            required: true,
                            message:'Input Limit must not be empty'
                        }] }
                    >
                        <InputNumber
                            min={ 1 }
                            max={ 2048 }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Players"
                        name="players"
                        rules={ [{
                            required: true,
                            message:'Players must not be empty'
                        }] }
                    >
                        <Select
                            mode="multiple"
                            allowClear
                        >
                            { users.map(renderUserOption) }
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <List
                dataSource={ stories }
                renderItem={ renderStory }
            />
        </div>
    )
}

export default Stories
