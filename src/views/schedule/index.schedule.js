import React, { useState } from "react";
import { PageHeader, Row, Col, Badge, Icon, Tree } from "antd";
import { observer, inject } from "mobx-react";
const { TreeNode, DirectoryTree } = Tree;

// Tree 组件， 左侧视图
const RenderTreeNode = inject(allStore => allStore.appstate)(
    observer(props => {
      let dataSources = props.equipmentstate.getConditionsModules({
        "17": true,
      });
      const RecursiveTree = (treeData, prefix) => {
        if (treeData.length) {
          return treeData.map(item => {
            let key;
            let modules;
            let nodeData = {};
            if (!prefix) {
              key = `${item.objectName}`;
            } else {
              key = `${prefix}:${item.objectName}`;
            }
            const pattern = /^(\d)+$/;
            if (pattern.test(key)) {
              const allModules = props.equipmentstate.getModules;
              if (allModules) {
                const uniqu = {};
                const deviceModule = allModules.filter(
                  node => node.split(":")[0] === item.objectName
                );
                deviceModule.forEach(item => {
                  uniqu[item.split(":")[2][0]] = item;
                });
                modules = Object.keys(uniqu);
                nodeData.modules = modules;
                nodeData.modulesKey = deviceModule;
              }
            }
            const title = (
              <span>
                {item.text
                  ? `${item.text} ${
                      item.children.length ? `(${item.children.length})` : ""
                    }`
                  : `${item.objectName}`}
                {modules ? (
                  <Badge
                    style={{
                      backgroundColor: "#fff",
                      color: "#999",
                      boxShadow: "0 0 0 1px #d9d9d9 inset",
                      marginLeft: 5
                    }}
                    count={modules.length}
                  />
                ) : null}
              </span>
            );
  
            return (
              <TreeNode
                selectable={item.children.length ? false : true}
                nodeData={nodeData}
                icon={
                  item.children.length ? (
                    <Icon
                      type="folder-open"
                      theme="twoTone"
                      twoToneColor="#ffb818"
                    />
                  ) : (
                    <Icon type="file" theme="twoTone" />
                  )
                }
                title={title}
                key={key}
                isLeaf={!item.children.length ? true : false}
              >
                {RecursiveTree(item.children, key)}
              </TreeNode>
            );
          });
        }
        // prefix = null
        return null;
      };
      return (
        <DirectoryTree
          expandedKeys={props.expandedKeys}
          switcherIcon={<Icon type="down" />}
          multiple
          defaultExpandedKeys={
            props.expandedKeys.length ? props.expandedKeys : []
          }
          onExpand={(selectedKeys, event) => props.onExpand(selectedKeys, event)}
          onSelect={(selectedKeys, event) => props.onSelect(selectedKeys, event)}
        >
          {RecursiveTree(props.equipmentstate.getTreeData(dataSources))}
        </DirectoryTree>
      );
    })
  );

const ScheduleStrorage = inject(allStore => allStore.scheduleState)(
  observer(props => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const onExpand = expandedKeys => {
      setExpandedKeys(expandedKeys);
    };
    return (
      <div
        className="equipment-divier"
        style={{ borderBottom: "1px solid #ebedf0" }}
      >
        <PageHeader
          title={props.title}
          style={{ borderBottom: "1px solid #ebedf0" }}
          subTitle="Redis Browser Manager"
        />
        <Row>
          <Col span={6}>
            <div
              style={{
                padding: "10px",
                borderRight: "1px solid #ebedf0",
                maxHeight: "680px",
                overflow: "scroll"
              }}
            >
              <RenderTreeNode expandedKeys={expandedKeys} onExpand={onExpand} />
            </div>
          </Col>
        </Row>
      </div>
    );
  })
);

const Schedule = inject(allStore => allStore.appstate)(
  observer(props => {
    return <ScheduleStrorage/>;
  })
);

export default Schedule;
