import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import { HLayout } from "../views/layout/index.layout";
import Facillty from "../views/facillty/index.facillty.js";
import ChannelPanel from "../views/channel/index.channel";
import NotFoundPage from "../components/404/index.notfound";

const routes = [
  {
    path: "/",
    exact: true,
    render: props => {
      return (
        <Redirect
          to={{ pathname: "/facillty", state: { from: props.location } }}
        />
      );
    }
  },
  {
    path: "/facillty",
    exact: true,
    sidebar: () => (
      <div>
        <Facillty />
      </div>
    )
  },
  {
    path: "/channel",
    exact: true,
    sidebar: () => (
      <div>
        <ChannelPanel />
      </div>
    )
  },
  {
    path: "*",
    exact: true,
    sidebar: () => (
      <div>
        <NotFoundPage />
      </div>
    )
  }
];

function MainRoute() {
  return (
    <Router>
      <div className="App">
        <Switch>
            <Route exact path="/login" component={() => <div>login</div>}/>
            <HLayout>
                <Switch>
                    {routes.map((route, index) => (
                    <Route
                        key={index}
                        {...route}
                        component={route.sidebar ? route.sidebar : route.main}
                    />
                    ))}
                </Switch>
            </HLayout>
        </Switch>
      </div>
    </Router>
  );
}

export default MainRoute;