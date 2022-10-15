import { Button, notification } from 'antd'

function StoryImporter() {
    const onClick = () => {
        notification.info({ message: 'Story import functionality has not been implemented yet' })
    }

    return (
        <>
            <Button onClick={ onClick }>
                IMPORT
            </Button>
        </>
    )
}

export default StoryImporter
