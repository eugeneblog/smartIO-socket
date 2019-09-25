import { observable } from "mobx";
import { BaseState } from "../modules/appstore";

class EquipmentState extends BaseState {
  @observable takeEquiObj = [];
}

let equipmentState = new EquipmentState();

export default equipmentState;
