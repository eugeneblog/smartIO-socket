/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React from "react";
import { observer, inject } from "mobx-react";
import {
  Table,
  Menu,
  Dropdown,
  Icon,
  Button,
  Modal,
  Steps,
  Select,
  message,
  Spin,
  List,
  Avatar,
  Progress,
  Tabs
} from "antd";
import * as Socket from "socket.io-client";
import "./index.equipment.css";
import {
  getWhoMsg,
  getUdpNetNum,
  sendUdpMes,
  startWebsocket,
  generateEquXml,
  searchEquOneObj
} from "../../api/index.api";
// const SocketClient = Socket();
const { TabPane } = Tabs;
const { Step } = Steps;
const { Option } = Select;
const { confirm } = Modal;

const selecChannelHandle = function(e) {
  // 显示config modal
  this.setState({
    configVisable: true
  });
};

let timer = null;
@inject(allStore => allStore.appstate)
@observer
class Equipment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      configVisable: false,
      current: 0,
      isLoading: false,
      estate: false,
      selEquKeys: [],
      selEquRows: [],
      generateLoading: false,
      findNetStatus: ""
    };
    this.mainMenu = record => {
      return (
        <Menu>
          <Menu.Item
            onClick={() =>
              this.exportEquSel(this.state.selEquKeys, this.state.selEquRows)
            }
          >
            Export the selected object
          </Menu.Item>
          <Menu.Item
            onClick={() => this.exportEquAll(this.props.appstate.allEquimpent)}
          >
            Export all objects
          </Menu.Item>
          <Menu.Item onClick={() => this.searchObjProper()}>
            Search for object properties
          </Menu.Item>
          <Menu.Item
            onClick={() =>
              this.searchSelObjProper(
                this.state.selEquKeys,
                this.state.selEquRows
              )
            }
          >
            Search selected object properties
          </Menu.Item>
        </Menu>
      );
    };

    this.equipmentMenu = record => {
      return (
        <Menu>
          <Menu.Item onClick={() => this.exportEquOne(record)}>
            Export the configuration
          </Menu.Item>
          <Menu.Item onClick={() => this.getEquPropertie(record)}>
            Retrieve attributes
          </Menu.Item>
        </Menu>
      );
    };

    this.mainColumns = [
      { title: "Sources", dataIndex: "sources", key: "sources" },
      {
        title: "Action",
        key: "action",
        render: (text, record) => {
          return (
            <span className="table-operation">
              <Dropdown overlay={() => this.mainMenu(record)}>
                <a href="#">
                  Hover me <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        }
      }
    ];

    this.columns = [
      { title: "DeviceId", dataIndex: "deviceid", key: "deviceid" },
      { title: "Maxapdu", dataIndex: "maxapdu", key: "maxapdu" },
      {
        title: "Segmenation",
        key: "segmenation",
        dataIndex: "segmenation"
      },
      {
        title: "Vendor id",
        dataIndex: "vendorid",
        key: "vendorid"
      },
      {
        title: "Action",
        dataIndex: "operation",
        key: "operation",
        render: (text, record) => {
          return (
            <span className="table-operation">
              <Dropdown overlay={() => this.equipmentMenu(record)}>
                <a href="javascript:;">
                  More <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        }
      }
    ];

    this.takeEquipmentColumns = [
      { title: "DeviceId", dataIndex: "deviceid", key: "deviceid" },
      { title: "Maxapdu", dataIndex: "maxapdu", key: "maxapdu" },
      {
        title: "Segmenation",
        key: "segmenation",
        dataIndex: "segmenation"
      },
      {
        title: "Vendor id",
        dataIndex: "vendorid",
        key: "vendorid"
      },
      {
        title: "Action",
        dataIndex: "operation",
        key: "operation",
        render: (text, record) => {
          return (
            <span className="table-operation">
              <Dropdown overlay={() => this.equipmentMenu(record)}>
                <a href="javascript:;">
                  More <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        }
      }
    ];
  }
  // 获取对象列表
  getEquPropertie = record => {
    
    const { deviceid, maxapdu, segmenation, sources, sourceAddrNet, sourceAddrAdr } = record;
    searchEquOneObj({ deviceid, maxapdu, segmenation, sources, sourceAddrNet, sourceAddrAdr }).then(
      result => {
        let data = result["data"];
        console.log(data);
      }
    );
  };
  // 导出单个设备
  exportEquOne = record => {
    confirm({
      title: "Do you want to delete these items?",
      content:
        "When clicked the OK button, this dialog will be closed after 1 second",
      onOk() {
        return new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log("Oops errors!"));
      },
      onCancel() {}
    });
  };
  // 导出所有设备, allRecord: 所有设备对象列表(Array)
  exportEquAll = allRecord => {
    confirm({
      title: "Export all"
    });
  };
  // 导出已选择的设备, selRecord: 所有选择的key(Array)
  exportEquSel = (selRecordKey, selRecordRow) => {
    // console.log(selRecordKey, selRecordRow);
    if (selRecordKey.length >= 1) {
      confirm({
        title: "Please confirm your options",
        content: (
          <div className="demo-infinite-container">
            <List
              itemLayout="horizontal"
              dataSource={selRecordRow}
              split={false}
              renderItem={item => (
                <List.Item className="demo-event-hover">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor: "#f56a00",
                          marginLeft: ".2rem"
                        }}
                      >
                        E
                      </Avatar>
                    }
                    title={item.deviceid}
                  />
                  <Progress percent={50} size="small" />
                </List.Item>
              )}
            />
          </div>
        ),
        onOk: () => {
          return generateEquXml()
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.log(err);
            });
        },
        onCancel() {}
      });
    } else {
      message.warning("Please select at least one device");
    }
  };
  // 搜索选择好的对象
  searchSelObjProper = (selRecordKey, selRecordRow) => {
    if (selRecordKey.length >= 1) {
      confirm({
        title: "Add to the required group",
        content: (
          <div>{`You have selected ${selRecordRow.length} devices`}</div>
        ),
        onOk: () => {
          this.props.equipmentstate.takeEquiObj = selRecordRow
        }
      });
    } else {
      message.warning("Please select at least one device");
    }
  };
  // 搜索所有设备对象属性
  searchObjProper = () => {};

  // 搜索设备
  searchEqu = (e, channel) => {
    // 获取选择的通道配置
    const { selctConfig, config } = channel;
    // 保存当前选择的通道以及通道信息
    this.props.appstate.selectedChannel = selctConfig;
    this.props.appstate.selectedChannelData = config;
    // 开启websocket连接, 获取要发送的信息, 发送udp消息
    getWhoMsg()
      .then(whoMsgRes => {
        let data = whoMsgRes["data"];
        const { bclcEncodeOriginalRes, pduData } = data;
        console.log(bclcEncodeOriginalRes, pduData);
        // 先使用假数据
        let mes = [
          0x81,
          0x0b,
          0x00,
          0x0c,
          0x01,
          0x20,
          0xff,
          0xff,
          0x00,
          0xff,
          0x10,
          0x08
        ];
        return mes;
      })
      .then(mes => {
        // 发送udp消息, table 为loading状态
        this.setState({
          configVisable: false,
          isLoading: true
        });
        return sendUdpMes({
          ip: "0.0.0.0",
          port: config.NET_CONFIG.MAIN.LOCAL_PORT["#text"],
          mes: mes,
          local_port: config.NET_CONFIG.MAIN.LOCAL_PORT["#text"],
          remote_port: config.NET_CONFIG.MAIN.REMOTE_PORT["#text"]
        });
      })
      .then(udpData => {
        const udpResult = udpData["data"];
        if (udpResult.errno === 0) {
          timer = setTimeout(() => {
            // 如果data 为空，则提示用户没有搜索到设备
            if (this.props.appstate.equipmentData.length === 0) {
              message.warning(
                "No device found, please check channel configuration !"
              );
            }
            this.setState({
              isLoading: false
            });
          }, 1000);
        }
      })
      .catch(err => {
        message.info("Failed to locate device");
      });
  };
  // 重载设备
  discoveryHandle = e => {
    const { selectedChannelData, selectedChannel } = this.props.appstate;
    if (!selectedChannel) {
      message.info("Please select the channel configuration first");
      return;
    }
    if (this.socket) {
      this.socket.close();
      this.props.appstate.equipmentData = [];
      // 开启websocket连接, 获取要发送的信息, 发送udp消息
      getWhoMsg()
        .then(res => {
          let data = res["data"];
          const { bclcEncodeOriginalRes, pduData } = data;
          console.log(bclcEncodeOriginalRes, pduData);
          // 先使用假数据
          let mes = [
            0x81,
            0x0b,
            0x00,
            0x0c,
            0x01,
            0x20,
            0xff,
            0xff,
            0x00,
            0xff,
            0x10,
            0x08
          ];
          return mes;
        })
        .then(mes => {
          // 发送udp消息
          return sendUdpMes({
            ip: "0.0.0.0",
            port: selectedChannelData.NET_CONFIG.MAIN.LOCAL_PORT["#text"],
            mes: mes,
            local_port: selectedChannelData.NET_CONFIG.MAIN.LOCAL_PORT["#text"],
            remote_port:
              selectedChannelData.NET_CONFIG.MAIN.REMOTE_PORT["#text"]
          });
        });
      this.connectSocket();
      // 获取who_msg
      this.setState({
        configVisable: false,
        isLoading: true
      });
      timer = setTimeout(() => {
        // 如果data 为空，则提示用户没有搜索到设备
        if (this.props.appstate.equipmentData.length === 0) {
          message.warning(
            "No device found, please check channel configuration !"
          );
        }
        this.setState({
          isLoading: false
        });
      }, 1000);
    }
  };

  handleCancel = e => {
    this.setState({
      configVisable: false
    });
  };
  // 连接websocket
  connectSocket() {
    return startWebsocket().then(res => {
      let data = res["data"];
      let index = 0;
      if (data.errno === 0) {
        this.socket = Socket("http://localhost:8001");
        this.socket.on("connect", () => {
          this.setState({
            estate: true
          });
          this.socket.emit("client message", { msg: "hi , server" });
        });
        this.socket.on("server message", udpData => {
          // 忽略空消息
          if (!Object.keys(udpData).length) {
            return;
          }
          // 存储whois IAm报文
          let data = udpData["iAmData"];
          if (data) {
            this.props.appstate.equipmentTableData = [
              {
                key: 1,
                sources: data["address"] + ":" + data["port"]
              }
            ];
            this.props.appstate.equipmentData.push({
              key: (index += 1),
              deviceid: data["deviceId"],
              maxapdu: data["maxapdu"],
              segmenation: data["segment"],
              vendorid: data["vendorId"],
              sources: data["address"] + ":" + data["port"],
              sourceAddrNet: data['sourceAddrNet'],
              sourceAddrAdr: data['sourceAddrAdr']
            });
            // console.log(data)
          }
          // 存储 IAm-router报文
          if (udpData["allNetWork"]) {
            this.props.appstate.NetProgress = udpData["allNetWork"];
          }
          console.log("server:", udpData);
        });
        this.socket.on("disconnect", () => {
          console.log("client disconnect");
        });
        return true;
      }
    });
  }

  // 行选择事件
  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selEquKeys: selectedRowKeys,
        selEquRows: selectedRows
      });
    },
    getCheckboxProps: record => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name
    })
  };
  // 设备表格loading配置对象
  equTabLoadObj = {
    size: "large",
    tip: "Loading",
    indicator: () => (
      <Spin
        indicator={() => <Icon type="home" style={{ fontSize: 24 }} spin />}
      />
    )
  };
  // 展开事件
  expandedRowRender = () => {
    function childExpandeRowRender() {
      return <div></div>;
    }
    return (
      <Table
        rowSelection={this.rowSelection}
        columns={this.columns}
        dataSource={this.props.appstate.allEquimpent}
        pagination={false}
        expandedRowRender={childExpandeRowRender}
      />
    );
  };

  render() {
    const { location } = this.props.router;
    // console.log(location);
    return location.pathname !== "/person" ? (
      <div
        style={{
          display: location.pathname !== "/equipment" ? "none" : "block"
        }}
      >
        <Tabs type="card">
          <TabPane tab="Tab Title 1" key="1">
            <div className="equipment-toos-layout">
              <Button
                onClick={selecChannelHandle.bind(this)}
                type="primary"
                icon="link"
                style={{ marginBottom: 16, marginRight: 16 }}
                loading={this.state.isLoading}
              >
                {`Select Channel: ${this.props.appstate.selectedChannel ||
                  "none"}`}
              </Button>
              <Button
                onClick={this.discoveryHandle}
                type="primary"
                icon="sync"
                loading={this.state.isLoading}
              >
                Discovery
              </Button>
              <span className="equipment-state">
                State:{" "}
                {
                  <b
                    style={
                      this.state.estate
                        ? { color: "#52c41a" }
                        : { color: "red" }
                    }
                  >
                    {this.state.estate ? "online •" : "offline •"}
                  </b>
                }
              </span>
            </div>
            <Table
              loading={this.state.isLoading}
              className="components-table-demo-nested"
              columns={this.mainColumns}
              pagination={{
                position: "bottom",
                defaultPageSize: 30,
                hideOnSinglePage: true
              }}
              defaultExpandedRowKeys={[1]}
              expandedRowRender={this.expandedRowRender}
              dataSource={this.props.appstate.equipmentTableData.slice()}
            />
          </TabPane>
          <TabPane tab="Tab Title 2" key="2">
            <Table
              loading={this.state.isLoading}
              className="components-table-demo-nested"
              columns={this.takeEquipmentColumns}
              pagination={{
                position: "bottom",
                defaultPageSize: 30,
                hideOnSinglePage: true
              }}
              dataSource={this.props.equipmentstate.takeEquiObj.slice()}
            />
          </TabPane>
        </Tabs>
        <ConfigModal
          isShow={this.state.configVisable}
          handleCancel={this.handleCancel}
          handleOk={this.searchEqu}
        />
      </div>
    ) : (
      ""
    );
  }
  componentDidMount() {
    // 开启websocket连接
    this.connectSocket();
  }
  // 关闭socket连接，清空该组件所有关联对象，防止内存泄漏
  componentWillUnmount() {
    if (this.socket) {
      // 退出后关闭websocket连接
      this.socket.close();
      this.socket = null;
    }
    clearTimeout(timer);
    // 卸载异步操作设置状态
    this.setState = (state, callback) => {
      return;
    };
  }
}

