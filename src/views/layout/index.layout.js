import React from "react";
import "./index.layout.css";
import Menus from "../../components/Menu/index.menu";
import TreePane from "../../components/Tree/index.tree";
import CollectionCreateForm from "../../components/Modal/index.modal";
import {
  updateChannel
} from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Layout, notification, Icon, BackTop, message } from "antd";

const { Header, Content, Sider } = Layout;

@inject(allStore => allStore.appstate)
@observer
class HLayout extends React.Component {
  // 创建通道
  handleCreate = () => {
    const { form } = this.formRef.props;
    let { channelDataSource, channelTabData } = this.props.appstate;
    const NODES = channelDataSource.ROOT.CHANNEL;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log("Received values of form: ", values);
      let len = channelTabData.length;
      let endKey = len ? channelTabData[len - 1].attr.key : 0;
      let key = len ? Number(endKey) + 1 : 1;
      let typeName = values.selectConfig.replace(/.xml$/, "");
      let xmlJsonData = {
        DESCRIPTION: "null",
        ITEM_NAME: values["radio-name"],
        ITEM_NUMBER: key,
        LAST_MODIFIED: Date.now(),
        NET_CONFIG: this.getTypeStr(typeName),
        TYPE: typeName || "localhost",
        attr: {
          key
        }
      };
      let source = [];
      if (NODES) {
        source = NODES.length ? NODES.slice() : [{ ...NODES }];
      }
      // 将要插入的数据以json形式传送给后端
      let formData = {
        newData: JSON.stringify(source.concat(xmlJsonData))
      };
      // 通道信息写入xml
      updateChannel(formData).then(result => {
        let isAdd = result["data"].errno;
        if (isAdd === 0) {
          // 隐藏modal
          this.props.appstate.setView("modalVisible", false);
          // 更新数据，同步到客户端
          this.props.appstate.updateData();
          notification.open({
            message: "Message",
            description: `You have successfully created new channel is: ${values.select}`,
            icon: <Icon type="smile" style={{ color: "#108ee9" }} />
          });
        }
      });
    });
  };

  getTypeStr = typeName => {
    let typeData;
    this.props.appstate.allTypeData.forEach(item => {
      if (item.ROOT.NAME === typeName) {
        let net = item.ROOT.NET;
        typeData = {
          MAIN: {
            IP: net.IP,
            MAC: "00:00:00:00:00:00",
            NAME: item.ROOT.NAME,
            PORT: {
              "#text": net.PORT,
              attr: {
                type: "number"
              }
            }
          },
          PORT: {
            TYPE: {
              "#text": "WIFI",
              attr: {
                type: "netconfig"
              }
            },
            UDPTIMEOUT: 1000
          }
        };
      }
    });
    return typeData;
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    return [
      <Layout key="layout" state={this.props.appstate.globalStatus}>
        <Header className="header">
          <Menus />
        </Header>
        <Layout>
          <Sider width={240} style={{ background: "#fff" }}>
            <TreePane />
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
      </Layout>,
      <CollectionCreateForm
        key="modalpane"
        onCreate={this.handleCreate}
        wrappedComponentRef={this.saveFormRef}
      />
    ];
  }

  componentDidUpdate() {
    if (this.props.appstate.globalStatus === "loading") {
      message.loading("Action in progress..", 0);
    } else {
      message.destroy();
    }
    // 路由切换触发
    let pathName = this.props.location.pathname;
    this.props.treestate.defaultSelectedKey(pathName.split("/")[1]);
    // console.log("当前路由是", pathName);
  }
}

export { HLayout };
