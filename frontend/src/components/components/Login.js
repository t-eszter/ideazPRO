import React, { useState, useEffect } from "react";
import { getCookie } from "../Authentication/csrftoken";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { useLocation } from "react-router-dom";

function Login({ isOpenProp, toggleLogin }) {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");

  // Synchronize internal isOpen state with external isOpenProp
  useEffect(() => {
    setIsOpen(isOpenProp);
  }, [isOpenProp]);

  // Automatically open the modal based on query parameters (e.g., ?login=true)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldOpen = searchParams.get("login");

    if (shouldOpen) {
      setIsOpen(true);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  // Inside your Login component
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login request failed");
      }

      const data = await response.json();

      // Check if userId is included in the response
      if (data.organizationName && data.userId !== undefined) {
        // Adjust this line to include userId
        login(
          data.userName,
          data.organizationName,
          data.organizationId,
          data.userId,
          data.personid
        );
        console.log(
          "Login successful for:",
          data.userName,
          data.organizationName,
          data.organizationId,
          data.userId,
          data.personid // Log userId to confirm it's being received and handled
        );
        console.log("Navigating to:", `/${data.organizationName}`);
        navigate(`/${data.organizationName}`); // Navigate to the organization page
        toggleLogin(); // Close the login modal
      } else {
        // Handle case where necessary data is missing
        setLoginError(
          "Login successful, but necessary information is missing."
        );
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError(error.message || "Login failed. Please try again.");
    }
  };

  if (!isOpen) return null;

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
