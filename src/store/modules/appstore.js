import { observable, action  } from 'mobx'

class BaseState {
    @observable language = ''
}

class AppState extends BaseState{
    @observable showView = {
        editor: true
    }
    @action setView = (name, value) => {
        this.showView[name] = value
    }
}

let appstate = new AppState()

export { appstate, BaseState }