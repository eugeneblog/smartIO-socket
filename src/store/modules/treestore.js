import { observable, action } from "mobx";
import { BaseState } from "../modules/appstore";
import cookie from 'react-cookies'

class TreeState extends BaseState {
  @observable treeMenuModel = [
    {
      title: "Add Item...",
      name: "addItem",
      handle: "addItemHandle",
      key: "1",
      disabled: true
    },
    {
      title: "Duplicate...",
      name: "duplicate",
      handle: "duplicateHandle",
      key: "2",
      disabled: true
    },
    "-",
    {
      title: "Cut",
      name: "cut",
      handle: "cutHandle",
      key: "3",
      disabled: true
    },
    {
      title: "Copy",
      name: "copy",
      handle: "copyHandle",
      key: "4",
      disabled: true
    },
    "-",
    {
      title: "Rname...",
      name: "rname",
      handle: "rnameHandle",
      key: "5",
      disabled: true
    },
    {
      title: "Empty Recycle Bin",
      name: "emptyRecycleBin",
      handle: "emptyHandle",
      key: "6",
      disabled: true
    }
  ];
  @observable treeData = [
    {
      title: "Facillty",
      key: "0-0",
      icon: "bank",
      name: "facillty",
      menu: {
        copy: true,
        cut: true
      },
      isOpen: true,
      children: [
        {
          title: "GroupName",
          icon: "branches",
          name: "groupName",
          key: "0-0-0",
          menu: {
            copy: true
          }
        }
      ]
    },
    {
      title: "System Components",
      key: "0-1",
      name: "system",
      icon: "hdd",
      menu: {
        copy: true
      },
      isOpen: true,
      children: [
        {
          title: "Channel",
          key: "0-1-0-0",
          icon: "rocket",
          name: "channel",
          menu: { rname: true, addItem: true }
        },
        {
          title: "Controller",
          key: "0-1-0-1",
          icon: "control",
          name: "controller",
          menu: { rname: true, addItem: true }
        },
        {
          title: "Schedule",
          key: "0-1-0-2",
          icon: "schedule",
          name: "schedule",
          menu: { rname: true, addItem: true }
        },
        {
          title: "Server",
          key: "0-1-0-3",
          icon: "cloud-server",
          name: "server",
          menu: { rname: true, addItem: true }
        },
        {
          title: "Station",
          key: "0-1-0-4",
          icon: "bulb",
          name: "station",
          menu: { addItem: true }
        },
        {
          title: "Trend/Group",
          key: "0-1-0-5",
          name: "trend",
          icon: "usergroup-add",
          menu: { addItem: true }
        }
      ]
    },
    {
      title: "Alam Groups",
      name: "alam",
      key: "0-2",
      icon: "team",
      menu: {
        copy: true,
        addItem: true
      }
    },
    {
      title: "equipment",
      name: "equipment",
      key: "0-3",
      icon: "api",
      menu: {
        copy: true
      }
    }
  ];
  @observable currentKeys = cookie.load('currentKeys') ? cookie.load('currentKeys') : ['0-0-0'];

  // 根据路由计算tree节点应该选中哪一个
  @action defaultSelectedKey(currentRouter) {
    const findNode = arr => {
      arr.forEach(item => {
        let routeName = `/${item.name}`;
        if (routeName === currentRouter) {
          this.currentKeys = item.key;
          cookie.save('currentKeys', item.key, { path: '/' })
        }
        if (item.children) {
          findNode(item.children);
        }
        return;
      });
    };
    findNode(this.treeData);
  }
  // 更改tree菜单数据
  @action setTreeMenu = node => {
    // 先关闭所有tree菜单
    this.treeMenuModel.forEach(item => {
      if (typeof item === "object") {
        item.disabled = true;
      }
    });
    // 遍历开关，循环菜单然后开启功能
    for (const key in node) {
      this.treeMenuModel.forEach(item => {
        if (typeof item === "object") {
          if (item.name === key) {
            item.disabled = false;
          }
        }
      });
    }
  };
}

let treestate = new TreeState();
export default treestate;
