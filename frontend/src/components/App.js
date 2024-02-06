// App.js
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import IdeaGroup from "./IdeaGroup";
import Home from "./Home";

import { AuthProvider } from "./AuthContext";

class App extends React.Component {
  render() {
    return (
      <AuthProvider>
        <HelmetProvider>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/:organizationName/:groupSlug"
                  element={<IdeaGroup />}
                />
                <Route path="/:organizationName" element={<IdeaGroup />} />
                <Route path="/guests/:groupId" element={<IdeaGroup />} />
              </Routes>
            </Router>
          </DndProvider>
        </HelmetProvider>
      </AuthProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
