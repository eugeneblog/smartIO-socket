import { observable, computed, action } from "mobx";
import { BaseState } from "../modules/appstore";
import { BACNET_OBJECT_TYPE } from "../../utils/BAC_DECODE_TEXT";
import { getPropertyIdText } from "../../utils/util";
// const UNITS_DATA = objConverArray(BACNET_ENGINEERING_UNITS);
// UNITS INPUT DATA
const UNITS_DATA = {
  /* Area */
  Area: {
    UNITS_METERS_PER_SECOND_PER_SECOND: 166,
    UNITS_SQUARE_METERS: 0,
    UNITS_SQUARE_CENTIMETERS: 116,
    UNITS_SQUARE_FEET: 1,
    UNITS_SQUARE_INCHES: 115
  },
  /* Currency */
  Currency: {
    UNITS_CURRENCY1: 105,
    UNITS_CURRENCY2: 106,
    UNITS_CURRENCY3: 107,
    UNITS_CURRENCY4: 108,
    UNITS_CURRENCY5: 109,
    UNITS_CURRENCY6: 110,
    UNITS_CURRENCY7: 111,
    UNITS_CURRENCY8: 112,
    UNITS_CURRENCY9: 113,
    UNITS_CURRENCY10: 114
  },
  /* Electrical */
  Electrical: {
    UNITS_MILLIAMPERES: 2,
    UNITS_AMPERES: 3,
    UNITS_AMPERES_PER_METER: 167,
    UNITS_AMPERES_PER_SQUARE_METER: 168,
    UNITS_AMPERE_SQUARE_METERS: 169,
    UNITS_DECIBELS: 199,
    UNITS_DECIBELS_MILLIVOLT: 200,
    UNITS_DECIBELS_VOLT: 201,
    UNITS_FARADS: 170,
    UNITS_HENRYS: 171,
    UNITS_OHMS: 4,
    UNITS_OHM_METERS: 172,
    UNITS_MILLIOHMS: 145,
    UNITS_KILOHMS: 122,
    UNITS_MEGOHMS: 123,
    UNITS_MICROSIEMENS: 190,
    UNITS_MILLISIEMENS: 202,
    UNITS_SIEMENS: 173 /* 1 mho equals 1 siemens */,
    UNITS_SIEMENS_PER_METER: 174,
    UNITS_TESLAS: 175,
    UNITS_VOLTS: 5,
    UNITS_MILLIVOLTS: 124,
    UNITS_KILOVOLTS: 6,
    UNITS_MEGAVOLTS: 7,
    UNITS_VOLT_AMPERES: 8,
    UNITS_KILOVOLT_AMPERES: 9,
    UNITS_MEGAVOLT_AMPERES: 10,
    UNITS_VOLT_AMPERES_REACTIVE: 11,
    UNITS_KILOVOLT_AMPERES_REACTIVE: 12,
    UNITS_MEGAVOLT_AMPERES_REACTIVE: 13,
    UNITS_VOLTS_PER_DEGREE_KELVIN: 176,
    UNITS_VOLTS_PER_METER: 177,
    UNITS_DEGREES_PHASE: 14,
    UNITS_POWER_FACTOR: 15,
    UNITS_WEBERS: 178
  },
  /* Energy */
  Energy: {
    UNITS_JOULES: 16,
    UNITS_KILOJOULES: 17,
    UNITS_KILOJOULES_PER_KILOGRAM: 125,
    UNITS_MEGAJOULES: 126,
    UNITS_WATT_HOURS: 18,
    UNITS_KILOWATT_HOURS: 19,
    UNITS_MEGAWATT_HOURS: 146,
    UNITS_WATT_HOURS_REACTIVE: 203,
    UNITS_KILOWATT_HOURS_REACTIVE: 204,
    UNITS_MEGAWATT_HOURS_REACTIVE: 205,
    UNITS_BTUS: 20,
    UNITS_KILO_BTUS: 147,
    UNITS_MEGA_BTUS: 148,
    UNITS_THERMS: 21,
    UNITS_TON_HOURS: 22
  },
  /* Enthalpy */
  Enthalpy: {
    UNITS_JOULES_PER_KILOGRAM_DRY_AIR: 23,
    UNITS_KILOJOULES_PER_KILOGRAM_DRY_AIR: 149,
    UNITS_MEGAJOULES_PER_KILOGRAM_DRY_AIR: 150,
    UNITS_BTUS_PER_POUND_DRY_AIR: 24,
    UNITS_BTUS_PER_POUND: 117
  },
  /* Entropy */
  Entropy: {
    UNITS_JOULES_PER_DEGREE_KELVIN: 127,
    UNITS_KILOJOULES_PER_DEGREE_KELVIN: 151,
    UNITS_MEGAJOULES_PER_DEGREE_KELVIN: 152,
    UNITS_JOULES_PER_KILOGRAM_DEGREE_KELVIN: 128
  },
  /* Force */
  Force: {
    UNITS_NEWTON: 153
  },
  /* Frequency */
  Frequency: {
    UNITS_CYCLES_PER_HOUR: 25,
    UNITS_CYCLES_PER_MINUTE: 26,
    UNITS_HERTZ: 27,
    UNITS_KILOHERTZ: 129,
    UNITS_MEGAHERTZ: 130,
    UNITS_PER_HOUR: 131
  },
  /* Humidity */
  Humidity: {
    UNITS_GRAMS_OF_WATER_PER_KILOGRAM_DRY_AIR: 28,
    UNITS_PERCENT_RELATIVE_HUMIDITY: 29
  },
  /* Length */
  Length: {
    UNITS_MICROMETERS: 194,
    UNITS_MILLIMETERS: 30,
    UNITS_CENTIMETERS: 118,
    UNITS_KILOMETERS: 193,
    UNITS_METERS: 31,
    UNITS_INCHES: 32,
    UNITS_FEET: 33
  },
  /* Light */
  Light: {
    UNITS_CANDELAS: 179,
    UNITS_CANDELAS_PER_SQUARE_METER: 180,
    UNITS_WATTS_PER_SQUARE_FOOT: 34,
    UNITS_WATTS_PER_SQUARE_METER: 35,
    UNITS_LUMENS: 36,
    UNITS_LUXES: 37,
    UNITS_FOOT_CANDLES: 38
  },
  /* Mass */
  Mass: {
    UNITS_MILLIGRAMS: 196,
    UNITS_GRAMS: 195,
    UNITS_KILOGRAMS: 39,
    UNITS_POUNDS_MASS: 40,
    UNITS_TONS: 41
  },
  /* Mass Flow */
  MassFlow: {
    UNITS_GRAMS_PER_SECOND: 154,
    UNITS_GRAMS_PER_MINUTE: 155,
    UNITS_KILOGRAMS_PER_SECOND: 42,
    UNITS_KILOGRAMS_PER_MINUTE: 43,
    UNITS_KILOGRAMS_PER_HOUR: 44,
    UNITS_POUNDS_MASS_PER_SECOND: 119,
    UNITS_POUNDS_MASS_PER_MINUTE: 45,
    UNITS_POUNDS_MASS_PER_HOUR: 46,
    UNITS_TONS_PER_HOUR: 156
  },
  /* Power */
  Power: {
    UNITS_MILLIWATTS: 132,
    UNITS_WATTS: 47,
    UNITS_KILOWATTS: 48,
    UNITS_MEGAWATTS: 49,
    UNITS_BTUS_PER_HOUR: 50,
    UNITS_KILO_BTUS_PER_HOUR: 157,
    UNITS_HORSEPOWER: 51,
    UNITS_TONS_REFRIGERATION: 52
  },
  /* Pressure */
  Pressure: {
    UNITS_PASCALS: 53,
    UNITS_HECTOPASCALS: 133,
    UNITS_KILOPASCALS: 54,
    UNITS_MILLIBARS: 134,
    UNITS_BARS: 55,
    UNITS_POUNDS_FORCE_PER_SQUARE_INCH: 56,
    UNITS_MILLIMETERS_OF_WATER: 206,
    UNITS_CENTIMETERS_OF_WATER: 57,
    UNITS_INCHES_OF_WATER: 58,
    UNITS_MILLIMETERS_OF_MERCURY: 59,
    UNITS_CENTIMETERS_OF_MERCURY: 60,
    UNITS_INCHES_OF_MERCURY: 61
  },
  /* Temperature */
  Temperature: {
    UNITS_DEGREES_CELSIUS: 62,
    UNITS_DEGREES_KELVIN: 63,
    UNITS_DEGREES_KELVIN_PER_HOUR: 181,
    UNITS_DEGREES_KELVIN_PER_MINUTE: 182,
    UNITS_DEGREES_FAHRENHEIT: 64,
    UNITS_DEGREE_DAYS_CELSIUS: 65,
    UNITS_DEGREE_DAYS_FAHRENHEIT: 66,
    UNITS_DELTA_DEGREES_FAHRENHEIT: 120,
    UNITS_DELTA_DEGREES_KELVIN: 121
  },
  /* Time */
  Time: {
    UNITS_YEARS: 67,
    UNITS_MONTHS: 68,
    UNITS_WEEKS: 69,
    UNITS_DAYS: 70,
    UNITS_HOURS: 71,
    UNITS_MINUTES: 72,
    UNITS_SECONDS: 73,
    UNITS_HUNDREDTHS_SECONDS: 158,
    UNITS_MILLISECONDS: 159
  },
  /* Torque */
  Torque: {
    UNITS_NEWTON_METERS: 160
  },
  /* Velocity */
  Velocity: {
    UNITS_MILLIMETERS_PER_SECOND: 161,
    UNITS_MILLIMETERS_PER_MINUTE: 162,
    UNITS_METERS_PER_SECOND: 74,
    UNITS_METERS_PER_MINUTE: 163,
    UNITS_METERS_PER_HOUR: 164,
    UNITS_KILOMETERS_PER_HOUR: 75,
    UNITS_FEET_PER_SECOND: 76,
    UNITS_FEET_PER_MINUTE: 77,
    UNITS_MILES_PER_HOUR: 78
  },
  /* Volume */
  Volume: {
    UNITS_CUBIC_FEET: 79,
    UNITS_CUBIC_METERS: 80,
    UNITS_IMPERIAL_GALLONS: 81,
    UNITS_MILLILITERS: 197,
    UNITS_LITERS: 82,
    UNITS_US_GALLONS: 83
  },
  /* Volumetric Flow */
  VolumetricFlow: {
    UNITS_CUBIC_FEET_PER_SECOND: 142,
    UNITS_CUBIC_FEET_PER_MINUTE: 84,
    UNITS_CUBIC_FEET_PER_HOUR: 191,
    UNITS_CUBIC_METERS_PER_SECOND: 85,
    UNITS_CUBIC_METERS_PER_MINUTE: 165,
    UNITS_CUBIC_METERS_PER_HOUR: 135,
    UNITS_IMPERIAL_GALLONS_PER_MINUTE: 86,
    UNITS_MILLILITERS_PER_SECOND: 198,
    UNITS_LITERS_PER_SECOND: 87,
    UNITS_LITERS_PER_MINUTE: 88,
    UNITS_LITERS_PER_HOUR: 136,
    UNITS_US_GALLONS_PER_MINUTE: 89,
    UNITS_US_GALLONS_PER_HOUR: 192
  },
  /* Other */
  Other: {
    UNITS_DEGREES_ANGULAR: 90,
    UNITS_DEGREES_CELSIUS_PER_HOUR: 91,
    UNITS_DEGREES_CELSIUS_PER_MINUTE: 92,
    UNITS_DEGREES_FAHRENHEIT_PER_HOUR: 93,
    UNITS_DEGREES_FAHRENHEIT_PER_MINUTE: 94,
    UNITS_JOULE_SECONDS: 183,
    UNITS_KILOGRAMS_PER_CUBIC_METER: 186,
    UNITS_KW_HOURS_PER_SQUARE_METER: 137,
    UNITS_KW_HOURS_PER_SQUARE_FOOT: 138,
    UNITS_MEGAJOULES_PER_SQUARE_METER: 139,
    UNITS_MEGAJOULES_PER_SQUARE_FOOT: 140,
    UNITS_NO_UNITS: 95,
    UNITS_NEWTON_SECONDS: 187,
    UNITS_NEWTONS_PER_METER: 188,
    UNITS_PARTS_PER_MILLION: 96,
    UNITS_PARTS_PER_BILLION: 97,
    UNITS_PERCENT: 98,
    UNITS_PERCENT_OBSCURATION_PER_FOOT: 143,
    UNITS_PERCENT_OBSCURATION_PER_METER: 144,
    UNITS_PERCENT_PER_SECOND: 99,
    UNITS_PER_MINUTE: 100,
    UNITS_PER_SECOND: 101,
    UNITS_PSI_PER_DEGREE_FAHRENHEIT: 102,
    UNITS_RADIANS: 103,
    UNITS_RADIANS_PER_SECOND: 184,
    UNITS_REVOLUTIONS_PER_MINUTE: 104,
    UNITS_SQUARE_METERS_PER_NEWTON: 185,
    UNITS_WATTS_PER_METER_PER_DEGREE_KELVIN: 189,
    UNITS_WATTS_PER_SQUARE_METER_DEGREE_KELVIN: 141,
    UNITS_PER_MILLE: 207,
    UNITS_GRAMS_PER_GRAM: 208,
    UNITS_KILOGRAMS_PER_KILOGRAM: 209,
    UNITS_GRAMS_PER_KILOGRAM: 210,
    UNITS_MILLIGRAMS_PER_GRAM: 211,
    UNITS_MILLIGRAMS_PER_KILOGRAM: 212,
    UNITS_GRAMS_PER_MILLILITER: 213,
    UNITS_GRAMS_PER_LITER: 214,
    UNITS_MILLIGRAMS_PER_LITER: 215,
    UNITS_MICROGRAMS_PER_LITER: 216,
    UNITS_GRAMS_PER_CUBIC_METER: 217,
    UNITS_MILLIGRAMS_PER_CUBIC_METER: 218,
    UNITS_MICROGRAMS_PER_CUBIC_METER: 219,
    UNITS_NANOGRAMS_PER_CUBIC_METER: 220,
    UNITS_GRAMS_PER_CUBIC_CENTIMETER: 221,
    UNITS_BECQUERELS: 222,
    UNITS_MEGABECQUERELS: 224,
    UNITS_GRAY: 225,
    UNITS_MILLIGRAY: 226,
    UNITS_MICROGRAY: 227,
    UNITS_SIEVERTS: 228,
    UNITS_MILLISIEVERTS: 229,
    UNITS_MICROSIEVERTS: 230,
    UNITS_MICROSIEVERTS_PER_HOUR: 231,
    UNITS_DECIBELS_A: 232,
    UNITS_NEPHELOMETRIC_TURBIDITY_UNIT: 233,
    UNITS_PH: 234,
    UNITS_GRAMS_PER_SQUARE_METER: 235,
    UNITS_MINUTES_PER_DEGREE_KELVIN: 236,
    /* Enumerated values 0-255 are reserved for definition by ASHRAE. */
    /* Enumerated values 256-65535 may be used by others subject to */
    /* the procedures and constraints described in Clause 23. */
    /* The last enumeration used in this version is 236. */
    MAX_UNITS: 237,
    /* do the proprietary range inside of enum so that
           compilers will allocate adequate sized datatype for enum
           which is used to store decoding */
    UNITS_PROPRIETARY_RANGE_MIN: 256,
    UNITS_PROPRIETARY_RANGE_MAX: 65535
  }
};
class EquipmentState extends BaseState {
  @observable dataSource = [];
  @observable attributeData = [];
  @observable attributeIndex = 0;
  @observable selectedObjType = "";

