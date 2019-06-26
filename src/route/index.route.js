import React from 'react'

import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom'
import HLayout from '../views/layout/index.layout.js'
import NotFoundPage from '../components/404/index.notfound'
import TablePane from '../components/Table/index.table'

const Facillty = () => {
    return (
        <HLayout>
            <TablePane/>
        </HLayout>
    )
}

class MainRoute extends React.Component {
    render() {
        return(
            <Switch>
                <Route exact path={'/'} render={() => <Redirect to="/home"/>} />
                <Route path={'/home'} component={ HLayout }/>
                <Route path={'/facillty'} component={ Facillty }/>
                <Route component={NotFoundPage} />
            </Switch>
        )
    }
}

export default MainRoute