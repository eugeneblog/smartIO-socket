/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import PropertyPanel from "../../components/Property/index.property";
import { getChannel, updateChannel } from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Table, Modal } from "antd";

const { confirm } = Modal;

// 利用组合
@inject(allStore => allStore.appstate)
@observer
class ChannelPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      propertyData: [],
      isPropertyShow: false
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
        updateChannel({newData: JSON.stringify(newData)}).then(result => {
          const { errno } = result.data
          if (errno === 0) {
            this.props.appstate.updateData()
          }
        });
      }
    });
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
        <Table
          columns={this.columns}
          rowKey="ITEM_NUMBER"
          dataSource={this.props.appstate.channelTabData.slice()}
          onChange={this.onChange}
          bordered={true}
          rowSelection={this.rowSelectionConfig}
        />
        {this.state.isPropertyShow ? (
          <PropertyPanel tabData={this.props.appstate.propertyData} />
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    console.log("加载channel数据");
    // 加载通道信息
    getChannel().then(channelData => {
      // 获取路由返回结果
      let result = channelData.data;
      if (result.errno === 0) {
        let channelData = result["data"];
        console.log(channelData);
        this.props.appstate.channelDataSource = channelData;
      }
    });
  }
}

export default ChannelPanel;
