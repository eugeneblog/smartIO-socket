/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { Table } from 'antd'

class TableController extends React.Component{
    constructor() {
        super()
        this.state = {

        }
    }
}

class TablePanel extends TableController{
    render() {
        return (
          <Table columns={this.props.columns} dataSource={this.props.data} />
        )
    }
}

export default TablePanel