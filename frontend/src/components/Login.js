import React, { useState } from "react";
import { getCookie } from "./csrftoken";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Login({ isOpen, toggleLogin }) {
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Now, check if the modal should be open and return early if not.
  // This check comes after all hooks have been called.
  if (!isOpen) return null;

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login request failed");
      }

      const data = await response.json();
      login(data.userName); // Adjust according to your backend response
      console.log(data.userName);
      navigate(`/${data.organizationName}/`);
      toggleLogin();
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError(error.message || "Login failed. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Username"
            className="input" // Apply your input styling here
          />
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Password"
            className="input" // Apply your input styling here
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={toggleLogin} className="button">
              Cancel
            </button>
            <button type="submit" className="button">
              Login
            </button>
          </div>
          {loginError && <div className="text-red-500">{loginError}</div>}
        </form>
      </div>
    </div>
  );
}

export default Login;
