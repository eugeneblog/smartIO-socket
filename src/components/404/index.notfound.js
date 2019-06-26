import React from 'react'
import { Link } from 'react-router-dom'
import { Empty, Button } from 'antd'

class NotFoundPage extends React.Component{
    render() {
        return(
            <Empty
                image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
                imageStyle={{
                height: 60,
                }}
                description={
                <span>
                    Temporarily no data
                </span>
                }
            >
                <Button type="primary"><Link to="/">Back to the home page</Link></Button>
            </Empty>
        )
    }
}

export default NotFoundPage