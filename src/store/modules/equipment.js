import { observable, computed } from "mobx";
import { BaseState } from "../modules/appstore";

class EquipmentState extends BaseState {
  @observable takeEquiObj = [];
  @observable propertyDataSour = undefined;

  @computed get getPropertyData(){
    let data = []
    if (this.propertyDataSour) {
      data = this.propertyDataSour.property_data.map((item, index) => {
        return {
          key: index,
          objProperty: item['objPropertyText'],
          value: 'null'
        }
      })
    }
    return data
  }
}

let equipmentState = new EquipmentState();

export default equipmentState;
