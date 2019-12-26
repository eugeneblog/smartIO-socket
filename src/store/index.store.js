import { appstate } from "./modules/appstore";
import menustate from "./modules/menustore";
import treestate from "./modules/treestore";
import equipmentstate from "./modules/equipment";
import schedulestate from "./modules/schedule"

class Store {
  get getAllStore() {
    return {
      appstate,
      menustate,
      treestate,
      equipmentstate,
      schedulestate
    };
  }
}
export default Store;
