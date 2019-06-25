import { observable } from 'mobx'
import { BaseState } from '../modules/appstore'

class MenuState extends BaseState{
    @observable menuList = [{
        'text': 'File',
        'overlay': 'fileMenu',
        'children': [{
          'text': 'New',
          'disabled': true,
          'handle': 'newTabPanelHandle',
          'shortcutKey': 'Ctrl+N'
        }, {
          'text': 'Open',
          'shortcutKey': 'Ctrl+O',
          'handle': 'openHandle'
        }, {
          'text': 'Close',
          'shortcutKey': 'Ctrl+W',
          'handle': 'closeHandle'
        }, '-', {
          'text': 'Save',
          'shortcutKey': 'Ctrl+S',
          'handle': 'saveFileHandle'
        }, {
          'text': 'Save As...',
          'shortcutKey': 'Ctrl+Alt+S',
          'handle': 'saveAsHandle'
        },'-', {
          'text': 'Import...',
          'shortcutKey': 'Ctrl+Alt+I',
          'handle': 'importHandle'
        }, {
          'text': 'Export...',
          'shortcutKey': 'Ctrl+Alt+E',
          'handle': 'exportHandle'
        },'-', {
          'text': 'Exit',
          'shortcutKey': null,
          'handle': 'exitHandle'
        }]
      }, {
        'text': 'Editor',
        'overlay': 'EditorMenu',
        'children': [{
          'text': 'Undo Changes to Selection',
          'handle': 'undoActionHandle',
          'shortcutKey': 'Ctrl+Z'
        },'-', {
          'text': 'Cut Items',
          'handle': 'cutItemHandle',
          'shortcutKey': 'Ctrl+X'
        }, {
          'text': 'Copy Items',
          'handle': 'copyItemHandle',
          'shortcutKey': 'Ctrl+C'
        }, {
          'text': 'Paste Items',
          'handle': 'pasteItemHandle',
          'shortcutKey': 'Ctrl+V'
        },'-', {
          'text': 'Add Items...',
          'handle': 'addItemHandle',
          'shortcutKey': null
        }, {
          'text': 'Delete Items',
          'handle': 'deleteItemHandle',
          'shortcutKey': null
        }, {
          'text': 'Undelete Items',
          'handle': 'undeleteItemHandle',
          'shortcutKey': null
        }, {
          'text': 'Duplicate Items',
          'handle': 'duplicateItemHandle',
          'shortcutKey': null
        },'-', {
          'text': 'Select All',
          'handle': 'selectItemHandle',
          'shortcutKey': null
        }, {
          'text': 'Select Invert',
          'handle': 'selectInvertHandle',
          'shortcutKey': null
        }, {
          'text': 'Select None',
          'handle': 'selectNoneHandle',
          'shortcutKey': null
        }]
      }, {
          'text': 'View',
          'overlay': 'ViewMenu',
          'children': [{
            'text': 'Change/Arrange Columns...',
            'shortcutKey': null,
            'handle': 'changeArrangeHandle',
            'isUse': false
          },'-', {
            'text': 'Filter...',
            'shortcutKey': null,
            'handle': 'filterHandle',
          }, {
            'text': 'Log Files',
            'shortcutKey': null,
            'children': [{
              'text': 'error log',
              'shortcutKey': null,
              'handle': 'errorLogHandle',
            }, {
              'text': 'deBug log',
              'shortcutKey': null,
              'handle': 'deBuglogHandle',
            }, {
              'text': 'Action log',
              'shortcutKey': null,
              'handle': 'actionLogHandle',
            }]
          },'-' ,{
            'text': 'Refresh',
            'shortcutKey': 'F5',
            'handle': 'refreshHandle'
          }]
      }, {
        'text': 'Tools',
        'children': [{
            'text': 'Upload...',
            'shortcutKey': null,
            'handle': 'uploadHandle',
            'isUse': true
          }, {
            'text': 'Download...',
            'shortcutKey': null,
            'handle': 'downloadHandle',
            'isUse': true
          },'-', {
            'text': 'BACnet Discovery Wizard...',
            'shortcutKey': null,
            'handle': 'bacnetDisHandle',
            'isUse': true
        }]
      }, {
        'text': 'Help',
        'overlay': 'HelpMenu',
        'children': [{
          'text': 'Getting Started',
          'handle': 'gettingStartedHandle',
          'shortcutKey': null,
          'isUse': false
        }, {
          'text': 'Controller Help',
          'handle': 'controllerHelpHandle',
          'children': [{
            'text': 'BACnet Client',
            'handle': 'bacnetCliHandle',
            'shortcutKey': null,
          }, {
            'text': 'Generic',
            'handle': 'genericHandle',
            'shortcutKey': null,
          }, {
            'text': 'i1000',
            'handle': 'i1000Handle',
            'shortcutKey': null,
          }],
          'shortcutKey': null,
          'isUse': false
        },'-', {
          'text': 'About',
          'handle': 'aboutHandle',
          'shortcutKey': null,
          'isUse': true
        }]
      }]
}

let menustate = new MenuState()

export default menustate