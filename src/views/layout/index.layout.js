import React from "react";
import "./index.layout.css";
import Menus from "../../components/Menu/index.menu";
// import TreePane from "../../components/Tree/index.tree";
import NavMenu from "../../components/NavMenu/index.navMenu";
import { observer, inject } from "mobx-react";
import { Layout, BackTop } from "antd";

const { Header, Content, Sider } = Layout;

@inject(allStore => allStore.appstate)
@observer
class HLayout extends React.Component {
  render() {
    return (
      <Layout key="layout" state={this.props.appstate.globalStatus}>
        <Header className="header">
          <Menus />
        </Header>
        <Layout>
          <Sider width={240} style={{ background: "#041528", padding: 0 }}>
            {/* <TreePane /> */}
            <NavMenu history={this.props.history} />
          </Sider>
          <Content
            style={{
              padding: "0px 10px",
              height: "100%",
              position: "relative"
            }}
          >
            <div
              style={{
                background: "#fff",
                margin: 10,
                zIndex: "0",
                position: "absolute",
                top: "0",
                right: "0",
                left: "0",
                bottom: "0",
                padding: "10px",
                overflow: "scroll"
              }}
            >
              <BackTop target={() => <Content></Content>} />
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export { HLayout };
