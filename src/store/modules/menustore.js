import { observable } from 'mobx'
import { BaseState } from '../modules/appstore'

class MenuState extends BaseState{
    @observable menuList = [{
        'text': 'File',
        'overlay': 'fileMenu',
        'children': [{
          'text': 'New',
          'handle': 'newTabPanelHandle',
          'shortcutKey': 'Ctrl+N'
        }, {
          'text': 'Open From',
          'shortcutKey': 'Ctrl+O',
          'children': [{
            'text': 'device...',
            'handle': 'openFromDevice'
          }]
        }, {
          'text': 'Save',
          'shortcutKey': 'Ctrl+S',
          'handle': 'saveFileHandle'
        }, {
          'text': 'Save as...',
          'shortcutKey': 'Ctrl+Alt+S',
          'handle': 'saveAsHandle'
        }]
      }, {
        'text': 'Editor',
        'overlay': 'EditorMenu',
        'children': [{
          'text': 'undo',
          'handle': 'undoActionHandle',
          'shortcutKey': 'Ctrl+Z'
        }, {
          'text': 'redo',
          'handle': 'redoActionHandle',
          'shortcutKey': 'Ctrl+Alt+Z'
        }]
      }, {
          'text': 'View',
          'overlay': 'ViewMenu',
          'children': [{
            'text': 'Outline',
            'shortcutKey': 'Ctrl+Shift+P',
            'handle': 'showOutline',
            'isUse': false
          }, {
            'text': 'Layers',
            'shortcutKey': 'Ctrl+Shift+L',
            'handle': 'showLayers',
            'isUse': false
          }, {
            'text': 'Format Panel',
            'shortcutKey': 'Ctrl+Shift+O',
            'handle': 'showFormat',
            'isUse': false
          }]
      }, {
        'text': 'Help',
        'overlay': 'HelpMenu',
        'children': [{
          'text': 'Download smartgraph Desktop...',
          'handle': 'downloadDesktop',
          'isUse': false
        }, {
          'text': 'About smartgraph...',
          'shortcutKey': '',
          'handle': 'showVersion',
          'isUse': false
        }]
      }]
}

let menustate = new MenuState()

export default menustate