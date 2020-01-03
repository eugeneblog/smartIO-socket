import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  withRouter
} from "react-router-dom";
import { HLayout } from "../views/layout/index.layout";
import ChannelPanel from "../views/channel/index.channel";
import NotFoundPage from "../components/404/index.notfound";
import Equipment from "../views/equipment/index.equipment";
import Controller from "../views/controller/index.controller";
import ScheduleView from "../views/schedule/index.schedule";

let routes = [
  {
    path: "/",
    exact: true,
    render: props => {
      return (
        <Redirect
          to={{ pathname: "/equipment", state: { from: props.location } }}
        />
      );
    }
  },
  {
    path: "/controller",
    exact: true,
    sidebar: () => (
      <div>
        <Controller />
      </div>
    )
  },
  {
    path: "/channel",
    exact: true,
    sidebar: props => {
      return (
        <div>
          <ChannelPanel />
        </div>
      );
    }
  },
  {
    path: "/equipment",
    exact: true,
    children: props => <Equipment router={props} />
  },
  {
    path: "/schedule",
    exact: true,
    sidebar: props => <ScheduleView router={props} />
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

class Comp extends React.Component {
  componentDidUpdate(prevProps) {
    // will be true
    const locationChanged = this.props.location !== prevProps.location;
    console.log(locationChanged);
  }
  render() {
    return <div>login</div>;
  }
}

class MainRoute extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      route: routes
    };
  }
  render() {
    return (
      <Router>
        <Route exact path="/login" component={Comp} />
        <HLayout history={this.props.history}>
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
      </Router>
    );
  }
}
// 预留身份验证，待以后开发
const fakeAuth = {
  isLogin: true
};

const ShowTheLocationWithRouter = withRouter(({ history, match, location }) => {
  return fakeAuth.isLogin ? (
    <MainRoute history={{history ,location}} />
  ) : (
    <p>You are not logged in.</p>
  );
});

export default ShowTheLocationWithRouter;
