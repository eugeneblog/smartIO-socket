import React, {useState, useEffect} from "react";
import {observer, inject} from "mobx-react";
import {Menu, Icon} from "antd";
import {Link} from "react-router-dom";

const {SubMenu} = Menu;

const NavMenu = inject(allStore => allStore.appstate)(
  observer(props => {
    const [theme] = useState("dark");
    const [current, setCurrent] = useState();
    let defaultOpenKeys = [];
    const handleClick = ({item, key, keyPath, domEvent}) => {
      // 路由阻止离开时不执行
      if (!props.appstate.isBlocking) {
        props["history"].history.push(`/${item.props.name}`);
        setCurrent(key);
      }
    };
    // 根据路由变化修改选择导航菜单
    useEffect(() => {
      const {location} = props.history;
      props.treestate.defaultSelectedKey(location.pathname);
      setCurrent(props.treestate.currentKeys);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const renderMenus = (menuData) => {
      return menuData.map(item => {
        if (item.children) {
          const isOpen = item.isOpen;
          if (isOpen) {
            defaultOpenKeys.push(item.key)
          }
          return (
            <SubMenu
              key={item.key}
              title={
                <span>
                  <Icon type={item.icon}/>
                  <span>{item.title}</span>
                </span>
              }
            >
              {renderMenus(item.children)}
            </SubMenu>
          );
        }
        return (
          <Menu.Item key={item.key} name={item.name}>
            {
              <Link to={`/${item.name}`}>
                <Icon type={item.icon}/>
                {item.title}
              </Link>
            }
          </Menu.Item>
        );
      });
    };
    return (
      <Menu
        theme={theme}
        onClick={handleClick}
        selectedKeys={[current]}
        selectable={true}
        mode="inline"
        defaultOpenKeys={defaultOpenKeys}
      >
        {renderMenus(props.treestate.treeData)}
      </Menu>
    );
  })
);

export default NavMenu;
