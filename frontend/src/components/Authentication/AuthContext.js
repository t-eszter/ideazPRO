// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const sessionUser = localStorage.getItem("currentUser");
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
    setIsLoading(false); // Move this outside of any conditions to ensure it's always called
  }, []);

  const login = (userName, orgName, orgId, userId) => {
    const user = {
      name: userName,
      organizationName: orgName,
      organizationId: orgId,
      userId,
    };
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    return `/${orgName}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("userId"); // Remove userId from local storage
    setCurrentUser(null);
  };

  // useEffect(() => {
  //   // Example: Check local storage or fetch session details
  //   const sessionUser = localStorage.getItem("currentUser");
  //   if (sessionUser) {
  //     setCurrentUser(JSON.parse(sessionUser));
  //   }
  //   setIsLoading(false);
  // }, []);

  const value = { currentUser, login, logout, isLoading };

  return (
    <AuthContext.Provider
      value={{ value, currentUser, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
