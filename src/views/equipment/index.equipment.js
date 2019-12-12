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
  searchEquOneObj,
  getEquObjAttribute,
  uploadDataToRedis,
  initUdpSocket
} from "../../api/index.api";
import { StorageEqu } from "./StorageEqu";
import ConfigModal from "./configmodal";
import DeviceSvg from "../../svg/devicelink.svg";
// import { websocketStart } from '../../utils/websocketRequest'
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
          expandedRowRender={record => this.EquipmentTableTree(record)}
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

  // table 下的treeNode
  EquipmentTableTree = record => {
    const allData = record.property_values;
    const treeData = this.props.equipmentstate.getObjListTreeNode(allData);

    const renderTreeNode = data => {
      return data.map(item => {
        if (item.children) {
          return (
            <TreeNode
              title={item.title}
              key={item.key}
              dataRef={item}
              {...item}
            >
              {renderTreeNode(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.key} {...item} />;
      });
    };

    const onCheck = (checkedKeys, info) => {
      console.log("onCheck", checkedKeys, info);
    };

    return (
      <Tree showLine autoExpandParent={false} onCheck={onCheck}>
        {renderTreeNode(treeData)}
      </Tree>
    );
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
      let data = result["data"].data;
      this.props.equipmentstate.propertyDataSour = data;
      this.props.appstate.equipmentData = this.props.appstate.equipmentData.map(
        item => {
          let len = data["sourceAddr"].len;
          let mac = data["sourceAddr"].adr[len - 1];
          let net = data["sourceAddr"].net;
          if (item["sourceAddrNet"] === net && item["sourceAddrAdr"] === mac) {
            item.object_type = data["object_type"];
            item.object_instance = data["object_inatance"];
            item.property_values = data.property_values.map((item, index) => {
              return {
                key: index,
                ...item
              };
            });
          }
          return item;
        }
      );
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
      title: "Device",
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
      estate: false,
      equIndex: 0
    };
    this.mainColumns = [
      { title: "Sources", dataIndex: "sources", key: "sources" }
    ];
  }
  // 上传到数据库
  uploadClickHandle = (selequ, allequ) => {
    let checkedObjs = [];
    // 如果没有选择设备，直接return并且提示
    if (!selEquRows.length) {
      message.warning("Please select at least one device !!!");
      return;
    }
    const ModalTree = () => {
      const onCheck = (checkedKeys, e) => {
        // 过滤父亲节点
        const pattern = /^(\d)+:(\d)+:(\d)+$/;
        const { checkedNodes } = e;
        // 过滤除对象以外所有不想干的节点
        if (checkedKeys.length) {
          let objArr = checkedNodes.filter(item => pattern.test(item.key));
          // 全选
          const readHash = data => {
            let obj = {};
            data.forEach(item => {
              obj[item.props.objName] = item.props.value;
            });
            return obj;
          };
          checkedObjs = objArr.map(item => {
            const __defaultHash = {
              OBJECT_TYPE: item.key.split(":")[1],
              OBJECT_INSTANCE: item.key.split(":")[2]
            };
            return {
              key: item.key,
              hash: !item.props.children
                ? __defaultHash
                : readHash(item.props.children)
            };
          });
          // 组装好数据，给发送到后端做准备，数据格式 [{key, subKey, val}...]
        }
        return;
      };

      const treeData = selEquRows.map((item, key) => {
        const __default = [
          {
            key: `${item.deviceid}:8:0:0`,
            title: `DEVICE_NAME: ${item.deviceid}`,
            objName: "DEVICE_NAME",
            value: item.deviceid,
            checkable: false
          },
          {
            key: `${item.deviceid}:8:0:1`,
            title: `SOURCES: ${item.deviceid}`,
            objName: "SOURCES",
            value: item.sources,
            checkable: false
          },
          {
            key: `${item.deviceid}:8:0:2`,
            title: `NET: ${item.sourceAddrNet}`,
            objName: "NET",
            value: item.sourceAddrNet,
            checkable: false
          },
          {
            key: `${item.deviceid}:8:0:3`,
            title: `MAC: ${item.sourceAddrAdr}`,
            objName: "MAC",
            value: item.sourceAddrAdr,
            checkable: false
          }
        ];
        if (item.property_values) {
          // 过滤除obj_list 以外的所有对象
          const obj_list = item.property_values.filter(
            list => list.objPropertyId === 76
          )[0].value;
          // 提取device属性
          const device_data = item.property_values.filter(
            item => item.objPropertyId !== 76
          );
          obj_list.forEach(ele => {
            if (ele.object_type === 8) {
              ele.children = device_data;
            }
          });
          // 数组对象去重
          var myOrderedArray = obj_list.reduce(function(
            accumulator,
            currentValue
          ) {
            if (
              accumulator.findIndex(
                ele => ele.object_type === currentValue.object_type
              ) === -1
            ) {
              accumulator.push(currentValue);
            }
            return accumulator;
          },
          []);
          const recursiveObjList = (data, pId) => {
            return data.map((item, key) => {
              if (item.children) {
                return {
                  title: `${item.object_type_text}: ${item.value}`,
                  key: `${pId}:${key}`,
                  children: recursiveObjList(item.children, `${pId}:${key}`)
                };
              }
              return {
                title: `${item.object_type_text}: ${item.value}`,
                key: `${pId}:${key}`,
                objName: item.object_type_text,
                value: item.value,
                checkable: pId.split(":").length >= 3 ? false : true
              };
            });
          };

          let children = myOrderedArray.map(group => {
            return {
              title: `${group.object_type_text}`,
              key: `${item.deviceid}:${group.object_type}`,
              children: recursiveObjList(
                obj_list.filter(ele => ele.object_type === group.object_type),
                `${item.deviceid}:${group.object_type}`
              )
            };
          });
          children[0].children[0].children.push(
            {
              key: Math.random() * new Date().getDate(),
              title: `SOURCES: ${item.deviceid}`,
              objName: "SOURCES",
              value: item.sources,
              checkable: false
            },
            {
              key: Math.random() * new Date().getDate(),
              title: `NET: ${item.sourceAddrNet}`,
              objName: "NET",
              value: item.sourceAddrNet,
              checkable: false
            },
            {
              key: Math.random() * new Date().getDate(),
              title: `MAC: ${item.sourceAddrAdr}`,
              objName: "MAC",
              value: item.sourceAddrAdr,
              checkable: false
            }
          );
          return {
            title: `${item.deviceid}`,
            key: item.deviceid,
            children
          };
        }
        // 没有读取对象列表的情况默认添加类型为8的对象
        return {
          title: `${item.deviceid}`,
          key,
          value: item.deviceid,
          children: [
            {
              title: "Device",
              key: `${item.deviceid}:8:0`,
              children: __default
            }
          ]
        };
      });
      const renderTreeNodes = data =>
        data.map(item => {
          if (item.children) {
            return (
              <TreeNode title={item.title} key={item.key} dataRef={item}>
                {renderTreeNodes(item.children)}
              </TreeNode>
            );
          }
          return <TreeNode key={item.key} {...item} />;
        });
      return (
        <Tree
          checkable
          showLine
          autoExpandParent={false}
          onCheck={onCheck}
          defaultExpandParent
          defaultCheckedKeys={[]}
        >
          {renderTreeNodes(treeData)}
        </Tree>
      );
    };
    confirm({
      title: "Commit the data to the database",
      content: <ModalTree />,
      onOk: () => {
        /**
         * @method uploadDataToRedis
         * @param{json} keys - redis key 格式: divice:objType:objNum
         */
        return uploadDataToRedis({
          keys: [...checkedObjs]
        });
      }
    });
  };
  // 搜索设备
  searchEqu = () => {
    // 获取选择的通道配置
    const { selectedChannelData } = this.props.appstate;
    getWhoMsg({ ip: selectedChannelData.NET_CONFIG.MAIN.IP }).then(
      whoMsgRes => {
        let data = whoMsgRes["data"];
        if (data.errno > -1) {
          this.handleCancel();
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
          }, 500);
        }
      }
    );
  };

  // 重载设备
  discoveryHandle = e => {
    const { selectedChannelData } = this.props.appstate;
    this.setState({
      isLoading: true
    });
    getWhoMsg({ ip: selectedChannelData.NET_CONFIG.MAIN.IP }).then(
      whoMsgRes => {
        let data = whoMsgRes["data"];
        if (data.errno > -1) {
          this.handleCancel();
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
          }, 500);
        }
      }
    );
  };

  handleCancel = e => {
    this.setState({
      configVisable: false
    });
  };
  // 连接websocket
  connectSocket() {
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
      if (udpData["iAmData"]) {
        let data = udpData["iAmData"];
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
          this.setState(
            {
              equIndex: this.state.equIndex + 1
            },
            () => {
              this.props.appstate.equipmentData.push({
                key: this.state.equIndex,
                deviceid: data["deviceId"],
                maxapdu: data["maxapdu"],
                segmenation: data["segment"],
                vendorid: data["vendorId"],
                sources: data["address"] + ":" + data["port"],
                sourceAddrNet: data["sourceAddrNet"],
                sourceAddrAdr: data["sourceAddrAdr"]
              });
            }
          );
        }
        return;
        // console.log(data)
      }
      // 存储 IAm-router报文
      if (udpData["allNetWork"]) {
        this.props.appstate.NetProgress = udpData["allNetWork"];
      }
      console.log("server:", udpData);
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
          </TabPane>
          <TabPane tab="DataBase" key="2">
            <StorageEqu title="Database" />
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
    this.props.appstate
      .setSelectedChannel()
      .then(data => {
        return initUdpSocket({
          ip: data.NET_CONFIG.MAIN.IP,
          local_port: data.NET_CONFIG.MAIN.LOCAL_PORT["#text"],
          remote_port: data.NET_CONFIG.MAIN.REMOTE_PORT["#text"]
        });
      })
      .then(res => {
        console.log("初始化udp 套接字");
      });
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
