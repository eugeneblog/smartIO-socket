import React from "react";
import "./index.layout.css";
import Menus from "../../components/Menu/index.menu";
import TreePane from "../../components/Tree/index.tree";
import CollectionCreateForm from "../../components/Modal/index.modal";
import { newChannel } from '../../api/index.api'
import { observer, inject } from "mobx-react";
import { Layout } from "antd";

const { Header, Content, Sider } = Layout;

@inject(allStore => allStore.appstate)
@observer
class HLayout extends React.Component {
  handleCreate = () => {
    const { form } = this.formRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log("Received values of form: ", values);
      // 将要插入的数据以json形式传送给后端
      let formData = {
        "itemName": values.select,
        "itemType": values.type || "localhost",
        "itemNumber": "xxx",
        "port": 1234,
        "desc": "",
        "time": Date.now(),
        "net": {
          "name": "eth",
          "ip": "127.0.0.1",
          "mac": "00:00:00:00:00:00"
        }
      }
      // form.resetFields();
      // 通道信息写入xml
      newChannel(formData).then(result => {
        console.log(result)
      })
      this.setState({ visible: false });
    });
  };
  saveFormRef = formRef => {
    this.formRef = formRef;
  };
  render() {
    return [
      <Layout key="layout">
        <Header className="header">
          <Menus />
        </Header>
        <Layout>
          <Sider width={240} style={{ background: "#fff" }}>
            <TreePane />
          </Sider>
          <Content style={{ padding: "20px 50px" }}>
            <div style={{ background: "#fff", padding: 24, minHeight: 640 }}>
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Layout>,
      <CollectionCreateForm
        key="modalpane"
        onCreate={this.handleCreate}
        wrappedComponentRef={this.saveFormRef}
      />
    ];
  }
  componentDidUpdate() {
    // 路由切换触发
    let pathName = this.props.location.pathname;
    this.props.treestate.defaultSelectedKey(pathName.split('/')[1])
    // console.log("当前路由是", pathName);
  }
}

export { HLayout };
