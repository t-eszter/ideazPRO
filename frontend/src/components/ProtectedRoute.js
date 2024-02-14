import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ element: Component }) => {
  const { currentUser } = useAuth();
  const { organizationName } = useParams();

  // Check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user belongs to the organization
  if (currentUser.organization !== organizationName) {
    return <Navigate to="/" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
