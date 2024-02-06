// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Simulate loading the user from local storage or check session
    const user = localStorage.getItem("userName");
    if (user) {
      setCurrentUser({ name: user });
    }
  }, []);

  const login = (userName) => {
    console.log(currentUser);
    // setAuthState({ ...authState, currentUser: { name: userName } });
    localStorage.setItem("userName", userName);
    setCurrentUser({ name: userName });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setCurrentUser(null); // This will trigger re-render
  };

  const value = {
    currentUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
