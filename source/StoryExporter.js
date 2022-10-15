import { ExportOutlined } from '@ant-design/icons'
import { Button, notification } from 'antd'

function StoryExporter() {
    const onClick = () => {
        notification.info({ message: 'Story export functionality has not been implemented yet' })
    }

    return (
        <>
            <Button
                type="link"
                shape="circle"
                onClick={ onClick }
            >
                <ExportOutlined />
            </Button>
        </>
    )
}

export default StoryExporter
