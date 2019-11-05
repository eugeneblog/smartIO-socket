/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React, { useState } from "react";
import { observer, inject } from "mobx-react";
import {
  Table,
  Button,
  Modal,
  message,
  Tabs,
  Row,
  Col,
  Tree,
  Tooltip,
  Icon,
  Progress,
  Statistic
} from "antd";
import * as Socket from "socket.io-client";
import "./index.equipment.css";
import {
  getWhoMsg,
  sendUdpMes,
  startWebsocket,
  searchEquOneObj,
  getEquObjAttribute,
  uploadDataToRedis
} from "../../api/index.api";
import StorageEqu from "./StorageEqu";
import ConfigModal from "./configmodal";
import DeviceSvg from "../../svg/devicelink.svg";
const { TabPane } = Tabs;
const { confirm } = Modal;
const { TreeNode } = Tree;

const selecChannelHandle = function(e) {
  // 显示config modal
  this.setState({
    configVisable: true
  });
};

let selEquKeys = [];
let selEquRows = [];

let timer = null;
// table > tree 节点
function EquipmentTableTree(record) {
  if (!record.property_values) {
    return <div>Click search to get the device object</div>;
  }
  const treeData = record.property_values;
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
    if (!data) {
      return;
    }
    return data.map(node => {
      if (node.children) {
        let val = node.value ? node.value : "";
        return (
          <TreeNode
            title={
              <span>
                {node.object_type_text}: {val}
              </span>
            }
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
          />
        );
      }
    });
  }

  return (
    <Tree showLine autoExpandParent={false}>
      {renderTreeNodes(treeList)}
    </Tree>
  );
}

// 属性进度条
const ProgressOf = props => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Progress type="circle" percent={props.percent} />
        </Col>
        <Col span={12}>
          <Statistic
            title="Unmerged"
            value={props.progreInd}
            suffix={`/ ${props.count}`}
          />
        </Col>
      </Row>
    </div>
  );
};

// 获取对象列表属性modal框组件
const ModalAttribute = inject("appstate")(
  observer(props => {
    const [btnProps, setBtnProps] = useState({ loading: false });
    const { modalData, onCancel } = props;
    const {
      sourceAddrNet,
      sourceAddrAdr,
      sources,
      maxapdu,
      deviceid,
      property_values
    } = modalData;
    let obj_list;
    let { attributeIndex } = props.appstate.equipmentstate;
    // 获取对象类型
    property_values.forEach(item => {
      if (item.objPropertyId === 76) {
        obj_list = item.value.filter(list => {
          // 过滤类型为8的对象 和
          return list.object_type !== 8 && list.object_type !== 17;
        });
      }
    });
    let iter = obj_list[Symbol.iterator]();
    // 开始获取对象属性
    const handleStart = () => {
      setBtnProps({ loading: true });
      let { equipmentData } = props.appstate["appstate"];
      // 递归获取
      let tryIndex = 0;
      function getAllAttribute(iter) {
        let objType = iter.next();
        // 如果已经没有值了，直接退出递归函数
        if (objType.value) {
          console.log(objType);
          return getEquObjAttribute({
            sources,
            maxapdu,
            sourceAddrNet,
            sourceAddrAdr,
            deviceObjType: objType.value
          })
            .then(result => {
              let data = result["data"];
              attributeIndex += 1;
              tryIndex = 0;
              props.appstate.equipmentstate.attributeIndex = attributeIndex;
              // 插入数据
              let attributeData = data["data"];

              let deviceFind = equipmentData.find(ele => {
                return ele.sourceAddrAdr === attributeData["sourceAddr"].adr[0];
              });
              if (deviceFind) {
                // 插入属性
                deviceFind.property_values.forEach(item => {
                  if (item.objPropertyId === 76) {
                    item.value.forEach(list => {
                      if (
                        list.object_type === attributeData["object_type"] &&
                        list.value === attributeData["object_inatance"]
                      ) {
                        // 添加key
                        let childrenData = attributeData["obj_attribute"].map(
                          (item, key) => {
                            return { ...item, key };
                          }
                        );
                        list.children = [...childrenData];
                      }
                    });
                  }
                });
                equipmentData.set(deviceFind.key - 1, {
                  ...deviceFind
                });
              }
              getAllAttribute(iter);
            })
            .catch(err => {
              console.log("未能接收到请求，正在尝试重新发送...");
              tryIndex++;
              console.log(`正在重新发起请求,第${tryIndex}次尝试...`);
              getAllAttribute(iter);
            });
        }
        // 执行完之后, index 归 0, 并且退出递归函数
        setBtnProps({ loading: false });
        // 自动关闭
        onCancel();
        props.appstate.equipmentstate.attributeIndex = 0;
        message.success(
          `${deviceid}Property read successfully, please check in the list`
        );
        return;
      }
      getAllAttribute(iter);
    };

    const handleCancel = () => {
      // 清空index
      return onCancel();
    };

    return (
      <div>
        <Modal
          title="Basic Modal"
          visible={props.isShow}
          okText="Start"
          okButtonProps={btnProps}
          onOk={handleStart}
          onCancel={handleCancel}
        >
          {!attributeIndex ? (
            <p>{`Device ${deviceid} has ${obj_list.length} objects in total. Click the start button to start reading`}</p>
          ) : (
            <ProgressOf
              percent={Math.trunc(
                (props.appstate.equipmentstate.attributeIndex /
                  obj_list.length) *
                  100
              )}
              progreInd={props.appstate.equipmentstate.attributeIndex}
              count={obj_list.length}
            />
          )}
        </Modal>
      </div>
    );
  })
);

