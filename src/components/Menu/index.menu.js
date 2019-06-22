/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* global d3 */
import React from 'react'
import './index.menu.css'
import {Menu, Dropdown, message } from 'antd'
const SubMenu = Menu.SubMenu;

class MenuController extends React.Component {
  constructor() {
    super()
    this.state = {

    }
  }
}

class Menus extends MenuController{
  render() {
    return (
        <React.Fragment>
            <div className="logo"/>
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['2']}
                style={{ lineHeight: '64px' }}
            >
                <Menu.Item key="1">nav 1</Menu.Item>
                <Menu.Item key="2">nav 2</Menu.Item>
                <Menu.Item key="3">nav 3</Menu.Item>
            </Menu>
        </React.Fragment>
    )
  }
  componentDidUpdate() {
    console.log('update')
  }
}

export default Menus