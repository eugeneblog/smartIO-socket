import { BaseState } from "../modules/appstore";
import { observable, action } from "mobx";

class ScheduleState extends BaseState {
  @observable scheduleData = [];
  // 周期时间表视图
  @observable weeklyScheduleData = {
    event: []
  };
  @action setEvent(event) {
    this.weeklyScheduleData.event = event;
  }

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

  // 有效周期
  @observable effect = {};
}

let scheduleState = new ScheduleState();
export default scheduleState;
