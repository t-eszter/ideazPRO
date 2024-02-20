import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCookie } from "../Authentication/csrftoken";
import Login from "./Login";

function Register({ isOpen, toggleRegister }) {
  const [formData, setFormData] = useState({
    user: {
      username: "",
      email: "",
      password: "",
    },
    firstName: "",
    lastName: "",
    organization_name: "", // Allow for new organization input
    existingOrganizationId: null,
  });

  const [organizationDetails, setOrganizationDetails] = useState(null);
  const { groupId } = useParams();

  useEffect(() => {
    if (groupId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        idea_group_id: groupId,
      }));
    }
    const checkLoginStatus = () => {
      // Example: Check if a user token exists and is valid
      const token = localStorage.getItem("userToken");
      if (token) {
        // Assume the token is valid for this example
        setIsLoggedIn(true);
        // Set user information if available
        setUser({ name: "User Name" }); // Replace with actual user data
      }
    };
    checkLoginStatus();
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetch(`/api/idea-groups/${groupId}/`)
        .then((response) => response.json())
        .then((data) => {
          // Assuming the API returns the organization as part of the IdeaGroup details
          // and that it includes an organization object with at least an id or name when present
          setOrganizationDetails(data.organization);
          // Adjust organization options based on whether an organization is present
          setOrganizationOptions((prev) => ({
            ...prev,
            existingOrganizationId: data.organization
              ? data.organization.id
              : null,
            newOrganizationName: "",
            joinExisting: !!data.organization,
          }));
        })
        .catch((error) =>
          console.error("Failed to fetch IdeaGroup details:", error)
        );
    }
  }, [groupId]);

  const handleChange = (e) => {
    if (e.target.name in formData.user) {
      setFormData({
        ...formData,
        user: { ...formData.user, [e.target.name]: e.target.value },
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const [errors, setErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const [user, setUser] = useState(null);

  const [organizationOptions, setOrganizationOptions] = useState({
    existingOrganizationId: null,
    newOrganizationName: "",
    joinExisting: true, // Default to joining an existing organization
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset error messages before starting

    // Form the payload according to the backend expectations
    const registrationData = {
      username: formData.user.username,
      email: formData.user.email,
      password: formData.user.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      idea_group_id: formData.idea_group_id,
      // Conditionally add the organization name or ID based on user choice
      ...(organizationOptions.joinExisting
        ? { organizationId: formData.existingOrganizationId }
        : { organization_name: organizationOptions.newOrganizationName }),
      idea_group_id: formData.idea_group_id,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData);
        console.error("Registration failed:", errorData);
        return;
      }

      // Handle successful registration
      const registerData = await response.json();
      console.log("Registration successful:", registerData);
      setIsRegistered(true);
      // Optionally, redirect the user or clear the form
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        non_field_errors: [
          "A network or server error occurred. Please try again.",
        ],
      });
    }
  };

  if (!isOpen) return null;

  if (isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
            <button onClick={toggleRegister} className="float-right">
              X
            </button>
            <h2 className="text-center text-2xl mb-4">Welcome, {user.name}</h2>
            <button
              onClick={handleLogout}
              className="w-full p-2 bg-blue-500 text-white"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    // Display the Login component or a success message after registration
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
            <button onClick={toggleRegister} className="float-right">
              X
            </button>
            <h2 className="text-center text-2xl mb-4">
              Registration successful, now you can log in
            </h2>
            <Login />
          </div>
        </div>
      </div>
    );
  }

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
              type="hidden"
              name="idea_group_id"
              value={formData.idea_group_id} // Ensure this is set based on your app's logic
            />

            {organizationDetails ? (
              <div>
                <label>
                  <input
                    type="radio"
                    name="organizationChoice"
                    value="existing"
                    checked={organizationOptions.joinExisting}
                    onChange={() =>
                      setOrganizationOptions((prev) => ({
                        ...prev,
                        joinExisting: true,
                      }))
                    }
                  />
                  Join existing organization: {organizationDetails.name}
                </label>
                <label>
                  <input
                    type="radio"
                    name="organizationChoice"
                    value="new"
                    checked={!organizationOptions.joinExisting}
                    onChange={() =>
                      setOrganizationOptions((prev) => ({
                        ...prev,
                        joinExisting: false,
                      }))
                    }
                  />
                  Create new organization
                </label>
              </div>
            ) : (
              <label>
                Create new organization
                <input
                  type="text"
                  name="newOrganizationName"
                  value={organizationOptions.newOrganizationName}
                  onChange={(e) =>
                    setOrganizationOptions((prev) => ({
                      ...prev,
                      newOrganizationName: e.target.value,
                    }))
                  }
                  placeholder="New Organization Name"
                />
              </label>
            )}
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
