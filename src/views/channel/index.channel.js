/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import PropertyPanel from "../../components/Property/index.property";
import { getChannel } from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Table } from 'antd'

let propertyData = [
  {
    title: "Main",
    key: "1",
    main: [
      {
        id: "1",
        label: "Name",
        type: "input",
        value: "xxx"
      },
      {
        id: "2",
        label: "Descripiton",
        type: "input",
        value: "xxx"
      },
      {
        id: "3",
        label: "Instance Number",
        type: "input",
        value: "xxx"
      }
    ]
  },
  {
    title: "Display",
    key: "2",
    main: [
      {
        id: "1",
        label: "Associated Display",
        type: "input",
        value: "xxx"
      }
    ]
  }
];

// 利用组合
@inject(allStore => allStore.appstate)
@observer
class ChannelPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      propertyData: propertyData,
      isPropertyShow: false
    };
  }

  columns = [
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
      render: text => <a href="javascript:;">{text}</a>
    },
    {
      title: "Item Description",
      dataIndex: "desc",
      key: "desc"
    },
    {
      title: "Item Number",
      dataIndex: "inumber",
      key: "inumber"
    },
    {
      title: "ControllerChannelName",
      dataIndex: "chaname",
      key: "chaname"
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={() => this.deleteRow(record)} href="javascript:;">Delete</a>
        </span>
      ),
    },
  ];

  // 删除通道
  deleteRow = (record) => {
    this.props.appstate.channelTabData.remove(record)
  }

  rowSelectionConfig = {
    selections: {
      key: 1,
      text: "aa"
    },
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(selectedRowKeys)
      this.setState({
        isPropertyShow: true
      });
    },
    getCheckboxProps: function(record) {
      //选择框默认属性配置
      // console.log('props', record)
    },
    type: "radio"
  }

  render() {
    return (
      <div>
        <Table
          columns={this.columns}
          dataSource={this.props.appstate.channelTabData.slice()}
          onChange={this.onChange}
          bordered={true}
          rowSelection={this.rowSelectionConfig}
        />
        {this.state.isPropertyShow ? (
          <PropertyPanel tabData={this.state.propertyData} />
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    console.log("加载channel数据");
    // 加载通道信息
    let params = {
      fileName: "channel"
    };
    getChannel(params)
      .then(channelData => {
        // 获取路由返回结果
        let result = channelData.data;
        // 解析json字符串
        let channelVal = JSON.parse(result.data.xmlJson);
        let Root = channelVal["ROOT"];
        if (Root.CHANNEL.length) {
          return Root.CHANNEL;
        } else {
          this.props.appstate.channelTabData.set(0, 
            {
              key: "1",
              name: Root.CHANNEL.ITEM_NAME._text,
              desc: 1231,
              inumber: "New York No. 1 Lake Park",
              chaname: ["nice", "developer"]
            }
          );
        }
      })
      .then(channel => {
        if (channel) {
          let tableData = channel.map(item => {
            return {
              key: item._attributes.key,
              name: item.ITEM_NAME._text,
              desc: 1231,
              inumber: item.ITEM_NUMBER._text,
              chaname: ["nice", "developer"]
            };
          });
          this.props.appstate.channelTabData = tableData
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
}

export default ChannelPanel;
