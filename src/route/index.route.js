import React from 'react'

import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom'
import NotFoundPage from '../components/404/index.notfound'
import Facillty from '../views/facillty/index.facillty.js'
import ChannelPanel from "../views/channel/index.channel"

class MainRoute extends React.Component {
    render() {
        return(
            <Switch>
                <Route path={'/'} exact render={() => <Redirect to="/index"/>} />
                <Route path={'/index'} exact render={() => <Redirect to="/index/facillty"/>}/>
                <Route path={'/index/facillty'} exact component={Facillty}/>
                <Route path={'/index/channel'} exact component={ ChannelPanel }/>
                <Route component={NotFoundPage} exact />
            </Switch>
        )
    }
}

export default MainRoute