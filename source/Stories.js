import { useEffect, useState } from 'react'
import { onSnapshot, query, collection, orderBy } from 'firebase/firestore'
import { Button, List } from 'antd'
import './Stories.less'
import { useNavigate } from 'react-router-dom'

const STORIES_COLLECTION = 'stories'

function Stories(props) {
    const navigate = useNavigate()
    const { firestore } = props
    const [stories, setStories] = useState([])

    useEffect(() => {
        onSnapshot(query(collection(firestore, STORIES_COLLECTION), orderBy('name')), snapshot => {
            const stories = []

            snapshot.forEach(doc => {
                stories.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            setStories(stories)
        })
    }, [])

    const renderStory = story => {
        const { id, name } = story

        const onClick = () => {
            navigate(`/stories/${ id }`)
        }

        return (
            <List.Item
                className="Line"
                actions={ [
                    <Button type="link" shape="circle" onClick={ onClick }>
                        Open
                    </Button>
                ] }
            >
                { name }
            </List.Item>
        )
    }

    return (
        <div className="Stories">
            <List
                dataSource={ stories }
                renderItem={ renderStory }
            />
        </div>
    )
}

export default Stories
