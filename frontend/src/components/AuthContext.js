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
    const orgId = localStorage.getItem("organizationId");
    const userId = localStorage.getItem("userId"); // Retrieve userId from local storage

    if (user && orgName && orgId && userId) {
      // Check if userId is also available
      setCurrentUser({
        name: user,
        organizationName: orgName,
        organizationId: orgId,
        userId, // Set userId in currentUser state
      });
    }
  }, []);

  const login = (userName, orgName, orgId, userId) => {
    console.log("Logging in with userId:", userId);
    localStorage.setItem("userName", userName);
    localStorage.setItem("organizationName", orgName);
    localStorage.setItem("organizationId", orgId);
    localStorage.setItem("userId", userId); // Store userId in local storage

    setCurrentUser({
      name: userName,
      organizationName: orgName,
      organizationId: orgId,
      userId, // Include userId in the currentUser state
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("userId"); // Remove userId from local storage
    setCurrentUser(null);
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Example: Check local storage or fetch session details
    const sessionUser = localStorage.getItem("currentUser");
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
    setIsLoading(false);
  }, []);

  const value = { currentUser, login, logout, isLoading };

  return (
    <AuthContext.Provider
      value={{ value, currentUser, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
