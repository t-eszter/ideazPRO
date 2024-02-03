import React, { useState } from "react";
import CSRFToken, { getCookie } from "./csrftoken";

function Register({ isOpen, toggleRegister }) {
  const [formData, setFormData] = useState({
    organization_name: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({}); // Reset error messages

    fetch("/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include the CSRF token in the request headers
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify(formData),
    })
      .then((response) =>
        response.json().then((data) => ({
          status: response.status,
          body: data,
        }))
      )
      .then(({ status, body }) => {
        if (status >= 400 && status < 600) {
          // Use setErrors to update the state with the backend validation errors
          setErrors(body);
          console.error("Registration failed:", body);
        } else {
          console.log("Registration successful:", body);
          // Optionally clear the form and errors
          setFormData({
            organization_name: "",
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
          });
          setErrors({});
        }
      })
      .catch((error) => {
        console.error("Network or other error:", error);
        // Use setErrors to update the state for network or unexpected errors
        setErrors({
          non_field_errors: [
            "A network or server error occurred. Please try again.",
          ],
        });
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="flex justify-center items-center h-full">
        <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
          <button onClick={toggleRegister} className="float-right">
            X
          </button>
          <form onSubmit={handleSubmit}>
            <h2 className="text-center text-2xl mb-4">Register</h2>

            <input
              type="text"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleChange}
              placeholder="Group or Organization"
              className="block w-full p-2 mb-4"
            />
            {errors.organization_name && (
              <div className="text-red-500">
                {errors.organization_name.join(" ")}
              </div>
            )}
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="block w-full p-2 mb-4"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="block w-full p-2 mb-4"
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="block w-full p-2 mb-4"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="block w-full p-2 mb-4"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="block w-full p-2 mb-4"
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
