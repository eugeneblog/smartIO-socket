import { BaseState } from "../modules/appstore";
import { observable, action, computed } from "mobx";

class ScheduleState extends BaseState {
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

  // 当前选择的例外时间表
  @observable selectExecption = '';

  // 计算当前选择的表数据
  @computed get getSeleExecpTabDate() {
    return this.execption[this.selectExecption];
  }

  // 计算例外时间表所有表名
  @computed get execptionTab() {
    return Object.keys(this.execption)
  }
}

let scheduleState = new ScheduleState();
export default scheduleState;
