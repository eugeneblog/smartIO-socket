import React from "react";
import "./index.layout.css";
import Menus from "../../components/Menu/index.menu";
import TreePane from "../../components/Tree/index.tree";
import CollectionCreateForm from "../../components/Modal/index.modal";
import { newChannel } from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Layout, notification, Icon } from "antd";

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
      let key = this.props.appstate.channelTabData.length + 1
      let xmlStr = `
    <CHANNEL key='${key}'>
      <ITEM_NAME>${values.select}</ITEM_NAME>
      <ITEM_NUMBER>xxx</ITEM_NUMBER>
      <TYPE>${values.type || "localhost"}</TYPE>
      <PORT>1234</PORT>
      <DESCRIPTION>null</DESCRIPTION>
      <LAST_MODIFIED>${Date.now()}</LAST_MODIFIED>
      <NET>
          <NAME>eth</NAME>
          <IP>127.0.0.1</IP>
          <MAC>00:00:00:00:00:00</MAC>
      </NET>
    </CHANNEL>`;
      // 将要插入的数据以json形式传送给后端
      let formData = {
        xmlData: xmlStr
      };
      // 通道信息写入xml
      newChannel(formData, { filename: "channel" }).then(result => {
        const data = result.data;
        if (data.errno === 0) {
          // 隐藏modal框
          this.props.appstate.setView("modalVisible", false);
          notification.open({
            message: "Message",
            description: `You have successfully created new channel is: ${values.select}`,
            icon: <Icon type="smile" style={{ color: "#108ee9" }} />
          });
          // 更新数据
          let newXmlJson = JSON.parse(data['data'].xmlJson)
          console.log(newXmlJson)
          this.props.appstate.channelTabData.push({
              key: key,
              name: values.select,
              desc: 1231,
              inumber: "New York No. 1 Lake Park",
              chaname: ["nice", "developer"]
          })
        }
      });
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
    this.props.treestate.defaultSelectedKey(pathName.split("/")[1]);
    // console.log("当前路由是", pathName);
  }
}

export { HLayout };
