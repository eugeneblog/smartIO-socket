import { observable, computed, action } from "mobx";
import { BaseState } from "../modules/appstore";
import { BACNET_OBJECT_TYPE } from "../../utils/BAC_DECODE_TEXT";
import { getPropertyIdText } from "../../utils/util";

class EquipmentState extends BaseState {
  @observable attributeData = [];
  @observable attributeIndex = 0;
  @observable treeData = [];
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

  // 获取对象对应配置信息
  @action getProductConfig(type) {
    return this.ProductConfigurator[
      getPropertyIdText(BACNET_OBJECT_TYPE, Number(type))
    ];
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
