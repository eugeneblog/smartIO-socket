import React from 'react'
import { Menu, Item, Separator, Submenu, MenuProvider, contextMenu } from 'react-contexify'
import { observer, inject } from 'mobx-react'
import 'react-contexify/dist/ReactContexify.min.css'

const onClick = ({ event, props }) => console.log(event,props);
// create your menu first

class RightMenuController extends React.Component {
    constructor() {
        super()
        this.state = {
            
        }
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
                        onClick={onClick} 
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
    e.preventDefault();
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