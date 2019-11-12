import { observable, computed, action } from "mobx";
import { BaseState } from "../modules/appstore";
import { BACNET_OBJECT_TYPE } from "../../utils/BAC_DECODE_TEXT";
import { getPropertyIdText } from "../../utils/util";

class EquipmentState extends BaseState {
  @observable dataSource = [];
  @observable attributeData = [];
  @observable attributeIndex = 0;
  @observable selectedObjType = "";

  @observable ProductConfigurator = {
    ANALOG_INPUT: {
      OBJECT_NAME: { isEdit: true },
      DEVICE_TYPE: { isEdit: true },
      UNITS: { isEdit: true },
      DESCRIPTION: { isEdit: true },
      TIME_DELAY: { isEdit: true },
      COV_INCREMENT: { isEdit: true },
      MIN_PRES_VALUE: { isEdit: true },
      MAX_PRES_VALUE: { isEdit: true },
      HIGH_LIMIT: { isEdit: true },
      LOW_LIMIT: { isEdit: true },
      DEADBAND: { isEdit: true },
      OFFSET: { isEdit: true }
    },
    ANALOG_OUTPUT: {
      OBJECT_NAME: { isEdit: true },
      DEVICE_TYPE: { isEdit: true },
      UNITS: { isEdit: true },
      DESCRIPTION: { isEdit: true },
      TIME_DELAY: { isEdit: true },
      COV_INCREMENT: { isEdit: true },
      HIGH_LIMIT: { isEdit: true },
      LOW_LIMIT: { isEdit: true },
      DEADBAND: { isEdit: true },
      OFFSET: { isEdit: true },
      RELINQUISH_DEFAULT: { isEdit: true }
    },
    ANALOG_VALUE: {
      isAdd: true
    },
    BINARY_INPUT: {},
    BINARY_OUTPUT: {},
    BINARY_VALUE: {
      isAdd: true
    },
    SCHEDULE: {
      isAdd: true
    }
  };

  @action setSelected(val) {
    this.selectedObjType = val;
  }

  @action delDeviceObj(key) {
    if (this.dataSource.length) {
      let index = this.dataSource.findIndex(ele => {
        return ele === key;
      });
      if (index > -1) {
        this.dataSource.splice(index, 1);
      }
    }
  }
  
  @action addDeviceObj(key) {
    let pattern = /(\d)+:(\d)+:(\d)+$/;
    if (pattern.test(key)) {
      this.dataSource.push(key);
    }
  }

  // 获取对象对应配置信息
  @action getProductConfig(type) {
    return this.ProductConfigurator[
      getPropertyIdText(BACNET_OBJECT_TYPE, Number(type))
    ];
  }

  @computed get getTreeData() {
    if (!this.dataSource.length) {
      return [];
    }
    // 定义排序函数
    const compare = (a, b) => {
      let numA = Number(a.objectName);
      let numB = Number(b.objectName);
      if (numA < numB) {
        return -1;
      }
      if (numA > numB) {
        return 1;
      }
      return 0;
    };
    // 命名空间分离
    let diviceid = this.dataSource.map((item, index) => {
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
      let deviceTypeArr = this.dataSource.filter(list => {
        return list.split(":")[0] === item.objectName;
      });
      return {
        key: index,
        ...item,
        children: [...recursive(deviceTypeArr, 1)]
      };
    });

    function recursive(deviceTypeArr, num, text) {
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
          return list.split(":")[num] === item.objectName;
        });
        // 如果是第二位，进行文本转换
        if (num === 1) {
          text = getPropertyIdText(BACNET_OBJECT_TYPE, Number(item.objectName));
        }
        let content = {
          key: index,
          ...item,
          text,
          children: [...recursive(findNodes, num + 1, text)]
        };
        if (num === 2) {
          content.text = `${text} ${item.objectName}`;
        }
        return content;
      });
      childrenResult.sort(compare);
      return childrenResult;
    }
    let treeData = objData;
    // 排序
    treeData.sort(compare);
    return treeData;
  }

  // 过滤attributeData, 增加一些控制属性
  @computed get getAttributeData() {
    let data = [];
    let pattern = /(\d)+:(\d)+$/;
    let match = pattern.test(this.selectedObjType);
    if (this.attributeData && match) {
      data = this.attributeData.map(item => {
        let objType = this.selectedObjType.split(":")[1];
        // 将原始类型编号转换为文本
        let objText = getPropertyIdText(BACNET_OBJECT_TYPE, Number(objType));
        let pData = this.ProductConfigurator[objText] || {};
        let cVal = pData[item.attrName] || {};
        return {
          ...item,
          ...cVal
        };
      });
      return data;
    }
    return this.attributeData;
  }

  @computed get getPropertyData() {
    let data = [];
    if (this.propertyDataSour) {
      data = this.propertyDataSour.property_data.map((item, index) => {
        return {
          key: index,
          objProperty: item["objPropertyText"],
          value: "null"
        };
      });
    }
    return data;
  }
}

let equipmentState = new EquipmentState();

export default equipmentState;
