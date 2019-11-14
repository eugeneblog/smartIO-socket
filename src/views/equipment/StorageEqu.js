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
  AutoComplete
} from "antd";
import { observer, inject } from "mobx-react";
import {
  readDeviceData,
  setDeviceData,
  delDeviceData
} from "../../api/index.api";
import { BACNET_OBJECT_TYPE } from "../../utils/BAC_DECODE_TEXT";
const { TabPane } = Tabs;
const { Option } = Select;
const { TreeNode, DirectoryTree } = Tree;
const EditableContext = React.createContext();

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
    } else if (inputType === "treeSelect") {
      const recursiveTree = (parent, treeData) => {
        /**
         *  @param{string} parent - 父节点key
         *  @param{json} treeData - tree节点数据集合
         *  @return{jsx}
         **/
        return treeData.map((item, index) => {
          let key = !parent ? index : `${parent}-${index}`;
          // 判断是否有子节点
          if (!Array.isArray(item.value)) {
            return (
              <TreeSelect.TreeNode
                key={key}
                title={item.name}
                value={item.value}
              ></TreeSelect.TreeNode>
            );
          }
          return (
            <TreeSelect.TreeNode
              selectable={false}
              key={key}
              value={item.name}
              title={item.name}
            >
              {recursiveTree(key, item.value)}
            </TreeSelect.TreeNode>
          );
        });
      };
      return (
        <TreeSelect
          style={{ width: "100%" }}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Please select"
          showSearch
        >
          {recursiveTree(null, inputData)}
        </TreeSelect>
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
        editable: true
      },
      {
        title: "value",
        dataIndex: "value",
        key: "value",
        width: "25%",
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
// 根据propertyId 获取对应的字符串
function getPropertyIdText(obj, id, compare = (a, b) => a === b) {
  let val = Object.keys(obj).find(k => {
    return compare(obj[k], id);
  });
  return val;
}

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
              title={item.text ? item.text : item.objectName}
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

    useEffect(() => {
      async function asyncFn() {
        let result = await readDeviceData({ key: "*" });
        let data = result["data"];
        let deviceAll = data["data"];
        props.equipmentstate.dataSource = deviceAll;
      }
      asyncFn();
    }, [props]);

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
                <RenderTreeNode onSelect={onSelectHandle} />
              ) : (
                <Skeleton active />
              )}
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
