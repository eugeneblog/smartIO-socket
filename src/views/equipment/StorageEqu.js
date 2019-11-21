/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import {
  Tree,
  PageHeader,
  Skeleton,
  Row,
  Col,
  Tabs,
  Table,
  Button,
  Form,
  Input,
  Popconfirm,
  Icon,
  Tooltip,
  Modal,
  Select,
  TreeSelect,
  AutoComplete,
  Tag
} from "antd";
import { observer, inject } from "mobx-react";
import {
  readDeviceData,
  setDeviceData,
  delDeviceData
} from "../../api/index.api";
import { Menu, Item, contextMenu } from "react-contexify";
import {
  BACNET_OBJECT_TYPE,
  BACNET_ENGINEERING_UNITS
} from "../../utils/BAC_DECODE_TEXT";
import { getPropertyIdText } from "../../utils/util";
const { TabPane } = Tabs;
const { Option } = Select;
const { TreeNode, DirectoryTree } = Tree;
const EditableContext = React.createContext();

const MyAwesomeMenu = () => {
  const addModuleClick = ({ event, props }) => {
    Modal.confirm({
      title: "Add the module",
      icon: <Icon type="apartment" />
    });
  };

  return (
    <Menu id="storageMenu">
      <Item onClick={addModuleClick}>Add Module</Item>
    </Menu>
  );
};

