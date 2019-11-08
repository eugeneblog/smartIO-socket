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
  InputNumber
} from "antd";
import { observer, inject } from "mobx-react";
import { readDeviceData, setDeviceData } from "../../api/index.api";
import { BACNET_OBJECT_TYPE } from "../../utils/BAC_DECODE_TEXT";
const { TabPane } = Tabs;
const { TreeNode, DirectoryTree } = Tree;
const EditableContext = React.createContext();

const EditableCell = props => {
  const getInput = () => {
    if (props.inputType === "number") {
      return <InputNumber />;
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
        title: "key",
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
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
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
            <a
              disabled={editingKey !== ""}
              onClick={() => this.edit(record.key)}
            >
              Edit
            </a>
          );
        }
      }
    ];
  }

  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: "" });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.props.equipmentstate.database];
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
          this.props.equipmentstate.database = newData;
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
          dataSource={this.props.equipmentstate.database.slice()}
          columns={columns}
          rowClassName="editable-row"
          size="small"
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
        {RecursiveTree(props.treeData)}
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
    const pane = props.panes[0]
    // 增加对象
    const addObjCLickHandle = () => {
      // 获取要增加对象的设备号 key首部
      const keys = pane.hashKey.split(":")
      const deviceid = keys[0]
      console.log(deviceid)
    }

    // 删除对象
    const delObjClickHandle = () => {
      // 获取要增加对象的设备号 key首部
      const keys = pane.hashKey
      console.log(keys)
    }
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
                    disabled={pane.hashKey ? false : true}
                    onClick={addObjCLickHandle}
                  >
                    Add Object
                  </Button>

                  <Button
                    type="danger"
                    block
                    style={{ marginTop: "10px" }}
                    icon="delete"
                    disabled={pane.hashKey ? false : true}
                    onClick={delObjClickHandle}
                  >
                    Delete Object
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
    const [treeData, setTreeData] = useState([]);

    useEffect(() => {
      async function asyncFn() {
        let result = await readDeviceData({ key: "*" });
        let data = result["data"];
        let deviceAll = data["data"];
        // 定义排序函数
        const compare = (a, b) => {
          let numA = Number(a.objectName);
          let numB = Number(b.objectName);
          if (numA < numB) {
            return -1;
          }
          if (numA > numB) {
            return 1;
          }
          return 0;
        };
        function refactoringTree() {
          // 命名空间分离
          let diviceid = deviceAll.map((item, index) => {
            return {
              objectName: item.split(":")[0]
            };
          });
          // 去重
          function duplicateRemoval(listArr) {
            let unique = {};
            listArr.forEach(item => {
              unique[JSON.stringify(item)] = item;
            });
            return unique;
          }
          let unique = duplicateRemoval(diviceid);

          // 重组
          let objData = Object.keys(unique).map((item, index) => {
            item = JSON.parse(item);
            // 查询
            let deviceTypeArr = deviceAll.filter(list => {
              return list.split(":")[0] === item.objectName;
            });
            return {
              key: index,
              ...item,
              children: [...recursive(deviceTypeArr, 1)]
            };
          });

          function recursive(deviceTypeArr, num, text) {
            // 如果num > namespace 总长 退出
            if (num > 2) {
              return [];
            }
            // 分离
            let diviceid = deviceTypeArr.map(item => {
              return {
                objectName: item.split(":")[num]
              };
            });

            // 去重
            let unique = duplicateRemoval(diviceid);

            // 前三步为加工数据，最后一步决定是否继续递归执行
            let childrenResult = Object.keys(unique).map((item, index) => {
              item = JSON.parse(item);
              // 查询
              let findNodes = deviceTypeArr.filter(list => {
                return list.split(":")[num] === item.objectName;
              });
              // 如果是第二位，进行文本转换
              if (num === 1) {
                text = getPropertyIdText(
                  BACNET_OBJECT_TYPE,
                  Number(item.objectName)
                );
              }
              let content = {
                key: index,
                ...item,
                text,
                children: [...recursive(findNodes, num + 1, text)]
              };
              if (num === 2) {
                content.text = `${text} ${item.objectName}`;
              }
              return content;
            });
            childrenResult.sort(compare);
            return childrenResult;
          }

          return objData;
        }
        let treeData = refactoringTree();
        // 排序
        treeData.sort(compare);
        setTreeData(treeData);
      }
      asyncFn();
    }, []);

    const onSelectHandle = (key, event) => {
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
            props.equipmentstate.database = tableData;
            setPanes([{ title: key, key: "1", hashKey: key[0] }]);
          }
          return;
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
              {treeData.length ? (
                <RenderTreeNode treeData={treeData} onSelect={onSelectHandle} />
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
