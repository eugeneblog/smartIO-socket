import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import "./index.css";
import Store from "./store/index.store";
import { Provider } from "mobx-react";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const appstate = new Store().getAllStore;
const rootNode = document.getElementById("root");
const render = Component => {
  ReactDOM.render(
    <Provider appstate={appstate}>
      <HashRouter>
        <Component />
      </HashRouter>
    </Provider>,
    rootNode
  );
};
setTimeout(() => {
  render(App);
}, 1000);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
