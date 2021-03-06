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
  Descriptions
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
  createAllType = node => {
    return node.map((item, index) => {
      return (
        <Option key={index} value={item}>
          {item.replace(/.xml$/g, "")}
        </Option>
      );
    });
  };

  render() {
    const { modalLoading } = this.props.appstate.showView;
    const { modalPaneltriggerName, channelTabData } = this.props.appstate;
    const channelTabDataLen = channelTabData.length;
    // 给字符首字母转大写
    const modalTitle = modalPaneltriggerName
      ? modalPaneltriggerName.replace(/(^\S)/, math => math.toLocaleUpperCase())
      : "Not Set Title";
    let { onCreate } = this.props;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        width={800}
        visible={this.props.visible}
        title={modalTitle}
        onCancel={this.props.handleCancel}
        footer={[
          <Button key="back" onClick={this.props.handleCancel}>
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
                {getFieldDecorator("selectItem", {
                  rules: [{ required: true, message: "Please select Item!" }],
                  initialValue: modalPaneltriggerName
                })(
                  <Select placeholder="Please select item">
                    {this.createItemNode(this.props.treestate.treeData)}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Net Type" hasFeedback>
                {getFieldDecorator("selectConfig", {
                  rules: [{ required: true, message: "Please select Type!" }],
                  initialValue: this.props.triggerName
                })(
                  <Select
                    onSelect={this.typeSelectHandle}
                    placeholder="Please select item"
                  >
                    {this.createAllType(this.props.appstate.allType)}
                  </Select>
                )}
              </Form.Item>
              {this.state.selectTypeContent ? (
                <Form.Item>
                  <Descriptions
                    title={this.state.selectTypeContent.NAME.toLocaleUpperCase()}
                  >
                    <Descriptions.Item label="Ip">
                      {this.state.selectTypeContent.NET.IP}
                    </Descriptions.Item>
                    <Descriptions.Item label="PORT">
                      {this.state.selectTypeContent.NET.PORT}
                    </Descriptions.Item>
                  </Descriptions>
                </Form.Item>
              ) : null}
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
                        initialValue: `${modalTitle ||
                          "CHANNEL DEFAULTNAME"}${channelTabDataLen + 1}`
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
                          numeric with a
                          <InputNumber
                            disabled={this.state.selectRadio !== "format"}
                          />
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

  typeSelectHandle = opt => {
    let typeName = opt.replace(/.xml$/, "");
    this.props.appstate.allTypeData.forEach(item => {
      if (item.ROOT.NAME === typeName) {
        // 显示该类型的具体信息
        this.setState({
          selectTypeContent: item.ROOT
        });
      }
    });
  };
}

const CollectionCreateForm = Form.create({ name: "form_in_modal" })(ModalPanel);

export default CollectionCreateForm;
