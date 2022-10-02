import { LoadingOutlined } from '@ant-design/icons'
import { Spin, Typography } from 'antd'

function Loader() {
    return(
        <div className="Loader">
            <Spin indicator={ <LoadingOutlined style={ { fontSize: 72 } } spin /> } />
            <Typography.Title level={ 4 }>
                Loading...
            </Typography.Title>
        </div>
    )
}

export default Loader
