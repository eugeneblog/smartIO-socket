import React from "react";
import { Tabs, Form, Select, InputNumber } from "antd";
import { observer, inject } from "mobx-react";
import { updateChannel } from "../../api/index.api";

const { Option } = Select;
const { TabPane } = Tabs;
let submitTime;

@inject(allStore => allStore.appstate)
@observer
class FormPanel extends React.Component {
  handleSubmit = e => {
    // e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        const { selectedChannel } = this.props.appstate;
        this.props.onNetChange(selectedChannel, values);
      }
    });
  };

  render() {
    return (
      <Form
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 8 }}
        onSubmit={this.handleSubmit}
      >
        {this.props.formData.map((item, index) => {
          return this.decisionCom(item, index);
        })}
      </Form>
    );
  }

  onNetSelectorHandle = sel => {
    let nowSel = this.props.appstate.net.filter(item => {
      return item.name === sel;
    });
    // 获取ipv4, 更改属性值
    let ipv4 = nowSel[0].ipv4;
    if (ipv4[0]) {
      let { address, mac } = ipv4[0];
      this.props.onNetChange(sel, { address, mac });
    }
  };

  decisionCom = (Com, key) => {
    const { getFieldDecorator } = this.props.form;
    switch (Com.type) {
      case "span":
        return (
          <Form.Item label={Com.label} key={Com.id}>
            <span>{Com.value}</span>
          </Form.Item>
        );
      case "netconfig":
        return (
          <Form.Item label={Com.label} key={Com.id}>
            {getFieldDecorator(Com.label, {
              rules: [{ required: false, message: "Please input your note!" }],
              initialValue: Com.value
            })(
              <Select
                onSelect={this.onNetSelectorHandle}
                style={{ width: 120 }}
              >
                {this.props.appstate.net.map((item, index) => {
                  return (
                    <Option key={index} value={item.name}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        );
      case "select":
        return (
          <Form.Item label={Com.label} key={Com.id}>
            {getFieldDecorator(Com.label, {
              rules: [{ required: false, message: "Please input your note!" }],
              initialValue: Com.value
            })(
              <Select style={{ width: 200 }}>
                <Option value={1}>1</Option>
                <Option value={2}>2</Option>
              </Select>
            )}
          </Form.Item>
        );
      case "number":
        return (
          <Form.Item label={Com.label} key={Com.id}>
            {getFieldDecorator(Com.label, {
              rules: [{ required: false, message: "Please input your note!" }],
              initialValue: Com.value
            })(<InputNumber style={{ width: 200 }} />)}
          </Form.Item>
        );
      default:
        return (
          <Form.Item label={Com.label} key={Com.id}>
            <span>{Com.value}</span>
          </Form.Item>
        );
    }
  };

  // 在这个钩子自动更新数据到后端
  componentDidUpdate() {
    // 防止请求重复
    if (!submitTime) {
      // 触发提交submit函数
      this.handleSubmit();
      submitTime = true;
      setTimeout(() => {
        submitTime = false;
      }, 50);
    }
  }
}

const WrappedApp = Form.create({ name: "coordinated" })(FormPanel);

@inject(allStore => allStore.appstate)
@observer
class PropertyPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      isShow: false
    };
  }
  render() {
    let { propertyData } = this.props.appstate;
    return (
      <div className="card-container">
        <Tabs type="card">{this.createTabPanes(propertyData)}</Tabs>
      </div>
    );
  }

  // 提交config配置
  onNetChangeHandle = (sel, parameter, key, form) => {
    // 处理数据
    const { channelDataSource } = this.props.appstate;
    let CHANNEL = channelDataSource.ROOT.CHANNEL;
    const len = CHANNEL.length;
    const pane = form.title.toUpperCase()
    if (!len) {
      let obj = CHANNEL.NET_CONFIG[pane]
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const element = obj[key];
          if (parameter[key]) {
            element['#text'] = parameter[key]
          }
        }
      }
    } else {
      CHANNEL.forEach((item, index) => {
        if (index === key) {
          let obj = item.NET_CONFIG[pane]
          for (const key in obj) {
            if (parameter[key]) {
              obj[key]['#text'] = parameter[key]
            }
          }
        }
      })
    }
    // // // 更新数据到后端
    let newData = {
      newData: JSON.stringify(channelDataSource.ROOT.CHANNEL)
    };
    updateChannel(newData).then(result => {
      const { errno } = result["data"];
      if (errno === 0) {
        console.log("%cupdateData...", "color:green;font-weight:bold;");
      }
    });
  };

  createTabPanes(panes) {
    return panes.map(item => {
      return (
        <TabPane tab={item.title} key={item.key}>
          <WrappedApp
            formData={item.main}
            onNetChange={(sel, par) =>
              this.onNetChangeHandle(sel, par, item.key, item)
            }
          />
        </TabPane>
      );
    });
  }
}

export default PropertyPanel;
