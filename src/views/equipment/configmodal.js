import React from "react";
import { Modal, Button, Select, Progress, Steps, message } from "antd";
import { inject } from "mobx-react";
import { getUdpNetNum } from "../../api/index.api";

const { Option } = Select;
const { Step } = Steps;

const steps = [
  {
    title: "Select",
    content: "First-content"
  },
  {
    title: "Find Router"
  }
];

@inject(allStore => allStore.appstate)
class ConfigModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
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
                disabled={!this.props.appstate.selectedChannel}
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
    this.props.handleOk();
    this.setState({
      current: 0
    });
  };

  selectHandle = (val, opt) => {
    const { channelDataSource } = this.props.appstate;
    let config;
    if (!channelDataSource.ROOT) {
      return;
    }
    config = channelDataSource.ROOT.CHANNEL.filter(item => {
      return item.ITEM_NAME === val.key;
    });
    this.props.appstate.selectedChannel = val.key
    this.props.appstate.selectedChannelData = config
    this.setState({
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
                this.props.appstate.selectedChannel
                  ? { key: this.props.appstate.selectedChannel }
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

export default ConfigModal;
