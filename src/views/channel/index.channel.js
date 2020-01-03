/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import PropertyPanel from "../../components/Property/index.property";
import CollectionCreateForm from "../../components/Modal/index.modal";
import { updateChannel } from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Table, Modal, Button, notification, Icon } from "antd";

const { confirm } = Modal;

// 利用组合
@inject(allStore => allStore.appstate)
@observer
class ChannelPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      propertyData: [],
      isPropertyShow: false,
      visible: false
    };
  }

  columns = [
    {
      title: "Item Name",
      dataIndex: "ITEM_NAME",
      key: "name",
      render: text => <a href="javascript:;">{text}</a>
    },
    {
      title: "Item Description",
      dataIndex: "DESCRIPTION",
      key: "desc"
    },
    {
      title: "Item Number",
      dataIndex: "ITEM_NUMBER",
      key: "inumber"
    },
    {
      title: "ControllerChannelName",
      dataIndex: "chaname",
      key: "chaname"
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <span>
          <a onClick={() => this.deleteRow(record)} href="javascript:;">
            Delete
          </a>
        </span>
      )
    }
  ];

  // 删除通道
  deleteRow = record => {
    confirm({
      title: `Are you sure delete this ${record.name}`,
      content: "Some descriptions",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        let id = Number(record.attr.key);
        let source = this.props.appstate.channelTabData;
        // 过滤不需要的节点
        let newData = source.filter(item => {
          let key = Number(item.attr.key);
          return id !== key;
        });
        // 后端更新数据
        updateChannel({ newData: JSON.stringify(newData) }).then(result => {
          const { errno } = result.data;
          if (errno === 0) {
            this.props.appstate.updateData();
          }
        });
      }
    });
  };

  // 增加通道
  addChannelClickHandle = () => {
    this.setState({
      visible: true
    });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    let { channelDataSource, channelTabData } = this.props.appstate;
    const NODES = channelDataSource.ROOT.CHANNEL;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log("Received values of form: ", values);
      let len = channelTabData.length;
      let endKey = len ? channelTabData[len - 1].attr.key : 0;
      let key = len ? Number(endKey) + 1 : 1;
      let typeName = values.selectConfig.replace(/.xml$/, "");
      let xmlJsonData = {
        DESCRIPTION: "null",
        ITEM_NAME: values["radio-name"],
        ITEM_NUMBER: key,
        LAST_MODIFIED: Date.now(),
        NET_CONFIG: this.getTypeStr(typeName),
        TYPE: typeName || "localhost",
        attr: {
          key
        }
      };
      let source = [];
      if (NODES) {
        source = NODES.length ? NODES.slice() : [{ ...NODES }];
      }
      // 将要插入的数据以json形式传送给后端
      let formData = {
        newData: JSON.stringify(source.concat(xmlJsonData))
      };
      // 通道信息写入xml
      updateChannel(formData).then(result => {
        let isAdd = result["data"].errno;
        if (isAdd === 0) {
          // 隐藏modal
          this.setState({
            visible: false
          })
          // 更新数据，同步到客户端
          this.props.appstate.updateData();
          notification.open({
            message: "Message",
            description: `You have successfully created new channel is: ${values.select}`,
            icon: <Icon type="smile" style={{ color: "#108ee9" }} />
          });
        }
      });
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  getTypeStr = typeName => {
    let typeData;
    this.props.appstate.allTypeData.forEach(item => {
      if (item.ROOT.NAME === typeName) {
        let net = item.ROOT.NET;
        typeData = {
          MAIN: {
            IP: net.IP,
            MAC: "00:00:00:00:00:00",
            NAME: item.ROOT.NAME,
            PORT: {
              "#text": net.PORT,
              attr: {
                type: "number"
              }
            }
          },
          PORT: {
            TYPE: {
              "#text": "WIFI",
              attr: {
                type: "netconfig"
              }
            },
            UDPTIMEOUT: 1000
          }
        };
      }
    });
    return typeData;
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  rowSelectionConfig = {
    selections: {
      key: 1,
      text: "aa"
    },
    onChange: (selectedRowKeys, selectedRows) => {
      this.props.appstate.selectedChannel = selectedRowKeys[0];
      this.setState({
        isPropertyShow: true
      });
    },
    getCheckboxProps: function(record) {
      //选择框默认属性配置
      // console.log('props', record)
    },
    type: "radio"
  };

  render() {
    return (
      <div>
        <div style={{ margin: 10 }}>
          <Button type="primary" onClick={this.addChannelClickHandle}>
            Add channel
          </Button>
        </div>

        <Table
          columns={this.columns}
          rowKey="ITEM_NUMBER"
          dataSource={this.props.appstate.channelTabData.slice()}
          onChange={this.onChange}
          bordered={true}
          rowSelection={this.rowSelectionConfig}
        />
        <CollectionCreateForm
          key="modalpane"
          onCreate={this.handleCreate}
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          handleCancel={this.handleCancel}
        />
        {this.state.isPropertyShow ? <PropertyPanel /> : null}
      </div>
    );
  }
}

export default ChannelPanel;
