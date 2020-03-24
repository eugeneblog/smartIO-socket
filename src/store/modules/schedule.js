import {BaseState} from "../modules/appstore";
import moment from "moment";
import {observable, action, computed} from "mobx";

class ScheduleState extends BaseState {
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
  
  // 绑定的对象
  @observable bindObjects = [];
  
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
  @computed get getExecptionTimes() {
    const event = [];
    
    // 没有数据直接return
    if (!this.execption[this.selectExecption].segment2.length) {
      return []
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
          const primaryKey = `${now.getTime()}`;
          const end = source[index + 1] ?
            moment(source[index + 1][0].val, 'h:m:s').toDate() :
            moment("24:00:00", "hh:mm:ss").toDate();
          
          event.push({
            id: primaryKey,
            primaryKey,
            title: 'test',
            type: 'boolean',
            value: action.val,
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
  
  // 更改例外事件表时间点
  @action setExecptionTimes = (times) => {
    this.execption[this.selectExecption].segment2 = []
  };
  
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
