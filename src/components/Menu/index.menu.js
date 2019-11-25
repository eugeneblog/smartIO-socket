/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import "./index.menu.css";
import { observer, inject } from "mobx-react";
import { Menu, Dropdown, notification, Modal, Icon, Radio, Select } from "antd";
const SubMenu = Menu.SubMenu;
const { Option } = Select;

// 菜单点击事件
const menuOnClick = function({ item, key }) {
  // 执行对应的callback
  if (!this[item.props.handle]) {
    return;
  }
  this[item.props.handle]();
};

class MenuController extends React.Component {
  constructor() {
    super();
    this.state = {
      exportSelVal: 1
    };
  }

  // 软件版本信息
  aboutHandle = me => {
    notification.open({
      message: "Smart Socket",
      description: "Version: 1.0.0"
    });
  };

  // export 导出
  exportHandle = me => {
    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px"
    };
    const onChange = e => {
      this.setState({
        exportSelVal: e.target.value
      });
      modal.update({
        content: <SelectOpt value={this.state.exportSelVal} />
      });
    };
    const SelectEqu = props => {
      const optData = this.props.equipmentstate.getTreeData;
      return (
        <Select style={props.style}>
          {optData.length
            ? optData.map((item, key) => {
                return (
                  <Option placeholder="Please select equipment" key={key} value={item.objectName}>
                    {item.objectName}
                  </Option>
                );
              })
            : null}
        </Select>
      );
    };
    const SelectOpt = () => (
      <Radio.Group onChange={onChange} value={this.state.exportSelVal}>
        <Radio style={radioStyle} value={1}>
          Export all
        </Radio>
        <Radio style={radioStyle} value={2}>
          Export section
          {this.state.exportSelVal === 2 ? (
            <SelectEqu style={{ width: 100, marginLeft: 10 }} />
          ) : null}
        </Radio>
      </Radio.Group>
    );
    const modal = Modal.confirm({
      title: "Export all devices to XML files",
      icon: <Icon type="snippets" />,
      content: <SelectOpt value={this.state.exportSelVal} />,
      onOk: () => {
        console.log(this.state);
      }
    });
  };
}

@inject(allStore => {
  return allStore.appstate;
})
@observer
class Menus extends MenuController {
  // 递归调用菜单
  recursionMenu = list => {
    return list.map((item, index) => {
      if (item === "-") {
        return <Menu.Divider key={`divider${index}`} />;
      } else {
        if (!item.children) {
          return (
            <Menu.Item
              className="smartIO-menu"
              key={item.text}
              handle={item.handle}
              disabled={item.disabled ? true : false}
            >
              <a target="_blank" rel="noopener noreferrer">
                {item.text}
                <span>{item.shortcutKey || ""}</span>
              </a>
            </Menu.Item>
          );
        } else {
          return (
            <SubMenu title={item.text} key={item.text}>
              {this.recursionMenu(item.children)}
            </SubMenu>
          );
        }
      }
    });
  };
  render() {
    return (
      <React.Fragment>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ lineHeight: "40px" }}
          forceSubMenuRender
        >
          {this.props.menustate.menuList.map((e, i) => {
            return (
              <Dropdown
                overlay={
                  <Menu onClick={k => menuOnClick.bind(this)(k)}>
                    {this.recursionMenu(e.children)}
                  </Menu>
                }
                key={i}
              >
                <a className="ant-dropdown-link" href="javascript:void(0);">
                  {e.text}
                </a>
              </Dropdown>
            );
          })}
        </Menu>
      </React.Fragment>
    );
  }
}

export default Menus;
