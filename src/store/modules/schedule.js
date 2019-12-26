import { BaseState } from "../modules/appstore";
import { observable } from "mobx";

class ScheduleState extends BaseState {
    @observable scheduleData = [];

}

let scheduleState = new ScheduleState();
export default scheduleState;
