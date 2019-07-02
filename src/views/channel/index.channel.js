/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import TablePanel from "../../components/Table/index.table";
import PropertyPanel from "../../components/Property/index.property";

// 利用组合
class ChannelPanel extends React.Component {
  render() {
    return (
      <div>
        <TablePanel />
        <PropertyPanel />
      </div>
    );
  }
}

export default ChannelPanel;