import React from 'react'

import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom'
import HLayout from '../views/layout/index.layout.js'

class MainRoute extends React.Component {
    render() {
        return(
            <Switch>
                <Route exact path={'/'} render={() => <Redirect to="/home"/>} />
                <Route path={'/home'} component={ HLayout }/>
            </Switch>
        )
    }
}

export default MainRoute