const steps = [
  {
    title: "Select",
    content: "First-content"
  },
  {
    title: "Find Router"
  },
  {
    title: "Search",
    content: "Second-content"
  }
];
@inject(allStore => allStore.appstate)
class ConfigModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      selctConfig: "",
      findNetProgress: 0
    };
  }
  render() {
    const { current } = this.state;
    return (
      <Modal
        title="Channel selection"
        visible={this.props.isShow}
        onCancel={this.props.handleCancel}
        footer={
          <div className="steps-action">
            {current > 0 && (
              <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                Previous
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button
                disabled={!this.state.selctConfig}
                type="primary"
                onClick={() => this.next()}
              >
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={this.doneHandle}>
                Start
              </Button>
            )}
          </div>
        }
      >
        <Steps current={current}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{this.stepView(steps[current])}</div>
      </Modal>
    );
  }

  doneHandle = e => {
    this.setState({
      current: 0
    });
    this.props.handleOk(e, this.state);
  };

  selectHandle = (val, opt) => {
    console.log("select", val);
    const { channelDataSource } = this.props.appstate;
    let config;
    if (!channelDataSource.ROOT) {
      return;
    }
    config = channelDataSource.ROOT.CHANNEL.filter(item => {
      return item.ITEM_NAME === val.key;
    });
    this.setState({
      selctConfig: val.key,
      config: { ...config[0] }
    });
  };

  stepView = current => {
    const { channelDataSource } = this.props.appstate;
    let channelData = [];
    if (channelDataSource.ROOT) {
      channelData = channelDataSource.ROOT.CHANNEL;
    }
    switch (current.title) {
      case "Select":
        return (
          <div
            style={{ width: "100%", padding: "0 20px", lineHeight: "100px" }}
          >
            <Select
              labelInValue
              defaultValue={
                this.state.selctConfig
                  ? { key: this.state.selctConfig }
                  : undefined
              }
              placeholder="Select a channel"
              style={{ width: "100%" }}
              onChange={this.selectHandle}
            >
              {channelData.map((item, index) => {
                return (
                  <Option key={index} value={item.ITEM_NAME}>
                    {item.ITEM_NAME}
                  </Option>
                );
              })}
            </Select>
          </div>
        );
      case "Search":
        if (this.state.config) {
          let netConfig = this.state.config.NET_CONFIG;
          const { MAC, NAME, LOCAL_PORT, REMOTE_PORT } = netConfig.MAIN;
          return (
            <div label="Main" style={{ textAlign: "left", padding: "10px" }}>
              local_port: {LOCAL_PORT["#text"]}
              <br />
              remote_port: {REMOTE_PORT["#text"]}
              <br />
              mac: {MAC}
              <br />
              name: {NAME}
              <br />
            </div>
          );
        } else {
          return null;
        }
      case "Find Router":
        return (
          <div className="equipment-find-router">
            <Progress
              percent={this.state.findNetProgress}
              showInfo={true}
              status={this.state.findNetStatus}
            />
            <span style={{ color: "#bbb", marginTop: ".4rem" }}>
              Looking for network number
            </span>
            <br />
            <span>
              {this.props.appstate.filterNetProgress().length || 0} network
              Numbers found{" "}
            </span>
          </div>
        );
      default:
        break;
    }
  };

  next() {
    const current = this.state.current + 1;
    let timer = null;
    let step = 10;
    // 选择通道之后的步骤，获取网络号
    if (current === 1) {
      if (!this.props.appstate.filterNetProgress().length) {
        getUdpNetNum({
          ip: "0.0.0.0",
          local_port: 47808,
          remote_port: 47808
        })
          .then(result => {
            let data = result["data"];
            if (data.errno === 0) {
              // 成功获取网络号
            }
          })
          .catch(err => {
            this.setState({
              findNetStatus: "exception"
            });
            message.error("The network number could not be found");
          });
        timer = setInterval(() => {
          if (this.state.findNetProgress >= 100) {
            clearInterval(timer);
          }
          this.setState({
            findNetProgress: this.state.findNetProgress + step
          });
        }, 50);
        console.log("查找路由");
      }
    }
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }
}

export default Equipment;