// 设备 table 组件
@inject(allStore => allStore.appstate)
@observer
class EquipmentTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandeRow: [],
      modalAttribute: false,
      modalData: undefined
    };
  }
  render() {
    return (
      <React.Fragment>
        <Table
          rowSelection={this.rowSelection}
          columns={this.columns}
          dataSource={this.props.appstate.equipmentData.slice()}
          pagination={false}
          expandRowByClick={false}
          expandedRowRender={record => EquipmentTableTree(record)}
          onExpand={this.onExpandClickHandle}
          expandIcon={this.expandIconRender}
          expandedRowKeys={this.state.expandeRow}
          size="middle"
        />
        {this.state.modalData ? (
          <ModalAttribute
            isShow={this.state.modalAttribute}
            modalData={this.state.modalData}
            onCancel={() => {
              this.setState({ modalAttribute: false });
            }}
          />
        ) : null}
      </React.Fragment>
    );
  }
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
  // 自定义展开图标
  expandIconRender = record => {
    let isPropertyData = Boolean(record["record"].property_values);
    let device = record["record"];
    // 如果该设备已经读取了设备对象，则显示图标
    if (isPropertyData) {
      if (!record.expanded) {
        return (
          <Button
            onClick={() => record.onExpand(device)}
            size="small"
            icon="plus-square"
            type="link"
          />
        );
      } else {
        return (
          <Button
            onClick={() => record.onExpand(device)}
            size="small"
            icon="minus-square"
            type="link"
          />
        );
      }
    }
    return;
  };
  // 获取对象列表
  getEquPropertie = record => {
    const {
      deviceid,
      maxapdu,
      segmenation,
      sources,
      sourceAddrNet,
      sourceAddrAdr,
      object_instance,
      object_type
    } = record;
    return searchEquOneObj({
      deviceid,
      maxapdu,
      segmenation,
      sources,
      sourceAddrNet,
      sourceAddrAdr,
      object_instance,
      object_type
    }).then(result => {
      let data = result["data"];
      // 开始解析设备对象, 全局状态变为loading
      this.props.appstate.globalStatus = "loading";
      return data;
    });
  };

  // 获取所有属性列表
  getAllAttrbutes = record => {
    // 如果没有获取对象列表，return
    if (!record.property_values) {
      message.warning("Get the list of objects first");
      return;
    }
    this.setState({
      modalAttribute: true,
      modalData: record
    });
  };

  columns = [
    {
      title: "DeviceId",
      dataIndex: "deviceid",
      key: "deviceid",
      sortDirections: ["ascend"],
      sortOrder: "ascend",
      defaultSortOrder: "ascend",
      render: (key, record) => {
        return (
          <span style={{ color: "#3e90f7", fontWeight: "bold" }}>
            <Icon component={DeviceSvg} />
            &nbsp;
            {record.deviceid}
          </span>
        );
      }
    },
    {
      title: "Mac",
      dataIndex: "sourceAddrAdr",
      key: "sourceAddrAdr"
    },
    {
      title: "NetNum",
      dataIndex: "sourceAddrNet",
      key: "sourceAddrNet"
    },
    {
      title: "Action",
      key: "key",
      dataIndex: "key",
      render: (key, record) => {
        return (
          <React.Fragment>
            <Tooltip placement="topLeft" title="Search device object">
              <Button
                type="link"
                size="small"
                onClick={() => this.getEquPropertie(record)}
                icon="search"
              />
            </Tooltip>
            <Tooltip placement="topLeft" title="Get all attributes">
              <Button
                disabled={!Boolean(record["property_values"])}
                type="link"
                size="small"
                icon="deployment-unit"
                onClick={() => this.getAllAttrbutes(record)}
              />
            </Tooltip>
          </React.Fragment>
        );
      }
    }
  ];
  // 行选择事件
  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      selEquKeys = selectedRowKeys;
      selEquRows = selectedRows;
    },
    getCheckboxProps: record => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name
    })
  };
}

