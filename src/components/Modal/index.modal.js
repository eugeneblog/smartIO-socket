import React from "react";
import {
  Modal,
  Button,
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
class ModalPanel extends React.Component {
  constructor(props) {
    super(props);
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

  handleOk = e => {
    this.props.appstate.setView("modalVisible", false);
  };

  handleCancel = e => {
    this.props.appstate.setView("modalVisible", false);
  };

  render() {
    const { modalVisible, modalLoading } = this.props.appstate.showView;
    // 给字符首字母转大写
    const modalTitle = this.props.appstate.modalPanelTitle
      ? this.props.appstate.modalPanelTitle.replace(/(^\S)/, math =>
          math.toLocaleUpperCase()
        )
      : "Not Set Title";
    let { onCreate } = this.props;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        width={800}
        visible={modalVisible}
        title={modalTitle}
        onCancel={this.handleCancel}
        footer={[
          <Button key="back" onClick={this.handleCancel}>
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={modalLoading}
            onClick={onCreate}
          >
            Create
          </Button>
        ]}
      >
        <Form>
          <Row gutter={18}>
            <Col span={10}>
              <Form.Item label="Add Items" hasFeedback>
                {getFieldDecorator("select", {
                  rules: [
                    { required: true, message: "Please select your country!" }
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
                    <Form.Item>
                      {
                        getFieldDecorator('radio-name', {
                          initialValue: 'null'
                        })(<Input disabled={this.state.selectRadio !== "name"} />)
                      }
                    </Form.Item>
                    <Radio value="format">Format</Radio>
                    <Form.Item label="Prefix">
                      {
                        getFieldDecorator('radio-input', {
                          initialValue: 'null'
                        })(<Input disabled={this.state.selectRadio !== "format"} />)
                      }
                    </Form.Item>
                    <Form.Item label="Prefix">
                      <Radio.Group
                        disabled={this.state.selectRadio !== "format"}
                      >
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
      </Modal>
    );
  }
}

const CollectionCreateForm = Form.create({ name: "form_in_modal" })(ModalPanel);

export default CollectionCreateForm;
