import React from 'react'
import { Menu, Item, Separator, Submenu, MenuProvider, contextMenu } from 'react-contexify'
import { observer, inject } from 'mobx-react'
import 'react-contexify/dist/ReactContexify.min.css'

const onClick = function({event, props}, item) {
    this[item.handle](item, event)
}
// create your menu first

class RightMenuController extends React.Component {
    constructor() {
        super()
        this.state = {
        }
    }

    addItemHandle = (self, event) => {
        // console.log(self)
    }

    duplicateHandle = (self, event) => {
        console.log('duplicateHandle')
    }

    cutHandle = (self, event) => {
        console.log('cut')
    }

    copyHandle = (self, event) => {
        console.log(this)
        console.log('copy')
    }

    rnameHandle = (self, event) => {
        console.log('rname')
    }

    emptyHandle = (self, event) => {
        console.log('empty')
    }

}

const menuId = 'thisIsAnId';

@inject(allStore => allStore.appstate) @observer
class MyAwesomeMenu extends RightMenuController {
    render() {
        return (
            <Menu id={menuId}>
                {
                    this.createMenu(this.props.treestate.treeMenuModel)
                }
            </Menu>
        )
    }

    createMenu = (treeMenu) => {
        return treeMenu.map((item, index) => {
            if (item === '-') {
                return (
                    <Separator key={ `div${index}` } />
                )
            }else {
                if (!item.children) {
                    return (
                        <Item 
                        onClick={ ({event, props}) => onClick.bind(this)({event, props}, item) } 
                        key={ item.key }
                        disabled={ item.disabled }
                        >
                        { item.title }
                        </Item>
                    )
                } else {
                    return (
                        <Submenu>
                            {
                                this.createMenu(this.children)
                            }
                        </Submenu>
                    )
                }
            }
        })
    }
}

const handleEvent = (e) => {
    e.preventDefault()
    contextMenu.show({
        id: menuId,
        event: e,
        props: {
            foo: 'bar'
        }
    })
}

class RightMenu extends React.Component {
    render() {
        return(
            <React.Fragment>
                <MenuProvider id="menu_id" onContextMenu={handleEvent} style={{display: 'inline-block' }}>
                    { this.props.title }
                </MenuProvider>
            </React.Fragment>
        )
    }
}

export { RightMenu, MyAwesomeMenu }