import React from 'react';
import './index.layout.css'
import Menus from '../../components/Menu/index.menu'
import TreePane from '../../components/Tree/index.tree'
import ModalPanel from '../../components/Modal/index.modal'
import { observer, inject } from 'mobx-react'
import { Layout } from 'antd'

const { Header, Content, Sider } = Layout

@inject(allStore => allStore.appstate) @observer
class HLayout extends React.Component {
    render() {
        return [
            <Layout key="layout">
                <Header className="header">
                    <Menus />
                </Header>
                <Layout>
                    <Sider width={240} style={{ background: '#fff' }}>
                        <TreePane />
                    </Sider>
                    <Content style={{ padding: '20px 50px' }}>
                        <div style={{ background: '#fff', padding: 24, minHeight: 280, height: "100%" }}>
                            {
                                this.props.children
                            }
                        </div>
                    </Content>
                </Layout>
            </Layout>,
            <ModalPanel key="modalpane" Component={this.props.appstate.modalComponent}/>
        ]
    }
}

export { HLayout } 