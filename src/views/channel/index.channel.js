/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import TablePanel from "../../components/Table/index.table";
import PropertyPanel from "../../components/Property/index.property";

const columns = [{
  title: 'Item Name',
  dataIndex: 'name',
  key: 'name',
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: 'Item Description',
  dataIndex: 'desc',
  key: 'desc'
}, {
  title: 'Item Number',
  dataIndex: 'inumber',
  key: 'inumber'
}, {
  title: 'ControllerChannelName',
  dataIndex: 'chaname',
  key: 'chaname'
}]

const propertyData = [{
  title: 'Main',
  key: '1',
  main: [{
    id: '1',
    label: 'Name',
    type: 'input',
    value: 'xxx'
  }, {
    id: '2',
    label: 'Descripiton',
    type: 'input',
    value: 'xxx'
  }, {
    id: '3',
    label: 'Instance Number',
    type: 'input',
    value: 'xxx'
  }]
}, {
  title: 'Display',
  key: '2',
  main: [{
    id: '1',
    label: 'Associated Display',
    type: 'input',
    value: 'xxx'
  }]
}]

// 利用组合
class ChannelPanel extends React.Component {
  render() {
    return (
      <div>
        <TablePanel columns={columns} />
        <PropertyPanel tabData={propertyData} />
      </div>
    );
  }

  componentDidMount() {
    console.log('aa')
  }
}

export default ChannelPanel;