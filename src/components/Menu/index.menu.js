/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import './index.menu.css'
import { observer, inject } from 'mobx-react'
import {Menu, Dropdown } from 'antd'
const SubMenu = Menu.SubMenu

// 菜单点击事件
const menuOnClick = function({item, key}) {
    // 执行对应的callback
    this[item.props.handle]()
}

class MenuController extends React.Component {
  constructor() {
    super()
    this.state = {

    }
  }

  // 获取udp广播消息
  bacnetDisHandle = (me) => {
    // 发送后台请求
    console.log('click')
  }
}

@inject(allStore => {
    return allStore.appstate
}) @observer 
class Menus extends MenuController{
  // 递归调用菜单
  recursionMenu = (list) => {
    return list.map((item, index) => {
      if (item === '-') {
        return (
          <Menu.Divider key={ `divider${index}` } /> 
        )
      } else {
        if(!item.children) {
          return (
            <Menu.Item 
            className="smartIO-menu" 
            key={ item.text }
            handle={ item.handle }
            disabled={ item.disabled ? true : false }>
              <a target="_blank" rel="noopener noreferrer" >
                { item.text }
                <span>{ item.shortcutKey || '' }</span>
              </a>
            </Menu.Item>
          )
        } else {
          return (
            <SubMenu title={ item.text } key={ item.text }>
              {
                this.recursionMenu(item.children)
              }
            </SubMenu>
          )
        }
      }
    })
  }
  render() {
    return (
        <React.Fragment>
            <div className="logo"/>
            <Menu
                theme="dark"
                mode="horizontal"
                style={{ lineHeight: '40px' }}
            >
                {
                    this.props.menustate.menuList.map((e, i) => {
                        return (
                            <Dropdown
                            overlay={
                            <Menu onClick={ (k) => menuOnClick.bind(this)(k) }>
                                {
                                  this.recursionMenu(e.children)
                                }
                            </Menu>
                            }
                            key={i}
                            >
                                <a className="ant-dropdown-link" href="javascript:void(0);">
                                    {e.text}
                                </a>
                            </Dropdown> 
                        )
                    })
                }
            </Menu>
        </React.Fragment>
    )
  }
}

export default Menus