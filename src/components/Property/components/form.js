import React from "react";
import { Form, Input, Select, Button, InputNumber } from "antd";
import { observer, inject } from "mobx-react";

const { Option } = Select;

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
        <Form.Item>
          <Button type="primary">Save</Button>
        </Form.Item>
      </Form>
    );
  }

  onNetSelectorHandle = (sel) => {
    let nowSel = this.props.appstate.net.filter(item => {
      return item.name === sel
    })
    // 获取ipv4, 更改属性值
    let ipv4 = nowSel[0].ipv4
    if (ipv4[0]) {
      let { address, mac } = ipv4[0]
      this.props.onNetChange({address, mac})
    }
  }

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
              <Select onSelect={this.onNetSelectorHandle} style={{ width: 120 }}>
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
}

const WrappedApp = Form.create({ name: "coordinated" })(FormPanel);

export default WrappedApp;
