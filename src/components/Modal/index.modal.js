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
  Divider,
  message
} from "antd";
import { observer, inject } from "mobx-react";
import { getNetConfig } from '../../api/index.api'
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
  // 创建Items 子节点
  createItemNode = list => {
    // 如果addItem启用了就返回该节点，否则返回null , item.children是递归退出条件,否则一直递归调用
    return list.map(item => {
      if (!item.children) {
        return item.menu.addItem ? (
          <Option key={item.key} value={item.name}>
            {item.title}
          </Option>
        ) : null;
      }
      return this.createItemNode(item.children);
    });
  };

  // 加载net_config
  createConfigType = node => {
    return node.map(item => {
      return (
        <Option key={item.key} value={item.name}>
          {item.title}
        </Option>
      );
    });
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
                    {this.createItemNode(this.props.treestate.treeData)}
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
                      {getFieldDecorator("radio-name", {
                        initialValue: "null"
                      })(
                        <Input disabled={this.state.selectRadio !== "name"} />
                      )}
                    </Form.Item>
                    <Radio value="format">Format</Radio>
                    <Form.Item label="Prefix">
                      {getFieldDecorator("radio-input", {
                        initialValue: "null"
                      })(
                        <Input disabled={this.state.selectRadio !== "format"} />
                      )}
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

  componentDidMount() {
    // 获取网络系统的网络配置
    getNetConfig().then(result => {
      if(result['data'].errno === 0) {
        let data = result['data'].data
        this.props.appstate.netConfig = data.net
        console.log(data)
        return
      }
      console.error('获取网络配置失败')
    }).catch(err => {
      message.error(err)
    })
  }

}

const CollectionCreateForm = Form.create({ name: "form_in_modal" })(ModalPanel);

export default CollectionCreateForm;
