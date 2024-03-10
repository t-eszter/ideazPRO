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

  useEffect(() => {
    setIsOpen(isOpenProp);
  }, [isOpenProp]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromRegister = searchParams.get("fromRegister");

    if (fromRegister) {
      setIsOpen(true);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

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

      if (data.organizationName && data.userId !== undefined) {
        login(
          data.userName,
          data.organizationName,
          data.organizationId,
          data.userId,
          data.personid,
          data.profilePic
        );
        console.log(
          "Login successful for:",
          data.userName,
          data.organizationName,
          data.organizationId,
          data.userId,
          data.personid,
          data.profilePic
        );
        console.log("Navigating to:", `/${data.organizationName}`);
        navigate(`/${data.organizationName}`);
        toggleLogin();
      } else {
        setLoginError(
          "Login successful, but necessary information is missing."
        );
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div class="flex flex-row gap-4 w-1/3">
        <div className="bg-white p-5 rounded-lg shadow-lg w-11/12">
          <h2 className="text-center text-2xl mb-4 ">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Username"
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Password"
                className="input input-bordered"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </div>
            {loginError && <div className="text-red-500">{loginError}</div>}
          </form>
        </div>
        <button onClick={toggleLogin} className="btn btn-square btn-sm">
          X
        </button>
      </div>
    </div>
  );
}

export default Login;
