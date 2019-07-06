/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Table } from "antd";

class TableController extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  // 列表改变选择的回调
  onChange = (selectedRowKeys, selectedRows) => {
      // 状态提升
    if (this.props.onChange) {
        this.props.onChange(selectedRowKeys, selectedRows)
    } 
    return
  }

  rowSelectionConfig = {
    selections: {
      key: 1,
      text: "aa"
    },
    onChange: this.onChange,
    getCheckboxProps: function(record) {
      //选择框默认属性配置
      // console.log('props', record)
    },
    type: "radio"
  }

}

class TablePanel extends TableController {
  render() {
    return (
      <Table
        columns={this.props.columns}
        dataSource={this.props.data}
        bordered={true}
        rowSelection={this.rowSelectionConfig}
      />
    );
  }
}

export default TablePanel;
