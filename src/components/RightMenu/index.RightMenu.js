import React from "react";
import {
  Menu,
  Item,
  Separator,
  Submenu,
  MenuProvider
} from "react-contexify";
import { observer, inject } from "mobx-react";
import TreeModal from '../Modal/components/tree.modal'
import "react-contexify/dist/ReactContexify.min.css";

const onClick = function({ event, props }, item) {
  if (!this[item.handle]) {
      throw new Error(`undefined ${this[item.handle]}`)
  }
  this[item.handle](item, event, props);
};
// create your menu first

class RightMenuController extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  //
  addItemHandle = (self, event, caster) => {
    // 获取tree触发者name
    const triggerName = caster['trigger'].name
    console.log(triggerName)
    // 显示modalPanel
    this.props.appstate.setView('modalVisible', true)
    // 设置Title
    this.props.appstate.modalPanelTitle = triggerName
    // 给modalPanel设置要加载的组件
    this.props.appstate.setModalComponent(
        <TreeModal triggerName={triggerName} formData={caster['trigger']}/>
    )
  };

  duplicateHandle = (self, event) => {
    console.log("duplicateHandle");
  };

  cutHandle = (self, event, caster) => {
    console.log("cut", caster);
  };

  copyHandle = (self, event) => {
    console.log(this);
    console.log("copy");
  };

  rnameHandle = (self, event) => {
    console.log("rname");
  };

  emptyHandle = (self, event) => {
    console.log("empty");
  };
}

const menuId = "thisIsAnId";

@inject(allStore => allStore.appstate)
@observer
class MyAwesomeMenu extends RightMenuController {
  render() {
    return (
      <Menu id={menuId}>
        {this.createMenu(this.props.treestate.treeMenuModel)}
      </Menu>
    );
  }

  createMenu = treeMenu => {
    return treeMenu.map((item, index) => {
      if (item === "-") {
        return <Separator key={`div${index}`} />;
      } else {
        if (!item.children) {
          return (
            <Item
              onClick={({ event, props }) =>
                onClick.bind(this)({ event, props }, item)
              }
              key={item.key}
              disabled={item.disabled}
            >
              {item.title}
            </Item>
          );
        } else {
          return <Submenu>{this.createMenu(this.children)}</Submenu>;
        }
      }
    });
  };
}

class RightMenu extends React.Component {
  render() {
    return (
      <React.Fragment>
        <MenuProvider id="menu_id" style={{ display: "inline-block" }}>
          {this.props.title}
        </MenuProvider>
      </React.Fragment>
    );
  }
}

export { RightMenu, MyAwesomeMenu };
