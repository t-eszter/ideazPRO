import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Login from "../components/Login";
import Register from "../components/Register";

function Authentication() {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  // React to URL parameters or other indicators of registration status
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const justRegistered = query.get("justRegistered");
    if (justRegistered) {
      setShowLogin(true);
    }
  }, [location]);

  const switchToLogin = () => setShowLogin(true);
  const switchToRegister = () => setShowLogin(false);

  return (
    <div>
      {showLogin ? (
        <Login switchToRegister={switchToRegister} />
      ) : (
        <Register switchToLogin={switchToLogin} />
      )}
    </div>
  );
}

export default Authentication;
