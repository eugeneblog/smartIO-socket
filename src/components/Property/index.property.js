import React from "react";
import { Tabs } from "antd";
import WrappedApp from './components/form'

const { TabPane } = Tabs;

class PropertyPanel extends React.Component {
  constructor() {
    super()
    this.state = {
        isShow: false
    }
  }
  render() {
    return (
      <div className="card-container">
        <Tabs type="card">
            {
                this.createTabPanes(this.props.tabData)
            }
        </Tabs>
      </div>
    );
  }

  createTabPanes(panes) {
    return panes.map(item => {
        return (
            <TabPane tab={item.title} key={item.key}>
                <WrappedApp formData={item.main}/>
            </TabPane>
        )
    })

  }
}

export default PropertyPanel;
