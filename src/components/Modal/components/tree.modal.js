import React from "react";
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  Radio,
  InputNumber,
  Divider
} from "antd";
import { observer, inject } from "mobx-react";
const { Option } = Select;

@inject(allStore => allStore.appstate)
@observer
class TreeModalForm extends React.Component {
  constructor() {
    super();
    this.state = {
      selectRadio: "name"
    };
  }
  radioHandle = e => {
    const target = e.target;
    console.log(target);
    this.setState({
      selectRadio: target.value
    });
  };
  handleSubmit = (e) => {
    
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Row gutter={18}>
          <Col span={10}>
            <Form.Item label="Add Items" hasFeedback>
              {getFieldDecorator("select", {
                rules: [
                  { required: false, message: "Please select your country!" }
                ],
                initialValue: this.props.triggerName
              })(
                <Select placeholder="Please select item">
                  {this.props.treestate.treeData.map(item => {
                    return (
                      <Option key={item.key} value={item.name}>
                        {item.title}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Type" hasFeedback>
              {getFieldDecorator("type", {
                rules: [
                  { required: false, message: "Please select your country!" }
                ],
                initialValue: this.props.triggerName
              })(
                <Select placeholder="Please select item">
                  {this.props.treestate.treeData.map(item => {
                    return (
                      <Option key={item.key} value={item.name}>
                        {item.title}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={1}>
            <Divider dashed style={{ height: "540px" }} type="vertical" />
          </Col>
          <Col span={13}>
            <Form.Item label="Name.CHABAC">
              {getFieldDecorator("radio-group", {
                initialValue: this.state.selectRadio
              })(
                <Radio.Group onChange={this.radioHandle}>
                  <Radio value="name">Use Name</Radio>
                  <Input disabled={this.state.selectRadio !== "name"} />
                  <Radio value="format">Format</Radio>
                  <Form.Item label="Prefix">
                    <Input disabled={this.state.selectRadio !== "format"} />
                  </Form.Item>
                  <Form.Item label="Prefix">
                    <Radio.Group disabled={this.state.selectRadio !== "format"}>
                      <Radio value="a">numeric</Radio>
                      <Radio value="b">
                        numeric with a{" "}
                        <InputNumber
                          disabled={this.state.selectRadio !== "format"}
                        />{" "}
                        character field width
                      </Radio>
                      <Radio value="c">letter</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label="Suiffix">
                    <Input disabled={this.state.selectRadio !== "format"} />
                  </Form.Item>
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}

const TreeModal = Form.create({ name: "validate_other" })(TreeModalForm);

export default TreeModal;
