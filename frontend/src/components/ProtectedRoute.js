import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const params = useParams();

  // Extracting the first path segment to determine the route context
  const firstPathSegment = location.pathname.split("/")[1];
  const isSettingsPage = firstPathSegment === "settings";

  // If it's a settings page and the currentUser's name does not match the :username parameter, redirect to home.
  if (
    isSettingsPage &&
    params.username &&
    currentUser.name !== params.username
  ) {
    console.log("Unauthorized access to settings, redirecting...");
    return <Navigate to="/" replace />;
  }

  // If it's not a settings page, check organizationName match for organization-specific routes
  if (!isSettingsPage && currentUser.organizationName !== firstPathSegment) {
    console.log(
      "Unauthorized access to organization-specific page, redirecting..."
    );
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
