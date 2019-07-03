import React from "react";
import { Form, Input } from "antd";

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
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 8 }}
        onSubmit={this.handleSubmit}
      >
        {this.props.formData.map(item => {
          return (
            <Form.Item label={ item.label } key={ item.id }>
              {getFieldDecorator(`node${item.id}`, {
                rules: [{ required: false, message: "Please input your note!" }],
                initialValue: item.value
              })(<Input />)}
            </Form.Item>
          );
        })}
      </Form>
    );
  }
}

const WrappedApp = Form.create({ name: "coordinated" })(FormPanel);

export default WrappedApp;
