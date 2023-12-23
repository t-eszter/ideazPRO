import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import IdeaGroup from "./IdeaGroup";

class App extends React.Component {
  render() {
    return (
      <HelmetProvider>
        <h1>React app</h1>
        <Router>
          <Routes>
            <Route path="/" element={<IdeaGroup />} />
            <Route path="/:slug/" element={<IdeaGroup />} />
          </Routes>
        </Router>
      </HelmetProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
