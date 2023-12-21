import React from "react";
import ReactDOM from "react-dom";

import Home from "./Home";

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>React App</h1>
        <Home />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
