// App.js
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import IdeaGroup from "./IdeaGroup";

class App extends React.Component {
  render() {
    return (
      <HelmetProvider>
        <DndProvider backend={HTML5Backend}>
          <h1>Ideaz PRO</h1>
          <Router>
            <Routes>
              <Route path="/" element={<IdeaGroup />} />
              <Route path="/:groupSlug" element={<IdeaGroup />} />
            </Routes>
          </Router>
        </DndProvider>
      </HelmetProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
