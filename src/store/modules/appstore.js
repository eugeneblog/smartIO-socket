import React from "react";
import { observable, action, computed } from "mobx";
import { getChannel } from "../../api/index.api";

class BaseState {
  @observable language = "";
  @observable globalStatus = "ready";
}

class AppState extends BaseState {
  @observable showView = {
    editor: true,
    modalVisible: false,
    modalLoading: false
  };
  @observable modalPaneltriggerName;
  @observable modalComponent = (<div>404 Not Found</div>);
  // 当前活动的视图, 默认是Facility
  @observable actionView = "Facility";

  // 所有type数据
  @observable allType = [];
  @observable allTypeData = [];

  // channel Tab数据
  @observable channelDataSource = {};
  // channel property
  @computed get propertyData() {
    let key = this.selectedChannel;
    let selChannel = this.channelTabData.filter(item => {
      return Number(item.attr.key) === key;
    })[0];
    let config = [];
    let index = 0;
    if (!selChannel) {
      return [];
    }
    let NET_CONFIG = selChannel.NET_CONFIG;
    for (const key in NET_CONFIG) {
      if (NET_CONFIG.hasOwnProperty(key)) {
        const element = NET_CONFIG[key];
        config.push({
          title: key.toLocaleLowerCase(),
          key: (index += 1),
          main: Array.from({ length: Object.keys(element).length }, (v, id) => {
            let value =
              typeof element[Object.keys(element)[id]] !== "object"
                ? element[Object.keys(element)[id]]
                : element[Object.keys(element)[id]]["#text"];
            let type =
              typeof element[Object.keys(element)[id]] === "object"
                ? element[Object.keys(element)[id]]["attr"].type
                : "span";
            return {
              id,
              label: Object.keys(element)[id],
              value,
              type
            };
          })
        });
      }
    }
    return config;
  }
  @computed get channelTabData() {
    if (this.channelDataSource.ROOT) {
      let data = this.channelDataSource.ROOT.CHANNEL;
      if (data.length) {
        let config = data.map(item => {
          return {
            ...item
          };
        });
        return config;
      } else {
        return [
          {
            ...data
          }
        ];
      }
    } else {
      return [];
    }
  }
  // 被选择的channel
  @observable selectedChannel = "";
  @observable selectedChannelData;

  // 网络配置
  @observable netConfig = [];
  @observable net = [];

  // equipment存放udp消息
  @observable equipmentData = [];
  @observable equipmentTableData = [];

  // 网络号
  @observable NetProgress = [];

  // 设置当前通道配置
  @action setSelectedChannel() {
    // 获取所有通道, 默认为通道1
    return getChannel().then(result => {
      let data = result["data"].data;
      const CHANNEL = data.ROOT.CHANNEL
      this.selectedChannel = CHANNEL[0]['ITEM_NAME']
      this.selectedChannelData = CHANNEL[0]
      return this.selectedChannelData
    });
  }

  // 过滤网络号
  @action filterNetProgress() {
    let newNetProg = this.NetProgress;
    return newNetProg;
  }

  @computed get allEquimpent() {
    let newData = this.equipmentData.map(item => {
      return item;
    });
    return newData;
  }

  // 根据选择的配置更改channel tab数据
  @action setNetProperty = (sel, data) => {
    let key = this.selectedChannel;
    // 设置ip和mac地址
    this.channelTabData.forEach(item => {
      if (Number(item.attr.key) === key) {
        let netConfig = item.NET_CONFIG;
        netConfig.MAIN.IP = data.address;
        netConfig.MAIN.MAC = data.mac;
      }
    });
  };

  // 更改当前活动视图
  @action setActionView = (name, value) => {
    this[name] = value;
  };
  @action setView = (name, value) => {
    this.showView[name] = value;
  };

  // 更新当前channel数据： 就是重新获取一遍，然后写入
  @action updateData = function(id, data) {
    if (id) {
      console.log(arguments);
    }
    getChannel().then(result => {
      let data = result["data"].data;
      this.channelDataSource = data;
    });
  };
  // 更改modal内部组件
  @action setModalComponent = com => {
    this.modalComponent = com;
  };
}

let appstate = new AppState();

export { appstate, BaseState };
