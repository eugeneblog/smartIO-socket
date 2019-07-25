import React from "react";
import { Tabs, Form, Select, Button, InputNumber } from "antd";
import { observer, inject } from "mobx-react";
import { updateChannel } from "../../api/index.api";

const { Option } = Select;
const { TabPane } = Tabs;
let submitTime;

@inject(allStore => allStore.appstate)
@observer
class FormPanel extends React.Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
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
            {getFieldDecorator(`node${Com.id}`, {
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
            {getFieldDecorator(`node${Com.id}`, {
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
            {getFieldDecorator(`node${Com.id}`, {
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
      // 更新数据到后端
      updateChannel(this.props.appstate.channelTabData, {
        filename: "channel"
      }).then(result => {
        console.log(result);
      });
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
    return (
      <div className="card-container">
        <Tabs type="card">{this.createTabPanes(this.props.tabData)}</Tabs>
      </div>
    );
  }

  // 更改main配置
  onNetChangeHandle = (sel, parameter, key) => {
    this.props.appstate.setNetProperty(sel, parameter, key);
  };

  createTabPanes(panes) {
    return panes.map(item => {
      return (
        <TabPane tab={item.title} key={item.key}>
          <WrappedApp
            formData={item.main}
            onNetChange={(par, sel) =>
              this.onNetChangeHandle(par, sel, item.key)
            }
          />
        </TabPane>
      );
    });
  }
}

export default PropertyPanel;
