import React from 'react';
import './index.layout.css'
import Menus from '../../components/Menu/index.menu'
import TreePane from '../../components/Tree/index.tree'
import { Layout } from 'antd'

const { Header, Content, Sider } = Layout

class HLayout extends React.Component {
    render() {
        return(
            <Layout>
                <Header className="header">
                    <Menus/>
                </Header>
                <Layout>
                    <Sider width={200} style={{ background: '#fff' }}>
                        <TreePane/>
                    </Sider>
                    <Content style={{ padding: '20px 50px' }}>
                        <div style={{ background: '#fff', padding: 24, minHeight: 280, height: "100%" }}>Content</div>
                    </Content>
                </Layout>
            </Layout>
        )
    }
}

export default HLayout