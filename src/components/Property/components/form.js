import React from "react";
import { Form, Input, Select, Button } from "antd";
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
    const { getFieldDecorator } = this.props.form;
    return (
      <Form
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 8 }}
        onSubmit={this.handleSubmit}
      >
        {this.props.formData.map(item => {
          return (
            <Form.Item label={item.label} key={item.id}>
              {getFieldDecorator(`node${item.id}`, {
                rules: [
                  { required: false, message: "Please input your note!" }
                ],
                initialValue: item.value
              })(this.decisionCom(item))}
            </Form.Item>
          );
        })}
        <Form.Item>
          <Button type="primary">Save</Button>
        </Form.Item>
      </Form>
    );
  }

  decisionCom = Com => {
    switch (Com.type) {
      case "input":
        return <Input />;
      case "netconfig":
        return (
          <Select style={{ width: 120 }}>
            {this.props.appstate.netConfig.map((item, index) => {
              return (
                <Option key={index} value={item.netConfig}>
                  {item.netName}
                </Option>
              );
            })}
          </Select>
        );
      case "select":
        return (
          <Select style={{ width: 200 }}>
            <Option value={1}>1</Option>
            <Option value={2}>2</Option>
          </Select>
        );
      case "number":
        return (
          <Select style={{ width: 200 }}>
            <Option value={1}>1</Option>
            <Option value={2}>2</Option>
          </Select>
        );
      default:
        return <Input />;
    }
  };
}

const WrappedApp = Form.create({ name: "coordinated" })(FormPanel);

export default WrappedApp;
