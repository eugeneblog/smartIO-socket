import React from "react";
import { Tree, Icon } from "antd";
import "./index.tree.css";
import { observer, inject } from "mobx-react";
import { MyAwesomeMenu } from "../RightMenu/index.RightMenu";
import { contextMenu } from "react-contexify";
import { Link } from "react-router-dom";

const { TreeNode } = Tree;
const menuId = "thisIsAnId";

// tree节点控制器
class TreePanelController extends React.Component {
  // 显示tree菜单，根据treenode启用禁用菜单功能 e: event, item: 触发该对象的节点，main：指向组件本身
  handleEvent = (e, item) => {
    // 阻止事件默认行为
    e.persist();
    e.preventDefault();
    // 获取点击的tree节点配置，是否启用该菜单
    let menuEnable = item.menu;
    // 更改右键菜单disabled
    this.props.treestate.setTreeMenu(menuEnable);
    // 设置触发对象
    this.setState({
      trigger: item
    });
    // 加入异步队列，防止数据更新菜单就已经显示
    setTimeout(() => {
      contextMenu.show({
        id: menuId,
        event: e,
        props: {
          foo: "bar",
          trigger: item
        }
      });
    }, 10);
  };
}

@inject(allStore => {
  return allStore.appstate;
})
@observer
class TreePanel extends TreePanelController {
  constructor() {
    super();
    // trigger： 触发menu的tree对象是谁？
    this.state = {
      trigger: undefined
    };
  }
  render() {
    // 使用递归创建tree，无限级children创建，一劳永逸
    return (
      <React.Fragment>
        <Tree
          showLine
          defaultSelectedKeys={this.props.treestate.defaultSelectedKeys}
          defaultExpandAll
        >
          {this.createNode(this.props.treestate.treeData)}
        </Tree>
        <MyAwesomeMenu trigger={this.state.trigger} />
      </React.Fragment>
    );
  }

  // 创建Tree节点, params: treeData ，接收一个数组，递归调用
  createNode = treeData => {
    return treeData.map(item => {
      return (
        <TreeNode
          treeData={item}
          title={
            <Link
              className="tree-treelink"
              onContextMenu={e => this.handleEvent(e, item)}
              to={`/${item.name}`}
            >
              <Icon type={item.icon} style={{ paddingRight: "5px" }} />
              {item.title}
            </Link>
          }
          key={item.key}
        >
          {item.children ? this.createNode(item.children) : null}
        </TreeNode>
      );
    });
  };
}

export default TreePanel;
