import { Button, Form, Input, Typography } from 'antd'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useContext, useState } from 'react'

import Context from './Context'
import { createUser } from './Firebase'

function Auth() {
    const { db, auth } = useContext(Context)
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
                    createUser(db, {
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

export default Auth
