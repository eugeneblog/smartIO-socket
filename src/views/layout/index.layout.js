import React from "react";
import "./index.layout.css";
import Menus from "../../components/Menu/index.menu";
import TreePane from "../../components/Tree/index.tree";
import CollectionCreateForm from "../../components/Modal/index.modal";
import { newChannel, getAllType, getNetConfig } from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Layout, notification, Icon, message } from "antd";

const { Header, Content, Sider } = Layout;

@inject(allStore => allStore.appstate)
@observer
class HLayout extends React.Component {
  // 创建通道
  handleCreate = () => {
    const { form } = this.formRef.props;
    form.validateFields((err, values) => {
      console.log(values);
      if (err) {
        return;
      }
      console.log("Received values of form: ", values);
      let len = this.props.appstate.channelTabData.length;
      let key = len
        ? Number(this.props.appstate.channelTabData[len - 1].key) + 1
        : 1;
      let typeStr = 
    `<NET_CONFIG>
      <MAIN>
        <NAME>eth</NAME>
        <IP>1234</IP>
        <MAC>00:00:00:00:00:00</MAC>
      </MAIN>
      <PORT>
        <TYPE type="select">wifi</TYPE>
      </PORT>
    </NET_CONFIG>`;
      let xmlStr = `
  <CHANNEL key='${key}'>
    <ITEM_NAME>${values["radio-name"]}</ITEM_NAME>
    <ITEM_NUMBER>${key}</ITEM_NUMBER>
    <TYPE>${values.selectConfig.replace(/.xml$/, "") || "localhost"}</TYPE>
    <DESCRIPTION>null</DESCRIPTION>
    <LAST_MODIFIED>${Date.now()}</LAST_MODIFIED>
    ${typeStr}
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
            description: `You have successfully created new channel is: ${
              values.select
            }`,
            icon: <Icon type="smile" style={{ color: "#108ee9" }} />
          });
          // 更新数据
          this.props.appstate.channelTabData.push({
            key: key,
            name: values["radio-name"],
            inumber: "New York No. 1 Lake Park",
            chaname: ["nice", "developer"],
            netConfig: {
              MAIN: {
                IP: "xxx"
              }
            }
          });
        } else {
          message.error("Increase the failure");
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

  componentDidMount() {
    // 视图加载完毕后请求数据：获取type文件名
    getAllType()
      .then(typeResult => {
        let data = typeResult.data["data"];
        this.props.appstate.allType = data['allFiles'];
        this.props.appstate.allTypeData = data['allFileData']
        console.log("%cgetAlltype...", "color:green;font-weight:bold;");
      })
      .catch(err => {
        console.log(err);
      });
    // 获取网络系统的网络配置
    getNetConfig()
      .then(result => {
        if (result["data"].errno === 0) {
          let data = result["data"].data;
          this.props.appstate.netConfig = data.sysNetConfig || data.net.en0;
          console.log(
            "%cgetAllNet_Config配置...",
            "color:green;font-weight:bold;"
          );
          return;
        }
      })
      .catch(err => {
        message.error(err);
      });
  }

  componentDidUpdate() {
    // 路由切换触发
    let pathName = this.props.location.pathname;
    this.props.treestate.defaultSelectedKey(pathName.split("/")[1]);
    // console.log("当前路由是", pathName);
  }
}

export { HLayout };
