/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { observer, inject } from "mobx-react";
import {
  PageHeader,
  Row,
  Col,
  Badge,
  Icon,
  Tree,
  Tabs,
  Tag,
  Popconfirm,
  Tooltip,
  Form,
  Input,
  AutoComplete,
  Select,
  Table
} from "antd";
import { getPropertyIdText } from "../../utils/util";
import { readDeviceData, setDeviceData } from "../../api/index.api";
import { BACNET_ENGINEERING_UNITS } from "../../utils/BAC_DECODE_TEXT";
const EditableContext = React.createContext();
const { TreeNode, DirectoryTree } = Tree;
const { TabPane } = Tabs;
const { Option } = Select;

const EditableCell = props => {
  const getInput = () => {
    const { inputType, inputData } = props.record;

    if (inputType === "autoComplete") {
      return (
        <AutoComplete
          dataSource={inputData}
          style={{ width: 200 }}
          placeholder="input here"
        />
      );
    } else if (inputType === "select") {
      return (
        <Select style={{ width: "100%" }}>
          {inputData.map((opt, key) => {
            return (
              <Option key={key} value={opt}>
                {opt}
              </Option>
            );
          })}
        </Select>
      );
    }
    return <Input />;
  };

  const renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return <EditableContext.Consumer>{renderCell}</EditableContext.Consumer>;
};
// Table 组件
@inject(allStore => allStore.appstate)
@observer
class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editingKey: "" };
    this.columns = [
      {
        title: "Point",
        dataIndex: "attrName",
        key: "attrName",
        width: "25%",
        editable: false
      },
      {
        title: "value",
        dataIndex: "value",
        key: "value",
        width: "30%",
        render: (text, record) => {
          return (
            <div>
              <span>{text}</span>
              {record.mark ? (
                <Tag color="green" style={{ marginLeft: "10px" }}>
                  {this.getMark(text)}
                </Tag>
              ) : null}
            </div>
          );
        },
        editable: true
      },
      {
        title: "operation",
        dataIndex: "operation",
        render: (text, record) => {
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    onClick={() => this.save(form, record.key, record)}
                    style={{ marginRight: 8 }}
                  >
                    Save
                  </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                title="Sure to cancel?"
                onConfirm={() => this.cancel(record.key)}
              >
                <a>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <div>
              <Tooltip
                placement="top"
                title={!record.isEdit ? "Do not edit" : "Edit"}
              >
                <a
                  disabled={!record.isEdit}
                  onClick={() => this.edit(record.key)}
                  style={{ padding: "5px" }}
                >
                  <Icon type="edit" />
                </a>
              </Tooltip>
            </div>
          );
        }
      }
    ];
  }

  isEditing = record => record.key === this.state.editingKey;
  getMark = val =>
    getPropertyIdText(BACNET_ENGINEERING_UNITS, Number(val)) || "null";

  cancel = () => {
    this.setState({ editingKey: "" });
  };

  save(form, key, record) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      // 保存到数据库
      setDeviceData({
        key: this.props.hashKey,
        subKey: record.attrName,
        val: row.value
      }).then(res => {
        // 客户端同步更新
        record.value = row.value;
        this.setState({ editingKey: "" });
      });
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  top(record) {
    let findRecord = this.props.equipmentstate.attributeData.findIndex(
      ele => ele.key === record.key
    );
    if (findRecord > -1) {
      // 删除该字段
      let removeArr = this.props.equipmentstate.attributeData.splice(
        findRecord,
        1
      );
      // 将该字段放到数组头部
      this.props.equipmentstate.attributeData.unshift(removeArr[0]);
    }
  }

  onRow(record) {
    return {
      onMouseEnter: event => {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.setState({ hoverKey: record.key });
        }, 50);
      }
    };
  }

  render() {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === "age" ? "number" : "text",
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record)
        })
      };
    });
    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          scroll={{ y: 540 }}
          components={components}
          dataSource={this.props.tableData || []}
          columns={columns}
          rowClassName="editable-row"
          size="small"
          onRow={this.onRow.bind(this)}
          pagination={false}
        />
      </EditableContext.Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);

