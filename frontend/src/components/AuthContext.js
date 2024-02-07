// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("userName");
    const orgName = localStorage.getItem("organizationName"); // Retrieve organization name
    if (user && orgName) {
      setCurrentUser({ name: user, organizationName: orgName });
    }
  }, []);

  const login = (userName, orgName) => {
    localStorage.setItem("userName", userName);
    localStorage.setItem("organizationName", orgName);
    setCurrentUser({ name: userName, organizationName: orgName }); // Ensure this correctly updates the context
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    setCurrentUser(null);
    setOrganizationName("");
  };

  const value = {
    currentUser,
    organizationName,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
