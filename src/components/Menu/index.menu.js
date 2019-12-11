/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import "./index.menu.css";
import { observer, inject } from "mobx-react";
import { Menu, Dropdown, notification, Modal, Icon, message } from "antd";
import { uploadModules, exportDeviceToXml } from "../../api/index.api";
import { UploadModule, ExportSelectOpt } from "./MenuComponents";
const SubMenu = Menu.SubMenu;

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
      exportSelDevice: [],
      fileList: []
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
  exportXmlHandle = me => {
    let modal = null;
    const onChangeHandle = val => {
      this.setState({
        exportSelDevice: [val]
      });
    };
    console.log(this.props.equipmentstate.getTreeData);
    modal = Modal.confirm({
      title: "Export all devices to XML files",
      icon: <Icon type="snippets" />,
      content: (
        <ExportSelectOpt
          style={{ width: "100%" }}
          optList={this.props.equipmentstate.getTreeData || []}
          placeholder="Select the device to export"
          onChange={onChangeHandle}
        />
      ),
      onOk: () => {
        const { exportSelDevice } = this.state;
        if (!exportSelDevice.length) {
          return
        }
        return new Promise(resolve => {
          setTimeout(resolve, 1000);
        }).then(() => {
          exportSelDevice.forEach(device => {
            const datas = this.props.equipmentstate.getTreeData.find(list => device === list.objectName)
            console.log(datas)
          })
          exportDeviceToXml().then(res => {
            console.log(res);
          });
          modal.destroy();
        });
      }
    });
  };

  // redis文件导出
  exportRedisFile = me => {
  }

  // 导入模块
  importModule = me => {
    let _this = this;
    const { fileList } = _this.state;
    let modal = null;
    const handleUpload = () => {
      const { fileList } = this.state;
      const formData = new FormData();
      fileList.forEach(file => {
        formData.append("files", file);
      });
      return uploadModules(formData).then(res => {
        const data = res["data"].data;
        if (data.status === "done") {
          _this.setState({
            fileList: []
          });
          message.success(`file ${data.fileName} upload succesed !`);
        } else {
          message.error(`file ${data.fileName} upload failed !`);
        }
      });
    };
    let props = {
      accept: ".xml, .json", // 接受的文件类型
      multiple: true, // 支持多选
      onRemove: file => {
        _this.setState(
          state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
              fileList: newFileList
            };
          },
          () =>
            modal.update({
              content: (
                <UploadModule {...props} fileList={_this.state.fileList} />
              )
            })
        );
      },
      beforeUpload: file => {
        // 限制文件类型 json/xml 以及 文件大小
        const isJsonOrXml =
          file.type === "application/json" || file.type === "application/xml";
        const isLt2M = file.size / 1000 / 1000 < 2;
        if (!isJsonOrXml) {
          message.error("You can only upload JSON/XML file!");
        }
        if (!isLt2M) {
          message.error("File must smaller than 2MB!");
        }
        _this.setState(
          state => ({
            fileList: [...state.fileList, file]
          }),
          () => {
            modal.update({
              content: (
                <UploadModule {...props} fileList={_this.state.fileList} />
              ),
              onOk() {
                return new Promise(resolve => {
                  setTimeout(resolve, 1000);
                }).then(() => {
                  handleUpload();
                  modal.destroy();
                });
              }
            });
          }
        );
        return false;
      },
      fileList
    };
    modal = Modal.info({
      title: "Import extension module",
      maskClosable: true,
      content: <UploadModule {...props} fileList={_this.state.fileList} />,
      onOk() {
        if (!_this.state.fileList.length) {
          message.error(`Please select at least one file !`);
          return Promise.reject();
        }
        modal.destroy();
      },
      okText: "Upload"
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
              className={item.disabled ? "smartIO-menu-disabled" : "smartIO-menu"}
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