// Tree 组件， 左侧视图
const RenderTreeNode = inject(allStore => allStore.appstate)(
  observer(props => {
    let dataSources = props.equipmentstate.getConditionsModules({
      "15": true,
      "8": true
    });
    const RecursiveTree = (treeData, prefix) => {
      if (treeData.length) {
        return treeData.map(item => {
          let key;
          let modules;
          let nodeData = {};
          if (!prefix) {
            key = `${item.objectName}`;
          } else {
            key = `${prefix}:${item.objectName}`;
          }
          const pattern = /^(\d)+$/;
          if (pattern.test(key)) {
            const allModules = props.equipmentstate.getModules;
            if (allModules) {
              const uniqu = {};
              const deviceModule = allModules.filter(
                node => node.split(":")[0] === item.objectName
              );
              deviceModule.forEach(item => {
                uniqu[item.split(":")[2][0]] = item;
              });
              modules = Object.keys(uniqu);
              nodeData.modules = modules;
              nodeData.modulesKey = deviceModule;
            }
          }
          const title = (
            <span>
              {item.text
                ? `${item.text} ${
                    item.children.length ? `(${item.children.length})` : ""
                  }`
                : `${item.objectName}`}
              {modules ? (
                <Badge
                  style={{
                    backgroundColor: "#fff",
                    color: "#999",
                    boxShadow: "0 0 0 1px #d9d9d9 inset",
                    marginLeft: 5
                  }}
                  count={modules.length}
                />
              ) : null}
            </span>
          );

          return (
            <TreeNode
              selectable={item.children.length ? false : true}
              nodeData={nodeData}
              icon={
                item.children.length ? (
                  <Icon
                    type="folder-open"
                    theme="twoTone"
                    twoToneColor="#ffb818"
                  />
                ) : (
                  <Icon type="file" theme="twoTone" />
                )
              }
              title={title}
              key={key}
              isLeaf={!item.children.length ? true : false}
            >
              {RecursiveTree(item.children, key)}
            </TreeNode>
          );
        });
      }
      // prefix = null
      return null;
    };
    return (
      <DirectoryTree
        expandedKeys={props.expandedKeys}
        switcherIcon={<Icon type="down" />}
        multiple
        defaultExpandedKeys={
          props.expandedKeys.length ? props.expandedKeys : []
        }
        onExpand={(selectedKeys, event) => props.onExpand(selectedKeys, event)}
        onSelect={(selectedKeys, event) => props.onSelect(selectedKeys, event)}
      >
        {RecursiveTree(props.equipmentstate.getTreeData(dataSources))}
      </DirectoryTree>
    );
  })
);

// 右侧视图
const AttributesPanel = inject(allStore => allStore.appstate)(
  observer(props => {
    const [activeKey, setActiveKey] = useState(props.panes[0].key);

    const onChange = activeKey => {
      setActiveKey(activeKey);
    };

    return (
      <Tabs
        hideAdd
        onChange={onChange}
        activeKey={activeKey}
        type="editable-card"
        style={{ padding: "5px" }}
      >
        {props.panes.map(pane => (
          <TabPane tab={pane.title} key={pane.key}>
            <EditableFormTable
              tableData={pane.content}
              hashKey={pane.hashKey}
            />
          </TabPane>
        ))}
      </Tabs>
    );
  })
);

const ConStrorage = inject(allStore => allStore.appstate)(
  observer(props => {
    const [panes, setPanes] = useState([
      { title: "Tab 1", content: [], key: "1" }
    ]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const onExpand = expandedKeys => {
      setExpandedKeys(expandedKeys);
    };

    const onSelectHandle = (key, event) => {
      // 记录当下选择的对象
      props.equipmentstate.setSelected(key[0]);
      // 控制属性界面的显示
      setPanes([{ title: key[0], key: "1" }]);
      // 使用正则匹配key格式
      let pattern = /(\d)+:(\d)+:(\d)+$/;
      let match = pattern.test(key[0]);
      if (match) {
        // 发送请求，读取属性内容
        readDeviceData({
          key: key[0]
        }).then(res => {
          let redisData = res.data["data"];
          let tableData = Object.keys(redisData).map((name, key) => {
            return {
              attrName: name,
              value: redisData[name],
              key
            };
          });
          props.equipmentstate.attributeData = tableData;
          setPanes([
            {
              title: key[0],
              key: "1",
              hashKey: key[0],
              content: props.equipmentstate.getAttributeData
            }
          ]);
        });
      }
    };

    return (
      <div
        className="equipment-divier"
        style={{ borderBottom: "1px solid #ebedf0" }}
      >
        <PageHeader
          title={props.title}
          style={{ borderBottom: "1px solid #ebedf0" }}
          subTitle="Redis Browser Manager"
        />
        <Row>
          <Col span={6}>
            <div
              style={{
                padding: "10px",
                borderRight: "1px solid #ebedf0",
                maxHeight: "680px",
                overflow: "scroll"
              }}
            >
              <RenderTreeNode
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                onSelect={onSelectHandle}
              />
            </div>
          </Col>
          <Col span={18}>
            <AttributesPanel panes={panes} />
          </Col>
        </Row>
      </div>
    );
  })
);

class Controller extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (
      <div>
        <ConStrorage />
      </div>
    );
  }
}

export default Controller;
