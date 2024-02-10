// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("userName");
    const orgName = localStorage.getItem("organizationName");
    const orgId = localStorage.getItem("organizationId"); // Retrieve organization ID
    if (user && orgName && orgId) {
      // Ensure orgId is also considered for currentUser setup
      setCurrentUser({
        name: user,
        organizationName: orgName,
        organizationId: orgId,
      });
    }
  }, []);

  const login = (userName, orgName, orgId) => {
    // Include orgId as a parameter
    localStorage.setItem("userName", userName);
    localStorage.setItem("organizationName", orgName);
    localStorage.setItem("organizationId", orgId); // Store organization ID in local storage
    setCurrentUser({
      name: userName,
      organizationName: orgName,
      organizationId: orgId,
    }); // Update currentUser to include organization ID
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("organizationId"); // Remove organization ID from local storage
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
