import { Form, Input, InputNumber, Select } from 'antd'
import { useSelector } from 'react-redux'

function StoryForm(props) {
    const { form, story, disabled = false } = props
    const users = useSelector(state => state.user.users)
    const initialValues = story || {
        inputLimit: 1024
    }

    if (!form) {
        return null
    }

    const renderUserOption = (user, key) => {
        return (
            <Select.Option value={ user.id } key={ key }>
                { user.name }
            </Select.Option>
        )
    }

    return (
        <Form
            form={ form }
            initialValues={ initialValues }
        >
            <Form.Item
                label="Name"
                name="name"
                rules={ [{
                    required: true,
                    message:'Name must not be empty'
                }] }
            >
                <Input disabled={ disabled } />
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
                    disabled={ disabled }
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
                    disabled={ disabled }
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
                    disabled={ disabled }
                >
                    { users.map(renderUserOption) }
                </Select>
            </Form.Item>
        </Form>
    )
}

export default StoryForm
