import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";

import IdeaGroup from "./IdeaGroup/IdeaGroup";
import Home from "./Home";
import UserSettings from "./UserSettings/UserSettings";
import ProtectedRoute from "./Authentication/ProtectedRoute";
import Register from "./components/Register";
import Login from "./components/Login";

import { AuthProvider } from "./Authentication/AuthContext";

import { Outlet } from "react-router-dom";

const ProtectedIdeaGroup = () => (
  <ProtectedRoute>
    <IdeaGroup />
  </ProtectedRoute>
);

const App = () => {
  useEffect(() => {
    fetch("get-csrf-token/", {
      credentials: "include", // Important for including cookies
    });
  }, []);

  return (
    <HelmetProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
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
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container); // Ensure this is after the DOM content is guaranteed to be loaded.
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}
