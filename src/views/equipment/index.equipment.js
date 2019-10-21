/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React from "react";
import { observer, inject } from "mobx-react";
import {
  Table,
  Menu,
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
  Tabs,
  Row,
  Col,
  Tree
} from "antd";
import * as Socket from "socket.io-client";
import "./index.equipment.css";
import {
  getWhoMsg,
  getUdpNetNum,
  sendUdpMes,
  startWebsocket,
  searchEquOneObj,
  uploadDataToRedis
} from "../../api/index.api";
import SavedEqu from "./savedEqu";
// const SocketClient = Socket();
const { TabPane } = Tabs;
const { Step } = Steps;
const { Option } = Select;
const { confirm } = Modal;
const { TreeNode } = Tree;

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
      findNetStatus: "",
      expandeRow: []
    };

    this.mainMenu = () => {
      return (
        <Menu>
          <Menu.Item
            onClick={() =>
              this.exportEquSel(this.state.selEquKeys, this.state.selEquRows)
            }
          >
            Export the selected object
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
        </Menu>
      );
    };

    this.mainColumns = [
      { title: "Sources", dataIndex: "sources", key: "sources" }
    ];

    this.columns = [
      { title: "DeviceId", dataIndex: "deviceid", key: "deviceid" },
      {
        title: "Action",
        key: "key",
        dataIndex: "key",
        render: (key, record) => {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => this.getEquPropertie(record)}
            >
              > > >
            </Button>
          );
        }
      }
    ];

    this.takeEquipmentColumns = [
      { title: "objProperty", dataIndex: "objProperty", key: "objProperty" },
      { title: "value", dataIndex: "value", key: "value" },
      {
        title: "Segmenation",
        key: "segmenation",
        dataIndex: "segmenation"
      }
    ];
  }
  // 获取对象列表
  getEquPropertie = record => {
    const {
      deviceid,
      maxapdu,
      segmenation,
      sources,
      sourceAddrNet,
      sourceAddrAdr
    } = record;
    return searchEquOneObj({
      deviceid,
      maxapdu,
      segmenation,
      sources,
      sourceAddrNet,
      sourceAddrAdr
    }).then(result => {
      let data = result["data"];
      // 开始解析设备对象, 全局状态变为loading
      this.props.appstate.globalStatus = "loading";
      return data;
    });
  };
  // 导出单个设备
  exportEquOne = record => {
    // 存入数据库，读取设备对象，参数：设备, 对象, 属性
  };

  // 上传到数据库
  uploadClickHandle = () => {
    const { takeEquiObj } = this.props.equipmentstate;
    console.log(takeEquiObj);
    confirm({
      title: "Commit the data to the database",
      onOk: () => {
        return uploadDataToRedis({
          deviceId: "test1001",
          obj: 2,
          attribute: { a: 1, b: 2 }
        }).then(result => {
          console.log(result);
        });
      }
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
    console.log(selRecordKey, selRecordRow);
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
                </List.Item>
              )}
            />
          </div>
        ),
        onOk: () => {
          return new Promise(resolve => {
            setTimeout(() => {
              this.props.equipmentstate.takeEquiObj = selRecordRow;
              resolve();
            }, 500);
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
          this.props.equipmentstate.takeEquiObj = selRecordRow;
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
    // 判断是否已经存在数据
    if (this.props.appstate.equipmentData.length) {
      confirm({
        title: "Do you want ",
        content: "You will empty the device and retrieve the device list",
        onOk: () => {
          this.props.appstate.equipmentTableData = [];
          this.setState(
            {
              configVisable: false
            },
            () => {
              // 开始新一轮设备搜索
            }
          );
          return;
        }
      });
      return;
    }
    getWhoMsg()
      .then(whoMsgRes => {
        let data = whoMsgRes["data"];
        let { bclcEncodeOriginalRes, pduData } = data;
        pduData = pduData["data"].slice(0, bclcEncodeOriginalRes).map(item => {
          return item.toString(16).length > 1
            ? "0x" + item.toString(16)
            : "0x0" + item.toString(16);
        });
        return pduData;
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
                "Timeout, please check network or configuration!"
              );
            }
            this.setState({
              isLoading: false
            });
          }, 1500);
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
      // this.socket.close();
      // this.props.appstate.equipmentData = [];
      // 开启websocket连接, 获取要发送的信息, 发送udp消息
      getWhoMsg()
        .then(res => {
          let data = res["data"];
          let { bclcEncodeOriginalRes, pduData } = data;
          pduData = pduData["data"]
            .slice(0, bclcEncodeOriginalRes)
            .map(item => {
              return item.toString(16).length > 1
                ? "0x" + item.toString(16)
                : "0x0" + item.toString(16);
            });
          return pduData;
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
          message.warning("Timeout, please check network or configuration!");
        }
        this.setState({
          isLoading: false
        });
      }, 1500);
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
            // 如果equipmentData里面有该设备了则不进行插入操作
            let isThere = this.props.appstate.equipmentData.findIndex(item => {
              return data["deviceId"] === item.deviceid;
            });
            if (isThere === -1) {
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
                sourceAddrNet: data["sourceAddrNet"],
                sourceAddrAdr: data["sourceAddrAdr"]
              });
            }
            return;
            // console.log(data)
          }
          // 存储 IAm-router报文
          if (udpData["allNetWork"]) {
            this.props.appstate.NetProgress = udpData["allNetWork"];
          }
          // 存储 属性报文
          if (udpData["property_data"]) {
            this.props.equipmentstate.propertyDataSour = udpData;
            this.props.appstate.equipmentData.forEach(item => {
              if (item.deviceid === udpData.device_inatance) {
                item.property_data = udpData.property_data.map(
                  (item, index) => {
                    return {
                      key: index,
                      ...item
                    };
                  }
                );
              }
            });
            this.props.appstate.globalStatus = "ready";
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
  onExpandClickHandle = (expanded, record) => {
    if (expanded) {
      this.setState({
        expandeRow: [record.key]
      });
    } else {
      this.setState({
        expandeRow: []
      });
    }
  };

  // 属性table
  childExpandeRowRender = record => {
    if (!record.property_data) {
      return <div>Click search to get the device object</div>;
    }
    const treeData = record.property_data;
    let treeList = [];
    // 改变原始数据结构，在数据上进行分类
    let Obj_list = {
      object_type_text: undefined
    };
    let Other_list = {
      key: "0-0-0",
      object_type_text: "Device info",
      children: []
    };
    // 拆分objlist
    function breakUp(arr) {
      let result = [];
      arr.forEach((item, index) => {
        if (!arr[index + 1]) {
          return;
        }
        if (item.object_type !== arr[index + 1].object_type) {
          let obj_group = {
            object_type: item.object_type,
            key: `0-0-0-${index}`,
            object_type_text: item.object_type_text,
            children: []
          };
          result.push(obj_group);
        }
      });
      result.forEach(item => {
        // 过滤不相同类型的type
        let type = item.object_type;
        let childNode = arr.filter((item, key) => {
          item.key = `0-0-0-0-${key}`;
          return type === item.object_type;
        });
        item.children.push(...childNode);
      });
      return result;
    }
    treeData.forEach((list, key) => {
      if (list.objPropertyId === 76) {
        // 再根据obj_type 细分
        let childResult = breakUp(list.value);
        Obj_list.objPropertyId = list.objPropertyId;
        Obj_list.children = [...childResult];
        Obj_list.key = `0-0-1`;
        return;
      }
      if (list.objPropertyId === 70) {
        Obj_list.object_type_text = list.value;
        return;
      }
      list.key = `0-0-0-${key}`;
      Other_list.children.push(list);
    });
    treeList.push(Other_list, Obj_list);

    function renderTreeNodes(data) {
      return data.map(node => {
        if (node.children) {
          return (
            <TreeNode
              title={<span>{node.object_type_text}: </span>}
              key={node.key}
            >
              {renderTreeNodes(node.children)}
            </TreeNode>
          );
        } else {
          let val = node.value;
          if (typeof val === "object") {
            val = "...obj";
          }
          return (
            <TreeNode
              title={
                <span>
                  {node.object_type_text}: {val}
                </span>
              }
              key={node.key}
            ></TreeNode>
          );
        }
      });
    }

    return (
      <React.Fragment>
        <Tree showLine defaultExpandedKeys={["0-0-0"]} autoExpandParent={false}>
          {renderTreeNodes(treeList)}
        </Tree>
      </React.Fragment>
    );
  };
  // 设备table
  expandedRowRender = () => {
    return (
      <Table
        rowSelection={this.rowSelection}
        columns={this.columns}
        dataSource={this.props.appstate.equipmentData.slice()}
        pagination={false}
        expandRowByClick={false}
        expandedRowRender={this.childExpandeRowRender}
        onExpand={this.onExpandClickHandle}
        expandedRowKeys={this.state.expandeRow}
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
          <TabPane tab="Equipment" key="1">
            <div className="equipment-toos-layout">
              <Button
                onClick={selecChannelHandle.bind(this)}
                type="primary"
                icon="link"
                size="small"
                loading={this.state.isLoading}
              >
                {`Select Channel: ${this.props.appstate.selectedChannel ||
                  "none"}`}
              </Button>
              <Button
                onClick={this.discoveryHandle}
                type="primary"
                icon="sync"
                size="small"
                loading={this.state.isLoading}
              >
                Discovery
              </Button>
              <Button
                onClick={() =>
                  this.exportEquSel(
                    this.state.selEquKeys,
                    this.state.selEquRows
                  )
                }
                type="primary"
                icon="plus"
                size="small"
                loading={this.state.isLoading}
              >
                Add
              </Button>
              <Button
                onClick={this.uploadClickHandle}
                type="primary"
                size="small"
                icon="plus"
                loading={this.state.isLoading}
              >
                Upload
              </Button>
            </div>
            <Row gutter={16}>
              <Col className="gutter-row" span={14}>
                <div className="equipment-divier">
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
                </div>
              </Col>
              <Col className="gutter-row" span={10}>
                <div className="equipment-divier">
                  <SavedEqu />
                </div>
              </Col>
            </Row>
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
    this.props.handleOk(e, this.state);
    this.setState({
      current: 0
    });
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
