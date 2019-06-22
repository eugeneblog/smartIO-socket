import React from 'react';
import './index.layout.css'
import Menus from '../../components/Menu/index.menu'
import { Layout } from 'antd'

const { Header, Content, Footer } = Layout

class HLayout extends React.Component {
    render() {
        return(
            <Layout>
                <Header className="header">
                    <Menus/>
                </Header>
                <Content style={{ padding: '20px 50px' }}>
                    <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>Content</div>
                </Content>
                <Footer>

                </Footer>
            </Layout>
        )
    }
}

export default HLayout