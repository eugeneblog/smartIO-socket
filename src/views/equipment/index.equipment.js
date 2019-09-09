/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React from "react";
import { observer, inject } from "mobx-react";
import {
  Table,
  Badge,
  Menu,
  Dropdown,
  Icon,
  Button,
  Modal,
  Steps,
  Select,
  message
} from "antd";
import * as Socket from "socket.io-client";
import "./index.equipment.css";
import { getWhoMsg, sendUdpMes, startWebsocket } from "../../api/index.api";
// const SocketClient = Socket();
const { Step } = Steps;
const { Option } = Select;

const columns = [
  {
    title: "DeviceId",
    dataIndex: "deviceid",
    key: "deviceid",
    render: text => (
      <span>
        <Icon type="hdd" theme="twoTone" style={{paddingRight: ".4em"}} />
        {text}
      </span>
    )
  },
  { title: "Maxapdu", dataIndex: "maxapdu", key: "maxapdu" },
  { title: "Segmenation", dataIndex: "segmenation", key: "segmenation" },
  { title: "Vendor id", dataIndex: "vendorid", key: "vendorid" },
  { title: "Sources", dataIndex: "sources", key: "sources" }
];

const menu = (
  <Menu>
    <Menu.Item>Action 1</Menu.Item>
    <Menu.Item>Action 2</Menu.Item>
  </Menu>
);

const expandedRowRender = () => {
  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Status",
      key: "state",
      render: () => (
        <span>
          <Badge status="success" />
          Finished
        </span>
      )
    },
    { title: "Upgrade Status", dataIndex: "upgradeNum", key: "upgradeNum" },
    {
      title: "Action",
      dataIndex: "operation",
      key: "operation",
      render: () => (
        <span className="table-operation">
          <a href="javascript:;">Pause</a>
          <a href="javascript:;">Stop</a>
          <Dropdown overlay={menu}>
            <a href="javascript:;">
              More <Icon type="down" />
            </a>
          </Dropdown>
        </span>
      )
    }
  ];

  const data = [];
  for (let i = 0; i < 3; ++i) {
    data.push({
      key: i,
      date: "2014-12-24 23:12:00",
      name: "This is production name",
      upgradeNum: "Upgraded: 56"
    });
  }
  return <Table columns={columns} dataSource={data} pagination={false} />;
};

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
  constructor() {
    super();
    this.state = {
      configVisable: false,
      current: 0,
      isLoading: false,
      timeout: 1000,
      estate: false
    };
  }
  handleOk = (e, config) => {
    // 获取选择的通道配置
    const { selctConfig } = config;
    this.setState({
      selctConfig
    });
    // 开启websocket连接, 获取要发送的信息, 发送udp消息
    this.connectSocket()
      .then(isStart => {
        return getWhoMsg();
      })
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
        return sendUdpMes({ ip: "0.0.0.0", port: 47808, mes: mes });
      })
      .then(udpData => {
        const udpResult = udpData["data"];
        if (udpResult.errno === 0) {
          this.setState({
            isLoading: false
          });
        }
      })
      .catch(err => {
        message.info("Failed to locate device");
      });
  };

  discoveryHandle = e => {
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
          return sendUdpMes({ ip: "0.0.0.0", port: 47808, mes: mes });
        });
      this.connectSocket();
      // 获取who_msg
      this.setState({
        configVisable: false,
        isLoading: true
      });
      timer = setTimeout(() => {
        this.setState({
          isLoading: false
        });
      }, 1000);
    } else {
      message.info("Please select the channel configuration first");
    }
  };

  handleCancel = e => {
    this.setState({
      configVisable: false
    });
  };

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
          // 存储服务端消息
          let data = udpData["iAmData"];
          if (data && data["sourceAddr"] !== "192.168.153.104") {
            this.props.appstate.equipmentData.push({
              key: (index += 1),
              deviceid: data["deviceId"],
              maxapdu: data["maxapdu"],
              segmenation: data["segment"],
              vendorid: data["vendorId"],
              sources: data["address"] + ":" + data["port"]
            });
            // console.log(data)
            console.log("server:", data);
          }
        });
        this.socket.on("disconnect", () => {
          console.log("client disconnect");
        });
        return true;
      }
    });
  }

  render() {
    return (
      <React.Fragment>
        <Button
          onClick={selecChannelHandle.bind(this)}
          type="primary"
          icon="link"
          style={{ marginBottom: 16, marginRight: 16 }}
          loading={this.state.isLoading}
        >
          {`Select Channel: ${this.state.selctConfig || "none"}`}
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
              style={this.state.estate ? { color: "green" } : { color: "red" }}
            >
              {this.state.estate ? "online •" : "offline •"}
            </b>
          }
        </span>
        <Table
          loading={this.state.isLoading}
          className="components-table-demo-nested"
          columns={columns}
          pagination={{
            position: "bottom",
            defaultPageSize: 30,
            hideOnSinglePage: true
          }}
          expandedRowRender={expandedRowRender}
          dataSource={this.props.appstate.allEquimpent}
        />
        <ConfigModal
          isShow={this.state.configVisable}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
        />
      </React.Fragment>
    );
  }
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
      selctConfig: ""
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
          const { IP, MAC, NAME, PORT } = netConfig.MAIN;
          return (
            <div label="Main" style={{ textAlign: "left", padding: "10px" }}>
              IP: {IP}
              <br />
              mac: {MAC}
              <br />
              name: {NAME}
              <br />
              port: {PORT["#text"]}
              <br />
            </div>
          );
        } else {
          return null;
        }
      default:
        break;
    }
  };
  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }
}

export default Equipment;
