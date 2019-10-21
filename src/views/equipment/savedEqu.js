/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Table, Dropdown, Icon, Menu } from "antd";
import { observer, inject } from "mobx-react";
import { readDeviceData } from "../../api/index.api";

@inject(allStore => allStore.appstate)
@observer
class SavedEqu extends React.Component {
  constructor() {
    super();
    this.mainMenu = () => {
      return (
        <Menu>
          <Menu.Item onClick={key => this.searchDevObj(key)}>
            Search device object
          </Menu.Item>
        </Menu>
      );
    };
    this.columns = [
      {
        title: "Device",
        dataIndex: "deviceid",
        key: "deviceid",
        render: text => <span>{text}</span>
      },
      {
        title: "Action",
        render: (text, record) => {
          return (
            <span className="table-operation">
              <Dropdown overlay={() => this.mainMenu(record)}>
                <a href="#">
                  Menu <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        }
      }
    ];
  }
  // 搜索设备对象
  searchDevObj = (key, obj) => {};
  render() {
    return (
      <Table
        columns={this.columns}
        dataSource={this.props.equipmentstate.takeEquiObj.slice()}
        pagination={{
          position: "bottom",
          defaultPageSize: 30,
          hideOnSinglePage: true
        }}
      />
    );
  }

  componentDidMount() {
    // 读取数据库, 获取数据
    readDeviceData({}).then(result => {
      let data = result["data"];
      let deviceAll = data["data"];

      let deviceList = deviceAll.map((item, index) => {
        return {
          deviceid: item.split(":")[0]
        };
      });
      
      // 数组对象去重
      let unique = {}
      deviceList.forEach((item) => {
        unique[JSON.stringify(item)] = item
      })
      deviceList = Object.keys(unique).map((item, index) => {
        item = JSON.parse(item)
        return {
          key: index,
          ...item
        }
      })
      this.props.equipmentstate.takeEquiObj = deviceList;
    });
  }
}

export default SavedEqu;