const EditableCell = props => {
  const [treeData, setTreeData] = useState([
    { id: 1, pId: 0, title: "Area", value: "Area", selectable: false },
    { id: 2, pId: 0, title: "Currency", value: "Currency", selectable: false },
    {
      id: 3,
      pId: 0,
      title: "Electrical",
      value: "Electrical",
      selectable: false
    },
    { id: 4, pId: 0, title: "Energy", value: "Energy", selectable: false },
    { id: 5, pId: 0, title: "Enthalpy", value: "Enthalpy", selectable: false },
    { id: 6, pId: 0, title: "Entropy", value: "Entropy", selectable: false },
    { id: 7, pId: 0, title: "Force", value: "Force", selectable: false },
    {
      id: 8,
      pId: 0,
      title: "Frequency",
      value: "Frequency",
      selectable: false
    },
    { id: 9, pId: 0, title: "Humidity", value: "Humidity", selectable: false },
    { id: 10, pId: 0, title: "Length", value: "Length", selectable: false },
    { id: 11, pId: 0, title: "Light", value: "Light", selectable: false },
    { id: 12, pId: 0, title: "Mass", value: "Mass", selectable: false },
    {
      id: 13,
      pId: 0,
      title: "Mass Flow ",
      value: "Mass Flow ",
      selectable: false
    },
    { id: 14, pId: 0, title: "Power", value: "Power", selectable: false },
    { id: 15, pId: 0, title: "Pressure", value: "Pressure", selectable: false },
    {
      id: 16,
      pId: 0,
      title: "Temperature",
      value: "Temperature",
      selectable: false
    },
    { id: 17, pId: 0, title: "Time", value: "Time", selectable: false },
    { id: 18, pId: 0, title: "Torque", value: "Torque", selectable: false },
    { id: 19, pId: 0, title: "Velocity", value: "Velocity", selectable: false },
    { id: 20, pId: 0, title: "Volume", value: "Volume", selectable: false },
    {
      id: 21,
      pId: 0,
      title: "Volumetric Flow",
      value: "Volumetric Flow",
      selectable: false
    },
    { id: 22, pId: 0, title: "Other", value: "Other", selectable: false }
  ]);
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
    } else if (inputType === "treeSelect") {
      const genTreeNode = (parentId, groupName, isLeaf = false) => {
        let units = [];
        if (inputData[groupName]) {
          let unitsArr = inputData[groupName];
          units = Object.keys(unitsArr).map((item, key) => {
            return {
              id: `${parentId}-${key}`,
              pId: parentId,
              value: unitsArr[item],
              title: item,
              isLeaf
            };
          });
        }
        return units;
      };
      const onLoadData = treeNode =>
        new Promise(resolve => {
          const { id, value } = treeNode.props;
          setTimeout(() => {
            setTreeData(treeData.concat([...genTreeNode(id, value, true)]));
            resolve();
          }, 300);
        });
      return (
        <TreeSelect
          treeDataSimpleMode
          style={{ width: "100%" }}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Please select"
          showSearch
          loadData={onLoadData}
          treeData={treeData}
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
          const isHover = this.isHover(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    onClick={() => this.save(form, record.key)}
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
              {isHover ? (
                <Tooltip key="2" placement="top" title="Placed at the top">
                  <a
                    onClick={() => this.top(record)}
                    style={{ padding: "5px" }}
                  >
                    <Icon type="vertical-align-top" />
                  </a>
                </Tooltip>
              ) : null}
            </div>
          );
        }
      }
    ];
  }

  isEditing = record => record.key === this.state.editingKey;
  isHover = record => record.key === this.state.hoverKey;
  getMark = val =>
    getPropertyIdText(BACNET_ENGINEERING_UNITS, Number(val)) || "null";

  cancel = () => {
    this.setState({ editingKey: "" });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.props.equipmentstate.getAttributeData];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        // 保存到数据库
        setDeviceData({
          key: this.props.hashKey,
          subKey: newData[index].attrName,
          val: newData[index].value
        }).then(res => {
          // 客户端同步更新
          this.props.equipmentstate.attributeData = newData;
          this.setState({ editingKey: "" });
        });
      } else {
        this.setState({ editingKey: "" });
      }
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
          dataSource={this.props.equipmentstate.getAttributeData.slice()}
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
    const RecursiveTree = (treeData, prefix) => {
      if (treeData.length) {
        return treeData.map(item => {
          let key;
          if (!prefix) {
            key = `${item.objectName}`;
          } else {
            key = `${prefix}:${item.objectName}`;
          }
          return (
            <TreeNode
              title={
                item.text
                  ? `${item.text} ${
                      item.children.length ? `(${item.children.length})` : ""
                    }`
                  : `${item.objectName}`
              }
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
    const onRightHandle = e => {
      const menuId = "storageMenu";
      const { eventKey } = e.node.props;
      e.node.onSelect(e.event);
      e.event.preventDefault();
      // 获取被右击的节点, 只有父节点才能响应右键
      if (eventKey.split(":").length < 2) {
        contextMenu.show({
          id: menuId,
          event: e.event,
          props: {
            foo: "bar"
          }
        });
      }
      return;
    };
    return (
      <DirectoryTree
        expandedKeys={props.expandedKeys}
        defaultExpandedKeys={
          props.expandedKeys.length ? props.expandedKeys : []
        }
        onRightClick={onRightHandle}
        onExpand={(selectedKeys, event) => props.onExpand(selectedKeys, event)}
        onSelect={(selectedKeys, event) => props.onSelect(selectedKeys, event)}
      >
        {RecursiveTree(props.equipmentstate.getTreeData.slice())}
      </DirectoryTree>
    );
  })
);

// SelectTree 组件
const ModalTreeSelect = props => {
  return (
    <Select style={{ width: "100%" }} value={props.selectVal}>
      <Option value={props.selectVal}>{props.text}</Option>
    </Select>
  );
};

// 右侧视图
const AttributesPanel = inject(allStore => allStore.appstate)(
  observer(props => {
    const [activeKey, setActiveKey] = useState(props.panes[0].key);
    const [disabled, setDisabled] = useState(true);
    const pane = props.panes[0];
    const keys = pane.hashKey ? pane.hashKey.split(":") : pane.hashKey;

    useEffect(() => {
      if (keys && keys[1]) {
        let prdConfig = props.equipmentstate.getProductConfig(keys[1]);
        let isDisabled = prdConfig ? !prdConfig.isAdd : true;
        setDisabled(isDisabled);
      } else {
        setDisabled(true);
      }
    }, [keys, props]);

    const onChange = activeKey => {
      setActiveKey(activeKey);
    };

    // 增加对象
    const addObjCLickHandle = () => {
      // 获取要增加对象的设备号 key首部
      const deviceid = keys[0];
      if (keys[1]) {
        const objKey = keys.slice(0, 2);
        let text = `device:${deviceid} ${getPropertyIdText(
          BACNET_OBJECT_TYPE,
          Number(keys[1])
        )}`;
        let iter = objKey[Symbol.iterator]();
        let result;
        // 递归查询
        const findDevice = (iter, arr) => {
          let key = iter.next().value;
          if (key) {
            // 查找
            result = arr.find(ele => {
              return ele.objectName === key;
            });
            // 继续查找children
            if (result.children) {
              findDevice(iter, result.children);
            }
          }
          return result;
        };
        let findResult = findDevice(iter, props.equipmentstate.getTreeData);
        let count = findResult.children.length;
        Modal.confirm({
          title: `Select the object you want to add to the device${deviceid}`,
          icon: "check-square",
          content: (
            <ModalTreeSelect
              selectVal={count + 1}
              text={`${text} ${count + 1}`}
            />
          ),
          onOk: () => {
            let newKey = `${keys[0]}:${keys[1]}:${count + 1}`;
            setDeviceData({
              key: newKey,
              subKey: "OBJECT_TYPE",
              val: "FUCK"
            }).then(res => {
              console.log(res);
              props.equipmentstate.addDeviceObj(newKey);
            });
          }
        });
      }
      return;
    };

    // 删除对象
    const delObjClickHandle = () => {
      // 获取要增加对象的设备号 key首部
      let keys = pane.hashKey.split(":");
      let content = `device${keys[0]} ${getPropertyIdText(
        BACNET_OBJECT_TYPE,
        Number(keys[1])
      )} ${keys[2]}`;
      const objKey = keys.slice(0, 2);
      let iter = objKey[Symbol.iterator]();
      let result;
      const findDevice = (iter, arr) => {
        let key = iter.next().value;
        if (key) {
          // 查找
          result = arr.find(ele => {
            return ele.objectName === key;
          });
          // 继续查找children
          if (result.children) {
            findDevice(iter, result.children);
          }
        }
        return result;
      };
      findDevice(iter, props.equipmentstate.getTreeData);
      Modal.confirm({
        title: "Do you Want to delete these items?",
        content,
        destroyOnClose: true,
        onOk() {
          // 将该类型下的所有对象返回后端进行重命名
          delDeviceData({
            key: pane.hashKey,
            allKey: result.children.map(ele => ele.objectName)
          }).then(res => {
            reloadClickHandle();
          });
        }
      });
    };

    // 重新加载
    const reloadClickHandle = () => {
      // 清空
      props.equipmentstate.dataSource = [];
      props.equipmentstate.attributeData = [];
      async function asyncFn() {
        let result = await readDeviceData({ key: "*" });
        let data = result["data"];
        let deviceAll = data["data"];
        props.equipmentstate.dataSource = deviceAll;
      }
      // 重新请求
      asyncFn();
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
            <Row>
              <Col span={18}>
                <EditableFormTable hashKey={pane.hashKey} />
              </Col>
              <Col span={6}>
                <div style={{ padding: "10px" }}>
                  <Button
                    type="primary"
                    block
                    style={{ marginTop: "10px" }}
                    icon="plus"
                    disabled={disabled}
                    onClick={addObjCLickHandle}
                  >
                    Add Object
                  </Button>

                  <Button
                    type="danger"
                    block
                    style={{ marginTop: "10px" }}
                    icon="delete"
                    disabled={keys ? !Boolean(keys.length >= 3) : true}
                    onClick={delObjClickHandle}
                  >
                    Delete Object
                  </Button>
                  <Button
                    type="primary"
                    block
                    icon="reload"
                    style={{ marginTop: "10px" }}
                    onClick={reloadClickHandle}
                  >
                    overloading
                  </Button>
                </div>
              </Col>
            </Row>
          </TabPane>
        ))}
      </Tabs>
    );
  })
);