// 父组件
@inject(allStore => allStore.appstate)
@observer
class Equipment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      configVisable: false,
      isLoading: false,
      estate: false
    };
    this.mainColumns = [
      { title: "Sources", dataIndex: "sources", key: "sources" }
    ];
  }
  // 上传到数据库
  uploadClickHandle = (selequ, allequ) => {
    // 如果没有选择设备，直接return并且提示
    if (!selEquRows.length) {
      message.warning("Please select at least one device !!!");
      return;
    }
    confirm({
      title: "Commit the data to the database",
      onOk: () => {
        // 过滤不需要的数据，传送给后端，格式为 [{deviceId: {...objType: [{"k": v...}]}}...]
        const deviceData = selEquRows.map(list => {
          // 判断该字段是否有对象列表
          let propertyDatas = list.property_values
            ? list.property_values
            : null;
          let objList = [];
          if (propertyDatas) {
            // 处理对象列表
            objList = [
              {
                object_type: list.object_type,
                object_inatance: list.object_instance,
                property_values: [...list.property_values]
              }
            ];
          }
          return {
            device_name: list.deviceid,
            sourceAddrAdr: list.sourceAddrAdr,
            sourceAddrNet: list.sourceAddrNet,
            objList
          };
        });
        // console.log(JSON.stringify(deviceData))
        return uploadDataToRedis({
          deviceData: deviceData
        }).then(result => {
          console.log(result);
        });
      }
    });
  };
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
          // 存储 对象列表报文
          if (udpData["property_values"]) {
            if (!udpData["property_values"].length) {
              return;
            }
            this.props.equipmentstate.propertyDataSour = udpData;
            this.props.appstate.equipmentData = this.props.appstate.equipmentData.map(
              item => {
                let len = udpData["sourceAddr"].len;
                let mac = udpData["sourceAddr"].adr[len - 1];
                let net = udpData["sourceAddr"].net;
                if (
                  item["sourceAddrNet"] === net &&
                  item["sourceAddrAdr"] === mac
                ) {
                  item.object_type = udpData["object_type"];
                  item.object_instance = udpData["object_inatance"];
                  item.property_values = udpData.property_values.map(
                    (item, index) => {
                      return {
                        key: index,
                        ...item
                      };
                    }
                  );
                }
                return item;
              }
            );
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
                onClick={() => this.uploadClickHandle(selEquKeys, selEquRows)}
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
                    title={() => <span>Discovered</span>}
                    loading={this.state.isLoading}
                    size="middle"
                    className="components-table-demo-nested"
                    columns={this.mainColumns}
                    pagination={{
                      position: "bottom",
                      defaultPageSize: 30,
                      hideOnSinglePage: true
                    }}
                    defaultExpandedRowKeys={[1]}
                    expandedRowRender={() => <EquipmentTable />}
                    dataSource={this.props.appstate.equipmentTableData.slice()}
                  />
                </div>
              </Col>
              <Col className="gutter-row" span={10}>
                <StorageEqu title="Database" />
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

export default Equipment;
