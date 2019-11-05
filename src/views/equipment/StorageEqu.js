/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Tree, PageHeader, Skeleton } from "antd";
import { observer, inject } from "mobx-react";
import { readDeviceData } from "../../api/index.api";

const { TreeNode, DirectoryTree } = Tree;

const RenderTreeNode = inject(allStore => allStore.appstate)(
  observer(props => {
    return (
      <DirectoryTree multiple defaultExpandAll>
        <TreeNode title="parent 0" key="0-0">
          <TreeNode title="leaf 0-0" key="0-0-0" isLeaf />
          <TreeNode title="leaf 0-1" key="0-0-1" isLeaf />
        </TreeNode>
      </DirectoryTree>
    );
  })
);

@inject(allStore => allStore.appstate)
@observer
class StorageEqu extends React.Component {
  // this.props.equipmentstate.takeEquiObj.slice()
  render() {
    return (
      <div
        className="equipment-divier"
        style={{ borderBottom: "1px solid #ebedf0" }}
      >
        <PageHeader
          title={this.props.title}
          style={{ borderBottom: "1px solid #ebedf0" }}
          subTitle="Redis Browser Manager"
        />
        <div style={{ padding: "10px" }}>
          {this.props.equipmentstate.takeEquiObj ? (
            <RenderTreeNode />
          ) : (
            <Skeleton active />
          )}
        </div>
      </div>
    );
  }

  componentDidMount() {
    // 读取数据库, 获取数据
    readDeviceData({}).then(result => {
      let data = result["data"];
      let deviceAll = data["data"];
      console.log(deviceAll);
      function refactoringTree() {
        // 命名空间分离
        let diviceid = deviceAll.map((item, index) => {
          return {
            objectName: item.split(":")[0]
          };
        });
        // 去重
        function duplicateRemoval(listArr) {
          let unique = {};
          listArr.forEach(item => {
            unique[JSON.stringify(item)] = item;
          });
          return unique;
        }
        let unique = duplicateRemoval(diviceid);

        // 重组
        let objData = Object.keys(unique).map((item, index) => {
          item = JSON.parse(item);
          // 查询
          let deviceTypeArr = deviceAll.filter(list => {
            return list.split(":")[0] === item.objectName;
          });
          return {
            key: index,
            ...item,
            children: [...recursive(deviceTypeArr, 1)]
          };
        });

        function recursive(deviceTypeArr, num) {
          // 如果num > namespace 总长 退出
          if (num > 2) {
            return [];
          }
          // 分离
          let diviceid = deviceTypeArr.map(item => {
            return {
              objectName: item.split(":")[num]
            };
          });

          // 去重
          let unique = duplicateRemoval(diviceid);

          // 前三步为加工数据，最后一步决定是否继续递归执行
          let childrenResult = Object.keys(unique).map((item, index) => {
            item = JSON.parse(item);
            // 查询
            let findNodes = deviceTypeArr.filter(list => {
              return list.split(":")[1] === item.objectName;
            });
            return {
              key: index,
              ...item,
              children: [...recursive(findNodes, num + 1)]
            };
          });

          return childrenResult;
        }

        return objData;
      }

      let treeData = refactoringTree();
      this.props.equipmentstate.takeEquiObj = treeData;
    });
  }
}

export default StorageEqu;
