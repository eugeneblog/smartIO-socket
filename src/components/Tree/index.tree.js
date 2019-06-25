import React from 'react'
import { Tree, Icon } from 'antd'
import './index.tree.css'
import { observer, inject } from 'mobx-react'
import { MyAwesomeMenu } from '../RightMenu/index.RightMenu'
import { contextMenu } from 'react-contexify'

const { TreeNode } = Tree
const menuId = 'thisIsAnId'

// 显示tree菜单，根据treenode启用禁用菜单功能
const handleEvent = (e, item, main) => {
    e.preventDefault();
    let menuEnable = item.menu
    main.props.treestate.setTreeMenu(menuEnable)
    console.log(menuEnable)
    contextMenu.show({
      id: menuId,
      event: e,
      props: {
        foo: 'bar'
      }
    })
}

class TreePanelController extends React.Component {
    constructor() {
        super()
        this.state = {
            showRightMenu: false
        }
    }
}

@inject(allStore => {
    return allStore.appstate
}) @observer 
class TreePanel extends TreePanelController{
    constructor() {
        super()
        // trigger： 触发menu的tree对象是谁？
        this.state = {
            trigger: 'lishaocheng'
        }
    }
    render() {
        // 使用递归创建tree，无限级children创建，一劳永逸
        return (
            <React.Fragment>
                <Tree 
                showLine
                defaultExpandedKeys={['0-0']} 
                defaultSelectedKeys={['0-0']}
                onSelect={this.onSelect}
                showIcon
                defaultExpandAll
                >
                    {
                        this.createNode(this.props.treestate.treeData)
                    }
                </Tree>
                <MyAwesomeMenu trigger={this.state.trigger} />
            </React.Fragment>
        )
    }

    // 创建Tree节点, params: treeData ，接收一个数组，递归调用
    createNode = (treeData) => {
        return treeData.map((item) => {
            return (
                <TreeNode
                    title={ 
                        <div onContextMenu={(e) => handleEvent(e, item, this)}>
                            {item.title}
                        </div> 
                    }
                    key={ item.key }
                    icon={ <Icon type={ item.icon } /> }
                >
                    {
                        item.children ? this.createNode(item.children) : null
                    }
                </TreeNode>
            )
        })
    }

    // tree 选中事件
    onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);

    }

    // 右键点击事件
    nodeRightClick = (e) => {
        contextMenu.show({
            id: menuId,
            event: e,
            props: {
                foo: 'bar'
            }
        })
    }
}

export default TreePanel