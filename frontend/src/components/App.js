// App.js
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";

import IdeaGroup from "./IdeaGroup";
import Home from "./Home";
import UserSettings from "./UserSettings";
import ProtectedRoute from "./ProtectedRoute"; // Import the modified ProtectedRoute

import { AuthProvider } from "./AuthContext";

import { Outlet } from "react-router-dom";

const ProtectedIdeaGroup = () => (
  <ProtectedRoute>
    <IdeaGroup />
  </ProtectedRoute>
);

class App extends React.Component {
  render() {
    return (
      <HelmetProvider>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/settings/:username"
                element={
                  <ProtectedRoute>
                    <UserSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:organizationName/:groupSlug"
                element={<ProtectedIdeaGroup />} // Protected route
              />
              <Route
                path="/:organizationName"
                element={
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route index element={<IdeaGroup />} />{" "}
                {/* Nested route, protected */}
              </Route>
              <Route path="/guests/:groupId" element={<IdeaGroup />} />{" "}
              {/* Accessible to anyone */}
            </Routes>
          </Router>
        </DndProvider>
      </HelmetProvider>
    );
  }
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// ReactDOM.render(
//   <React.StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>,
//   document.getElementById("root")
// );
