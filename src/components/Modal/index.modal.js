import React from "react";
import { Modal, Button } from "antd";
import { observer, inject } from "mobx-react";

@inject(allStore => allStore.appstate)
@observer
class ModalPanel extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    const { modalVisible, modalLoading } = this.props.appstate.showView;
    return (
      <div>
        <Modal
          visible={modalVisible}
          title={this.props.title}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              Return
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={modalLoading}
              onClick={this.handleOk}
            >
              Submit
            </Button>
          ]}
        >
          {this.props.Component}
        </Modal>
      </div>
    );
  }
}

export default ModalPanel;
