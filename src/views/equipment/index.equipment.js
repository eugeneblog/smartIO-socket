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
  Select
} from "antd";
import "./index.equipment.css";
const { Step } = Steps;
const { Option } = Select;

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Platform", dataIndex: "platform", key: "platform" },
  { title: "Version", dataIndex: "version", key: "version" },
  { title: "Upgraded", dataIndex: "upgradeNum", key: "upgradeNum" },
  { title: "Creator", dataIndex: "creator", key: "creator" },
  { title: "Date", dataIndex: "createdAt", key: "createdAt" },
  {
    title: "Action",
    key: "operation",
    render: () => <a href="javascript:;">Publish</a>
  }
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

const data = [];
for (let i = 0; i < 3; ++i) {
  data.push({
    key: i,
    name: "Screem",
    platform: "iOS",
    version: "10.3.4.5654",
    upgradeNum: 500,
    creator: "Jack",
    createdAt: "2014-12-24 23:12:00"
  });
}
const searchHandle = function(e) {
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
      isLoading: false
    };
  }
  handleOk = e => {
    this.setState({
      configVisable: false,
      isLoading: true
    });
    timer = setTimeout(() => {
      this.setState({
        isLoading: false
      });
    }, 2000);
  };

  handleCancel = e => {
    this.setState({
      configVisable: false
    });
  };

  render() {
    return (
      <React.Fragment>
        <Button
          onClick={searchHandle.bind(this)}
          type="primary"
          icon="search"
          style={{ marginBottom: 16, marginRight: 16 }}
          loading={this.state.isLoading}
        >
          Search
        </Button>
        <Table
          loading={this.state.isLoading}
          className="components-table-demo-nested"
          columns={columns}
          expandedRowRender={expandedRowRender}
          dataSource={data}
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
                Done
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
  doneHandle = () => {
    this.setState({
      current: 0
    });
    this.props.handleOk();
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
