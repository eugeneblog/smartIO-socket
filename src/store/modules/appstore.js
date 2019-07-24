import React from 'react'
import { observable, action  } from 'mobx'

class BaseState {
    @observable language = ''
}

class AppState extends BaseState {
    @observable showView = {
        editor: true,
        modalVisible: false,
        modalLoading: false
    }
    @observable modalPaneltriggerName
    @observable modalComponent = <div>404 Not Found</div>
    // 当前活动的视图, 默认是Facility
    @observable actionView = 'Facility'

    // 所有type数据
    @observable allType = []
    @observable allTypeData = []

    // channel Tab数据
    @observable channelTabData = []

    // 网络配置
    @observable netConfig = []
    @observable net = []

    // 更改当前活动视图
    @action setActionView = (name, value) => {
        this[name] = value
    }
    @action setView = (name, value) => {
        this.showView[name] = value
    }
    // 更改modal内部组件
    @action setModalComponent = (com) => {
        this.modalComponent = com
    }
}


let appstate = new AppState()

export { appstate, BaseState }