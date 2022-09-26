import { useParams } from 'react-router-dom'

function Story() {
    const params = useParams()
    console.log(params)

    return (
        <div className="Story">
            Story
        </div>
    )
}

export default Story
