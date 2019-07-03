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

  handleOk = e => {
    this.props.appstate.setView("modalVisible", false);
  };

  handleCancel = e => {
    this.props.appstate.setView("modalVisible", false);
  };

  render() {
    const { modalVisible, modalLoading } = this.props.appstate.showView;
    // 给字符首字母转大写
    const modalTitle = this.props.appstate.modalPanelTitle
      ? this.props.appstate.modalPanelTitle.replace(/(^\S)/, math =>
          math.toLocaleUpperCase()
        )
      : "Not Set Title";
    return (
      <div>
        <Modal
          visible={modalVisible}
          title={modalTitle}
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
