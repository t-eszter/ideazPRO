import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth(); // Destructure isLoading from useAuth
  const location = useLocation();
  const params = useParams();

  if (isLoading) {
    return <div>Loading...</div>; // Show loading state while user info is being retrieved
  }

  // Extracting the first path segment to determine the route context
  const firstPathSegment = location.pathname.split("/")[1];
  const isSettingsPage = firstPathSegment === "settings";

  // If it's a settings page and currentUser is not null but the names don't match, redirect
  if (
    isSettingsPage &&
    params.username &&
    currentUser?.name !== params.username // Using optional chaining to safely access name
  ) {
    console.log("Unauthorized access to settings, redirecting...");
    return <Navigate to="/" replace />;
  }

  // If it's not a settings page, check organizationName match for organization-specific routes
  if (
    !isSettingsPage &&
    currentUser &&
    currentUser.organizationName !== firstPathSegment
  ) {
    console.log(
      "Unauthorized access to organization-specific page, redirecting..."
    );
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