// 父组件
const StorageEqu = inject(allStore => allStore.appstate)(
  observer(props => {
    const [panes, setPanes] = useState([
      { title: "Tab 1", content: [], key: "1" }
    ]);
    const [expandedKeys, setExpandedKeys] = useState([]);

    useEffect(() => {
      async function asyncFn() {
        let result = await readDeviceData({ key: "*" });
        let data = result["data"];
        let deviceAll = data["data"];
        props.equipmentstate.dataSource = deviceAll;
      }
      asyncFn();
    }, [props]);

    const onExpand = expandedKeys => {
      console.log("onExpand", expandedKeys);
      setExpandedKeys(expandedKeys);
    };

    const onSelectHandle = (key, event) => {
      // 记录当下选择的对象
      props.equipmentstate.setSelected(key[0]);
      // 控制属性界面的显示
      setPanes([{ title: key, key: "1" }]);
      // 使用正则匹配key格式
      let pattern = /(\d)+:(\d)+:(\d)+$/;
      let match = pattern.test(key[0]);

      if (match) {
        // 发送请求，读取属性内容
        readDeviceData({
          key: key[0]
        }).then(res => {
          if (res.data.errno > -1) {
            let redisData = res.data["data"];
            let tableData = Object.keys(redisData).map((name, key) => {
              return {
                attrName: name,
                value: redisData[name],
                key
              };
            });
            props.equipmentstate.attributeData = tableData;
            setPanes([{ title: key, key: "1", hashKey: key[0] }]);
          } else {
            props.equipmentstate.attributeData = [];
            setPanes([{ title: key, key: "1", hashKey: key[0] }]);
          }
        });
      } else {
        // 没有匹配
        setPanes([{ title: key, key: "1", hashKey: key[0] }]);
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
                maxHeight: "640px",
                overflow: "scroll"
              }}
            >
              {props.equipmentstate.getTreeData.length ? (
                <RenderTreeNode
                  onExpand={onExpand}
                  onSelect={onSelectHandle}
                  expandedKeys={expandedKeys}
                />
              ) : (
                <Skeleton active />
              )}
              <MyAwesomeMenu />
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

export default StorageEqu;
