import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { onSnapshot } from 'firebase/firestore'
import Context from './Context'
import { storyQuery } from './Firebase'
import Lines from './Lines'

function Story() {
    const { id } = useParams()
    const { db } = useContext(Context)
    const [story, setStory] = useState(null)

    useEffect(() => {
        onSnapshot(storyQuery(db, id), doc => {
            setStory({
                id: doc.id,
                ...doc.data()
            })
        })
    }, [])

    if (!story) {
        return 'Loading'
    }

    return (
        <div className="Story">
            { story.name }
            <Lines story={ story } />
        </div>
    )
}

export default Story
