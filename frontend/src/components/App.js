import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";

import IdeaGroup from "./IdeaGroup/IdeaGroup";
import Home from "./Home";
import UserSettings from "./UserSettings/UserSettings";
import ProtectedRoute from "./Authentication/ProtectedRoute";
import Modal from "./components/Modal";
import Authentication from "./Authentication/Authentication";

import { AuthProvider } from "./Authentication/AuthContext";

import { Outlet } from "react-router-dom";

const ProtectedIdeaGroup = () => (
  <ProtectedRoute>
    <IdeaGroup />
  </ProtectedRoute>
);

const ModalRouteHandler = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const isAuthRoute =
      location.pathname.includes("/login") ||
      location.pathname.includes("/register");
    setIsModalOpen(isAuthRoute);
  }, [location.pathname]);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={handleClose}>
      <Authentication />
    </Modal>
  );
};

const App = () => {
  useEffect(() => {
    fetch("get-csrf-token/", {
      credentials: "include",
    });
  }, []);

  return (
    <HelmetProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<div />} />
            <Route path="/login" element={<div />} />
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
              element={<ProtectedIdeaGroup />}
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
          <ModalRouteHandler />
        </Router>
      </DndProvider>
    </HelmetProvider>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

//Last commit for Finals
