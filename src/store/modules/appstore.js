import { observable, action  } from 'mobx'

class BaseState {
    @observable language = ''
}

class AppState extends BaseState {
    @observable showView = {
        editor: true
    }
    // 当前活动的视图, 默认是Facility
    @observable actionView = 'Facility'

    // 更改当前活动视图
    @action setActionView = (name) => {
        this.actionView = name
    }
    @action setView = (name, value) => {
        this.showView[name] = value
    }
}

let appstate = new AppState()

export { appstate, BaseState }