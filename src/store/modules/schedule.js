import {BaseState} from "../modules/appstore";
import moment from "moment";
import {action, computed, observable} from "mobx";
import {readDataBaseField} from "../../api/index.api";

class ScheduleState extends BaseState {
  @observable isEdit = true;
  // 当前读取的设备
  @observable selectDevice = '';
  @observable scheduleData = [];
  // 周期时间表视图
  @observable weeklyScheduleData = {
    event: []
  };
  
  @action setEvent(event) {
    this.weeklyScheduleData.event = event;
  }
  
  // 有效周期
  @observable effectPeriod = [];
  
  // 应用有效周期到设备
  @action applidEffectPeriodToDevice = () => {
    const startDate = this.effectPeriod[0].split("-");
    const endDate = this.effectPeriod[1].split("-");
    const startYear = startDate[0];
    const startMonth = startDate[1];
    const startDay = startDate[2];
    const endYear = endDate[0];
    const endMonth = endDate[1];
    const endDay = endDate[2];
    return {
      startYear,
      startMonth,
      startDay,
      endYear,
      endMonth,
      endDay
    };
  };
  
  // 绑定的对象
  @observable bindObjects = [];
  
  // 事件值的输入关口，控制事件的值域
  @computed get inputCensorship() {
    if (!this.bindObjects.length) {
      // 没有绑定的对象不允许编辑
      return null;
    }
    const objType = this.bindObjects[0].objectType;
    const objTypeEnum = {
      "1": "float",
      "2": "float",
      "4": "int",
      "5": "int"
    };
    return objTypeEnum[objType]
  }
  
  // 从数据库读取对象名称
  @action
  async fetchObjName() {
    if (!this.bindObjects.length) {
      console.log('fuck you')
    }
    
    const bindObjs = this.bindObjects.map(item => {
      const device = this.selectDevice;
      const objType = item.objectType;
      const objInstance = item.objectInstance;
      return readDataBaseField({
        key: `${device}:${objType}:${objInstance}`,
        subKey: "OBJECT_NAME"
      });
    });
    
    try {
      const results = await Promise.all(bindObjs);
      this.bindObjects = results.map((e, i) => {
        return {
          ...this.bindObjects[i],
          objectName: e.data.value
        }
      })
    } catch (e) {
      console.log(e)
    }
  };
  
  @action setBindObject = (newArr) => {
    this.bindObjects = newArr
  };
  
  // 周期时间表基本信息
  @observable infoSchedule = {
    propertyid: 105,
    data: {
      OBJECT_NAME: "",
      PRIORITY_FOR_WRITING: "",
      PRESENT_VALUE: "",
      SCHEDULE_DEFAULT: "",
      DESCRIPTION: ""
    }
  };
  // 默认值类型
  @observable defaultType = "0";
  
  // 例外时间表
  @observable execption = {};
  
  // 计算例外时间表时间点
  @computed get execptionEvent() {
    const event = [];
    
    // 没有数据直接return
	  console.log(this.execption[this.selectExecption].segment2);
    if (!this.execption[this.selectExecption].segment2.length) {
      return []
    }
    
    // 判断是否是原始数据，原始数据需要计算，否则直接返回
    if (this.execption[this.selectExecption].segment2[0].primaryKey) {
      return this.execption[this.selectExecption].segment2;
    }
    
    // 将一维数组转二维数组
    this.execption[this.selectExecption].segment2
      .reduce(
        (a, c, i, s) => {
          if ((i + 1) % 2) {
            return a.concat([[c]])
          }
          a[Math.floor(i / 2)].push(c);
          return a
        },
        []
      ) // 处理成视图可以使用的数据
      .forEach((item, index, source) => {
        const isStart = !!((index + 1) % 2);
        if (isStart) {
          const [time, action] = item;
          const now = new Date();
          const primaryKey = `${now.getTime() * Math.random()}`;
          const end = source[index + 1] ?
            moment(source[index + 1][0].val, 'h:m:s').toDate() :
            moment("24:00:00", "hh:mm:ss").toDate();
          
          event.push({
            id: primaryKey,
            primaryKey,
            title: 'test',
            type: 'boolean',
            value: action ? action.val : 'null',
            start: moment(time.val, 'h:m:s').toDate(),
            end,
            backgroundColor: "#e0edf9",
            textColor: "#5392da",
            description: "This is a cool event"
          })
        }
      });
    return event;
  }
  
  // 应用到设备, 后续需要将api迁移到这
  @action applidToDevice() {
    const event = [];
    this.execptionEvent.forEach(item => {
      const tuple = [{
        tag: 11,
        val: `${item.start.getHours()}:${item.start.getMinutes()}:${item.start.getSeconds()}`
      }, {
        tag: 9,
        val: item.value
      }, {
        tag: 11,
        val: `${item.end.getHours()}:${item.end.getMinutes()}:${item.end.getSeconds()}`
      }, {
        tag: 9,
        val: item.value
      }];
      event.push(...tuple)
    });
    const result = {
      ...this.execption
    };
    
    result[this.selectExecption].segment2 = event;
    
    return result;
  }
  
  // 逆向衍生
  set execptionEvent(events) {
    this.execption[this.selectExecption].segment2 = events;
  }
  
  // 新增例外时间表
  @action createExecption() {
    const newTable = {
      segment1: [{tag: 10, val: "2020-1-1(255)"}, {tag: 10, val: "2020-3-2(0)"}],
      segment2: [],
      segment3: [{tag: 2, val: 5}]
    };
    const count = Object.keys(this.execption).length;
    this.execption[`table${count + 1}`] = newTable;
    this.selectExecption = `table${count + 1}`;
  }
  
  // 当前选择的例外时间表
  @observable selectExecption = 'table1';
  
  // 计算当前选择的表数据
  @computed get getSeleExecpTabDate() {
    return this.execption[this.selectExecption];
  }
  
  // 更改例外时间表时间
  @action setExecptioDate(date) {
    this.execption[this.selectExecption].segment1 = date;
    console.log(this.execption[this.selectExecption].segment1)
  }
  
  // 计算例外时间表所有表名
  @computed get execptionTab() {
    return Object.keys(this.execption)
  }
}

let scheduleState = new ScheduleState();
export default scheduleState;
