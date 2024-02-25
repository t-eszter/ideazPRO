// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUser = localStorage.getItem("currentUser");
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userName, orgName, orgId, userId, personId) => {
    const user = {
      name: userName,
      organizationName: orgName,
      organizationId: orgId,
      userId,
      personId,
    };

    console.log("Logging in user with personId:", personId);

    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    return `/${orgName}`;
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("userId");
    setCurrentUser(null);
  };

  const value = { currentUser, login, logout, isLoading };

  return (
    <AuthContext.Provider
      value={{ value, currentUser, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
