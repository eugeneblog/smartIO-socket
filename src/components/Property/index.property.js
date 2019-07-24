import React from "react";
import { Tabs } from "antd";
import { observer, inject } from "mobx-react";
import WrappedApp from "./components/form";

const { TabPane } = Tabs;

@inject(allStore => allStore.appstate)
@observer
class PropertyPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      isShow: false
    };
  }
  render() {
    return (
      <div className="card-container">
        <Tabs type="card">{this.createTabPanes(this.props.tabData)}</Tabs>
      </div>
    );
  }

  // 更改main配置
  onNetChangeHandle = (parameter) => {
    console.log(this.props.tabData)
    console.log(parameter)
  }

  createTabPanes(panes) {
    return panes.map(item => {
      return (
        <TabPane tab={item.title} key={item.key}>
          <WrappedApp formData={item.main} onNetChange={this.onNetChangeHandle}/>
        </TabPane>
      );
    });
  }
}

export default PropertyPanel;
