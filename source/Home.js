import { Button, Typography } from 'antd'

function Home() {
    return (
        <div className="Home">
            <Typography.Title level={ 1 }>
                Collabart
            </Typography.Title>
            <Button
                type="link"
                href="/stories"
            >
                Stories
            </Button>
        </div>
    )
}

export default Home
