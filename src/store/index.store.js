import { appstate } from './modules/appstore'
import menustate from './modules/menustore'
import treestate from './modules/treestore'

class Store {
    get getAllStore() {
        return {
            appstate,
            menustate,
            treestate
        }
    }
}
export default Store