import { observable, action } from 'mobx'
import { BaseState } from '../modules/appstore'

class TreeState extends BaseState {
    @observable treeMenuModel = [{
        title: "Add Item...",
        name: 'addItem',
        handle: "addItemHandle",
        key: "1",
        disabled: true
    }, {
        title: "Duplicate...",
        name: 'duplicate',
        handle: "duplicateHandle",
        key: "2",
        disabled: true
    },'-', {
        title: "Cut",
        name: 'cut',
        handle: "cutHandle",
        key: "3",
        disabled: true
    }, {
        title: "Copy",
        name: 'copy',
        handle: "copyHandle",
        key: "4",
        disabled: true
    },'-', {
        title: "Rname...",
        name: 'rname',
        handle: "rnameHandle",
        key: "5",
        disabled: true
    }, {
        title: "Empty Recycle Bin",
        name: 'emptyRecycleBin',
        handle: "emptyHandle",
        key: "6",
        disabled: true
    }]
    @observable treeData = [
        {
          title: 'Facillty',
          key: '0-0',
          icon: 'bank',
          menu: {
            copy: true
          },
          children: [
            {
              title: 'GroupName',
              icon: 'branches',
              key: '0-0-0',
              menu: {
                copy: true
              }
            }
          ],
        },
        {
          title: 'System Components',
          key: '0-1',
          icon: 'hdd',
          menu: {
              copy: true
          },
          children: [
            { title: 'Channel', key: '0-1-0-0', icon: 'rocket' },
            { title: 'Controller', key: '0-1-0-1', icon: 'control' },
            { title: 'Printer', key: '0-1-0-2', icon: 'printer' },
            { title: 'Server', key: '0-1-0-3', icon: 'cloud-server' },
            { title: 'Station', key: '0-1-0-4', icon: 'bulb' },
            { title: 'Trend/Group', key: '0-1-0-5', icon: 'usergroup-add' },
          ],
        },
        {
          title: 'Alam Groups',
          key: '0-2',
          icon: 'team',
          menu: {
              copy: true
          }
        },
        {
            title: 'Recycle Bin',
            key: '0-3',
            icon: 'api',
            menu: {
                copy: true
            }
        }
    ]
    
    // 更改tree菜单数据
    @action setTreeMenu = (node) => {
        for (const key in node) {
            this.treeMenuModel.forEach(item => {
                if(typeof(item) === 'object') {
                    if(item.name === key) {
                        item.disabled = false
                    }
                }
            })
        }
    }
}

let treestate = new TreeState()
export default treestate