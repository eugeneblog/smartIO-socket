import React from "react";
import "./index.layout.css";
import Menus from "../../components/Menu/index.menu";
import TreePane from "../../components/Tree/index.tree";
import CollectionCreateForm from "../../components/Modal/index.modal";
import { updateChannel, getAllType, getNetConfig } from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Layout, notification, Icon, message } from "antd";

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
            description: `You have successfully created new channel is: ${
              values.select
            }`,
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
        this.props.appstate.allType = data["allFiles"];
        this.props.appstate.allTypeData = data["allFileData"];
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
          let netArr = [];
          // 处理net数据，转换为数组，并分离ipv4地址和ipv6地址
          for (const key in data.net) {
            if (data.net.hasOwnProperty(key)) {
              const element = data.net[key];
              const ipv4 = element.filter(item => {
                return item.family !== "IPv6";
              });
              const ipv6 = element.filter(item => {
                return item.family !== "IPv4";
              });
              netArr.push({
                [key]: { ...element },
                name: key,
                ipv4: { ...ipv4 },
                ipv6: { ...ipv6 }
              });
            }
          }
          this.props.appstate.net = netArr;
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