  @observable ProductConfigurator = {
    ANALOG_INPUT: {
      OBJECT_NAME: { isEdit: true },
      DEVICE_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["NTC20K", "Hide", "0-10=0-100"]
      },
      UNITS: {
        isEdit: true,
        inputType: "treeSelect",
        inputData: UNITS_DATA,
        mark: true
      },
      NOTIFY_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["Alarm", "Event", "AckNotikication"]
      },
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
      DEVICE_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["NTC20K", "Hide", "0-10=0-100"]
      },
      UNITS: {
        isEdit: true,
        inputType: "treeSelect",
        inputData: UNITS_DATA
      },
      DESCRIPTION: { isEdit: true },
      TIME_DELAY: { isEdit: true },
      COV_INCREMENT: { isEdit: true },
      HIGH_LIMIT: { isEdit: true },
      LOW_LIMIT: { isEdit: true },
      DEADBAND: { isEdit: true },
      OFFSET: { isEdit: true },
      RELINQUISH_DEFAULT: { isEdit: true },
      NOTIFY_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["Alarm", "Event", "AckNotikication"]
      }
    },
    ANALOG_VALUE: {
      isAdd: true,
      HIGH_LIMIT: { isEdit: true },
      LOW_LIMIT: { isEdit: true },
      NOTIFY_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["Alarm", "Event", "AckNotikication"]
      }
    },
    BINARY_INPUT: {
      INACTIVE_TEXT: {
        isEdit: true,
        inputType: "select",
        inputData: [
          "Off",
          "On",
          "Alarm",
          "Normal",
          "Manual",
          "Auto",
          "Open",
          "Close",
          "Summer",
          "Winter",
          "Remote",
          "Local",
          "Start",
          "Stop"
        ]
      },
      ACTIVE_TEXT: {
        isEdit: true,
        inputType: "select",
        inputData: [
          "Off",
          "On",
          "Alarm",
          "Normal",
          "Manual",
          "Auto",
          "Open",
          "Close",
          "Summer",
          "Winter",
          "Remote",
          "Local",
          "Start",
          "Stop"
        ]
      },
      NOTIFY_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["Alarm", "Event", "AckNotikication"]
      },
      ALARM_VALUE: {
        isEdit: true,
        inputType: "select",
        inputData: [0, 1]
      }
    },
    BINARY_OUTPUT: {
      DEVICE_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["0-10=0-100", "NTC10K", "NTC20K", "BI", "Hide"]
      },
      INACTIVE_TEXT: {
        isEdit: true,
        inputType: "select",
        inputData: [
          "Off",
          "On",
          "Alarm",
          "Normal",
          "Manual",
          "Auto",
          "Open",
          "Close",
          "Summer",
          "Winter",
          "Remote",
          "Local",
          "Start",
          "Stop"
        ]
      },
      ACTIVE_TEXT: {
        isEdit: true,
        inputType: "select",
        inputData: [
          "Off",
          "On",
          "Alarm",
          "Normal",
          "Manual",
          "Auto",
          "Open",
          "Close",
          "Summer",
          "Winter",
          "Remote",
          "Local",
          "Start",
          "Stop"
        ]
      },
      NOTIFY_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["Alarm", "Event", "AckNotikication"]
      }
    },
    BINARY_VALUE: {
      isAdd: true,
      DEVICE_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["0-10=0-100", "NTC10K", "NTC20K", "BI", "Hide"]
      },
      INACTIVE_TEXT: {
        isEdit: true,
        inputType: "select",
        inputData: [
          "Off",
          "On",
          "Alarm",
          "Normal",
          "Manual",
          "Auto",
          "Open",
          "Close",
          "Summer",
          "Winter",
          "Remote",
          "Local",
          "Start",
          "Stop"
        ]
      },
      ACTIVE_TEXT: {
        isEdit: true,
        inputType: "select",
        inputData: [
          "Off",
          "On",
          "Alarm",
          "Normal",
          "Manual",
          "Auto",
          "Open",
          "Close",
          "Summer",
          "Winter",
          "Remote",
          "Local",
          "Start",
          "Stop"
        ]
      },
      NOTIFY_TYPE: {
        isEdit: true,
        inputType: "autoComplete",
        inputData: ["Alarm", "Event", "AckNotikication"]
      }
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
    let pattern = /(\d)+:(\d):(\d)+$/;
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

  // 将对象列表转换成treeNode数据结构
  @action getObjListTreeNode(allData) {
    // 类型为8的对象 所有属性
    const device_info_attr = allData.filter(item => item.objPropertyId !== 76);
    // 其他所有对象列表
    const obj_list = allData.filter(item => item.objPropertyId === 76)[0].value;

    // 数组对象去重
    var myOrderedArray = obj_list.reduce(function(accumulator, currentValue) {
      if (
        accumulator.findIndex(
          ele => ele.object_type === currentValue.object_type
        ) === -1
      ) {
        accumulator.push(currentValue);
      }
      return accumulator;
    }, []);
    const recursiveObjList = (data, pId) => {
      return data.map((item, key) => {
        if (item.children) {
          return {
            title: `${item.object_type_text}: ${item.value}`,
            key: `${pId}-${key}`,
            children: recursiveObjList(item.children, `${pId}-${key}`)
          };
        }
        return {
          title: `${item.object_type_text}: ${item.value}`,
          key: `${pId}-${key}`
        };
      });
    };
    const treeData = [
      {
        title: "Device_info",
        key: "0-0",
        children: device_info_attr.map(item => {
          return {
            title: `${item.object_type_text}: ${item.value}`,
            key: `0-0-${item.key}`
          };
        })
      },
      {
        title: "Object_list",
        key: "0-1",
        selectable: false,
        // 分组
        children: myOrderedArray.map((item, key) => {
          return {
            title: `${item.object_type_text}`,
            key: `0-1-${key}`,
            children: recursiveObjList(
              obj_list.filter(ele => ele.object_type === item.object_type),
              `0-1-${key}`
            )
          };
        })
      }
    ];
    return treeData
  }
}

let equipmentState = new EquipmentState();

export default equipmentState;
