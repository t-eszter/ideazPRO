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

  const updateProfilePic = (profilePicUrl) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, profilePic: profilePicUrl };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser); // Update the currentUser state
    }
  };

  const login = (userName, orgName, orgId, userId, personId, profilePic) => {
    const user = {
      name: userName,
      profilePic: profilePic,
      organizationName: orgName,
      organizationId: orgId,
      userId,
      personId,
    };

    console.log(profilePic),
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

  const value = { currentUser, login, logout, isLoading, updateProfilePic };

  return (
    <AuthContext.Provider
      value={{ value, currentUser, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
