/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import {
  Tree,
  PageHeader,
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
  Tag,
  Badge,
  message,
  Progress
} from "antd";
import { observer, inject } from "mobx-react";
import {
  readDeviceData,
  setDeviceData,
  delDeviceData,
  readExtenModule,
  writeExtenModule,
  delAllRedisData,
  delExtenModule,
  readAllDeviceData,
  appliedTOdevice,
  sendFilePkg
} from "../../api/index.api";
import { Menu, Item, contextMenu } from "react-contexify";
import {
  BACNET_OBJECT_TYPE,
  BACNET_ENGINEERING_UNITS
} from "../../utils/BAC_DECODE_TEXT";
import { getPropertyIdText, formateXml } from "../../utils/util";
const { TabPane } = Tabs;
const { Option } = Select;
const { TreeNode, DirectoryTree } = Tree;
const EditableContext = React.createContext();

/**
 * @method{CollectionCreateForm} - Modal form 组件
 */
const CollectionCreateForm = Form.create({ name: "form_in_modal" })(
  // eslint-disable-next-line
  class extends React.Component {
    constructor() {
      super();
      this.state = {
        moduleFiles: null
      };
    }
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      const { moduleFiles } = this.state;
      return (
        <Modal
          visible={visible}
          title={this.props.title}
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="Select Module:">
              {getFieldDecorator("moduleName", {
                rules: [{ required: true, message: "Please input your note!" }],
                initialValue: moduleFiles ? moduleFiles[0] : null
              })(
                <Select>
                  {moduleFiles
                    ? moduleFiles.map((item, key) => (
                        <Option key={key} value={item}>
                          {item.split(".")[0]}
                        </Option>
                      ))
                    : null}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Select Count: ">
              {getFieldDecorator("moduleCount", {
                rules: [{ required: true, message: "Please input your note!" }]
              })(
                <Select placeholder="Please select module count">
                  {this.props.moduleNum.map((item, key) => (
                    <Option value={item.id} key={key} disabled={item.disabled}>
                      {item.id}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
    componentDidMount() {
      readExtenModule().then(res => {
        const result = res["data"];
        this.setState({
          moduleFiles: result["data"]
        });
      });
    }
  }
);

@inject(allStore => allStore.appstate)
@observer
class CollectionsPage extends React.Component {
  constructor() {
    super();
    this.state = {
      moduleNum: [
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "5" },
        { id: "6" },
        { id: "7" }
      ]
    };
  }
  handleCreate = () => {
    const { form } = this.formRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      writeExtenModule({
        deviceId: this.props.deviceId,
        ...values
      }).then(res => {
        form.resetFields();
        let _this = this;
        _this.props.onCancel();
        // 刷新
        _this.props.equipmentstate.dataSource = [];
        _this.props.equipmentstate.attributeData = [];
        async function asyncFn() {
          let result = await readDeviceData({ key: "*" });
          let data = result["data"];
          let deviceAll = data["data"];
          _this.props.equipmentstate.dataSource = deviceAll;
        }
        // 重新请求
        asyncFn();
      });
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    // 读取已经存在的模块
    const modules = [
      ...new Set(
        this.props.equipmentstate.getModules.map(item => item.split(":")[2][0])
      )
    ];
    let modulesNum = this.state.moduleNum;
    if (modules.length) {
      modulesNum = this.state.moduleNum.map(item => {
        // 查询
        const find = modules.findIndex(mod => mod === item.id);
        if (find > -1) {
          return {
            ...item,
            disabled: true
          };
        }
        return item;
      });
    }

    return (
      <CollectionCreateForm
        moduleNum={modulesNum}
        wrappedComponentRef={this.saveFormRef}
        visible={this.props.visible}
        title={`Create extension modules${this.props.deviceId}`}
        onCancel={this.props.onCancel}
        onCreate={this.handleCreate}
      />
    );
  }
}
/**
 * @method {MyAwesomeMenu} 右键菜单
 */
const MyAwesomeMenu = props => (
  <Menu id="storageMenu">
    <Item onClick={props.addModuleClick}>Add Module</Item>
    <Item onClick={props.delModuleClick}>Delete Module</Item>
    <Item onClick={props.applyToDevice}>apply to equipment</Item>
    <Item onClick={props.exportData}>Backup as file</Item>
  </Menu>
);

/**
 * @method {EditableCell} Table > select组件
 * @method {EditableTable} Table 组件
 */

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

export const EditableFormTable = Form.create()(EditableTable);
// Tree 组件， 左侧视图
const RenderTreeNode = inject(allStore => allStore.appstate)(
  observer(props => {
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
    const onRightHandle = e => {
      const menuId = "storageMenu";
      const { eventKey } = e.node.props;
      e.event.preventDefault();
      // 获取被右击的节点, 只有父节点才能响应右键
      if (eventKey.split(":").length < 2) {
        contextMenu.show({
          id: menuId,
          event: e.event,
          props: {
            deviceId: e.node.props.eventKey,
            nodeData: e.node.props.nodeData
          }
        });
      }
      return;
    };
    return (
      <DirectoryTree
        expandedKeys={props.expandedKeys}
        switcherIcon={<Icon type="down" />}
        multiple
        defaultExpandedKeys={
          props.expandedKeys.length ? props.expandedKeys : []
        }
        onRightClick={onRightHandle}
        onExpand={(selectedKeys, event) => props.onExpand(selectedKeys, event)}
        onSelect={(selectedKeys, event) => props.onSelect(selectedKeys, event)}
      >
        {RecursiveTree(props.equipmentstate.getTreeData(props.equipmentstate.dataSource))}
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
    const pane = props.panes[0];
    const keys = pane.hashKey ? pane.hashKey.split(":") : pane.hashKey;

    const onChange = activeKey => {
      setActiveKey(activeKey);
    };

    // 增加对象
    const addObjCLickHandle = () => {
      if (!keys) {
        return;
      }
      if (keys[1]) {
        const deviceid = keys[0];
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

    // 清空数据库
    const delAllClickHandle = () => {
      Modal.confirm({
        title: "Are you sure to clear all the data？",
        onOk() {
          delAllRedisData();
        }
      });
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
                <EditableFormTable
                  tableData={pane.content}
                  hashKey={pane.hashKey}
                />
              </Col>
              <Col span={6}>
                <div style={{ padding: "10px" }}>
                  <Button
                    type="primary"
                    block
                    style={{ marginTop: "10px" }}
                    icon="plus"
                    onClick={addObjCLickHandle}
                  >
                    Add Object
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
                    type="danger"
                    block
                    icon="delete"
                    style={{ marginTop: "10px" }}
                    onClick={delAllClickHandle}
                  >
                    Delete all data
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

const AppliedModal = props => {
  return (
    <Modal title="Appled in the device..." {...props}>
      <span>Click the start button to start the application</span>
      <Progress percent={props.percent} status="active" />
    </Modal>
  );
};

// 父组件
export const StorageEqu = inject(allStore => allStore.appstate)(
  observer(props => {
    const [panes, setPanes] = useState([
      { title: "Tab 1", content: [], key: "1" }
    ]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [appliedVisible, setAppliedVisible] = useState(false);
    const [visible, setVisible] = useState(false);
    const [percent, setPercent] = useState(0);
    const [deviceId, setDeviceId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const showModal = () => {
      setVisible(true);
    };
    const onCancel = () => {
      setVisible(false);
    };
    // 添加模块
    const addModuleClick = ({ event, props }) => {
      setDeviceId(props["deviceId"]);
      showModal();
    };
    // 删除模块
    const delModuleClick = e => {
      const deviceId = e.props.deviceId;
      const nodeData = e.props.nodeData;
      const modulesKey = nodeData["modulesKey"];
      let selectVal = nodeData["modules"][0];
      function handleChange(value) {
        selectVal = value;
      }
      const ModalSelect = props => (
        <Select
          style={{ width: "100%" }}
          defaultValue={nodeData["modules"][0]}
          onChange={handleChange}
        >
          {nodeData["modules"].map(item => {
            return (
              <Option key={item} value={item}>
                {item}
              </Option>
            );
          })}
        </Select>
      );
      Modal.confirm({
        title: "delete device modules",
        content: <ModalSelect selectVal={selectVal} />,
        onOk() {
          // 删除模块
          delExtenModule({
            deviceId,
            modules: modulesKey.filter(
              item => item.split(":")[2][0] === selectVal
            )
          }).then(() => {
            // 刷新
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
          });
        }
      });
    };

    async function apply() {
      let start = 0;
      // 转换成xml数据
      const xmlData = await redisGenerateXML(deviceId);
      // 发送文件长度
      const applied = await appliedTOdevice({ deviceId, xmlData });
      const data = applied["data"].data;
      // 递归函数
      const recursiveSendFile = (pkgLen, start, fileData, deviceId) => {
        sendFilePkg({
          pkgLen: data.pkgLen,
          start,
          fileData: xmlData,
          deviceId
        })
          .then(res => {
            setIsLoading(true);
            const { errno } = res["data"].data;
            if (errno !== -1) {
              // 累加start
              if (start + pkgLen < xmlData.length) {
                start += pkgLen;
                let percent = Math.trunc((start / xmlData.length) * 100);
                setPercent(percent);
                recursiveSendFile(pkgLen, start, fileData, deviceId);
              } else {
                message.success("Application successfully");
                setAppliedVisible(false);
                setPercent(0);
                setIsLoading(false);
                return;
              }
            } else {
              recursiveSendFile(pkgLen, start, xmlData, deviceId);
            }
          })
          .catch(err => {
            recursiveSendFile(pkgLen, start, xmlData, deviceId);
          });
      };
      recursiveSendFile(data.pkgLen, start, xmlData, deviceId);
    }

    // 应用到设备
    const applyToDevice = e => {
      if (!props.appstate.selectedChannel) {
        message.warn("Select the channel configuration");
        return;
      }
      setDeviceId(e.props.deviceId);
      setAppliedVisible(true);
    };
    // 导出为文件
    const exportData = e => {
      redisGenerateXML(e.props.deviceId).then(data => {
        // 下载文件
        const link = document.createElement("a");
        const blob = new Blob([data], { type: "text/xml" });
        const fileName = `${e.props.deviceId}.xml`;
        link.setAttribute("download", fileName);
        link.href = window.URL.createObjectURL(blob);
        link.click();
      });
    };

    // redis数据转成xml
    const redisGenerateXML = deviceName => {
      // 获取所有设备下的key
      const deviceObj = props.equipmentstate.getDeviceObjKey(deviceName, {
        "0": true,
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "17": true
      });
      return readAllDeviceData({ keys: deviceObj }).then(res => {
        const result = res["data"];
        // 统计类型出现的次数
        let objType = deviceObj.reduce(function(allNames, name) {
          let type = name.split(":")[1];
          if (type in allNames) {
            allNames[type]++;
          } else {
            allNames[type] = 1;
          }
          return allNames;
        }, {});
        // 排序
        let nodes = result.sort((a, b) => {
          let keyNum1 = Number(a.keys.split(":").join(""));
          let keyNum2 = Number(b.keys.split(":").join(""));
          if (keyNum1 < keyNum2) {
            return -1;
          } else {
            return 1;
          }
        });
        let xmlNodes = nodes.map(node => {
          const attrsData = node.data;
          let number = node.keys;
          let attrs = "";
          for (const key in attrsData) {
            if (attrsData.hasOwnProperty(key)) {
              const val = attrsData[key];
              attrs += `<${key}>${val}</${key}>\n`;
            }
          }
          return `<key number="${number}">
            ${attrs}
          </key>`;
        });
        // 生成xml 字符串
        let xmlStr = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <root>
          <Version>1</Version>
          <AI_count>${objType["0"]}</AI_count>
          <AO_count>${objType["1"]}</AO_count>
          <AV_count>${objType["2"]}</AV_count>
          <BI_count>${objType["3"]}</BI_count>
          <BO_count>${objType["4"]}</BO_count>
          <BV_count>${objType["5"]}</BV_count>
          <SCHEDULE_count>${objType["17"]}</SCHEDULE_count>
          ${xmlNodes.join("")}
        </root>`;
        return formateXml(xmlStr);
      });
    };

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
                onExpand={onExpand}
                onSelect={onSelectHandle}
                expandedKeys={expandedKeys}
              />
            </div>
          </Col>
          <Col span={18}>
            <AttributesPanel panes={panes} />
          </Col>
        </Row>
        <MyAwesomeMenu
          addModuleClick={addModuleClick}
          applyToDevice={applyToDevice}
          delModuleClick={delModuleClick}
          exportData={exportData}
        />
        <CollectionsPage
          deviceId={deviceId}
          visible={visible}
          showModal={showModal}
          onCancel={onCancel}
        />
        <AppliedModal
          visible={appliedVisible}
          onCancel={() => setAppliedVisible(false)}
          onOk={() => apply()}
          percent={percent}
          okText="Start"
          okButtonProps={{ loading: isLoading }}
        />
      </div>
    );
  })
);
