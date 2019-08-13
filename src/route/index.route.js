import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  withRouter
} from "react-router-dom";
import { HLayout } from "../views/layout/index.layout";
import Facillty from "../views/facillty/index.facillty.js";
import ChannelPanel from "../views/channel/index.channel";
import NotFoundPage from "../components/404/index.notfound";
import Equipment from "../views/equipment/index.equipment";

let routes = [
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
    path: "/equipment",
    exact: true,
    sidebar: () => (
      <div>
        <Equipment />
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

class MainRoute extends React.Component {
  constructor() {
    super();
    this.state = {
      route: routes
    };
  }
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/login" component={() => <div>login</div>} />
            <HLayout>
              <Switch>
                {this.state.route.map((route, index) => (
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
}
// 预留身份验证，待以后开发
const fakeAuth = {
  isLogin: true
};

const ShowTheLocationWithRouter = withRouter(({ history }) => {
  return fakeAuth.isLogin ? <MainRoute /> : <p>You are not logged in.</p>;
});

export default ShowTheLocationWithRouter;
