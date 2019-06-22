import { appstate } from './modules/appstore'
import menustate from './modules/menustore'

class Store {
    get getAllStore() {
        return {
            appstate,
            menustate
        }
    }
}
export default Store