/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import PropertyPanel from "../../components/Property/index.property";
import { getChannel, delChannel } from "../../api/index.api";
import { observer, inject } from "mobx-react";
import { Table, message, Modal } from "antd";

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
        delChannel({ id: Number(record.key), filename: "channel" }).then(
          delData => {
            let result = delData["data"];
            if (result.errno === 0) {
              this.props.appstate.channelTabData.remove(record);
              message.success(`Delete ${record.name} successed`);
            } else {
              message.error(`Delete ${record.name} failed`);
            }
          }
        );
      }
    });
  };

  rowSelectionConfig = {
    selections: {
      key: 1,
      text: "aa"
    },
    onChange: (selectedRowKeys, selectedRows) => {
      let config = [];
      let NET_CONFIG = selectedRows[0].netConfig;
      console.log(selectedRows[0])
      let index = 0;
      // 动态生成属性面板数据
      for (const key in NET_CONFIG) {
        if (NET_CONFIG.hasOwnProperty(key)) {
          const element = NET_CONFIG[key];
          config.push({
            title: key.toLocaleLowerCase(),
            key: (index += 1),
            main: Array.from(
              { length: Object.keys(element).length },
              (v, id) => {
                return {
                  id,
                  label: Object.keys(element)[id],
                  value: element[Object.keys(element)[id]]._text,
                  type: "input"
                };
              }
            )
          });
        }
      }
      // let propertyData = config.map(item => item)
      this.setState(
        {
          isPropertyShow: false,
          propertyData: config
        },
        () => {
          this.setState({
            isPropertyShow: true
          });
        }
      );
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
          this.props.appstate.channelTabData.set(0, {
            key: "1",
            name: Root.CHANNEL.ITEM_NAME._text,
            desc: 1231,
            inumber: "New York No. 1 Lake Park",
            chaname: ["nice", "developer"],
            netConfig: Root.CHANNEL.NET_CONFIG
          });
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
              chaname: ["nice", "developer"],
              netConfig: item.NET_CONFIG
            };
          });
          this.props.appstate.channelTabData = tableData;
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
}

export default ChannelPanel;
