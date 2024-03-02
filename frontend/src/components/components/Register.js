import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getCookie } from "../Authentication/csrftoken";
import Login from "./Login";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
  const [organizationNameError, setOrganizationNameError] = useState("");

  const query = useQuery();
  const params = useParams();

  // Correctly extract orgId and groupId based on the context (query or route parameter)
  const orgId = query.get("orgId"); // Attempt to get orgId from query parameters
  const groupId = params.groupId || query.get("groupId");

  console.log("Register component mounted.");
  console.log("Org ID:", orgId, "Group ID:", groupId);

  useEffect(() => {
    // Fetching organization details based on orgId
    if (orgId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        existingOrganizationId: orgId,
      }));
      fetch(`/api/invite/orgs/${orgId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .catch((error) =>
          console.error("Failed to fetch organization details:", error)
        );
    }

    // Fetching group details based on groupId
    if (groupId && !orgId) {
      // Ensure that orgId takes precedence if both are provided
      setFormData((prevFormData) => ({
        ...prevFormData,
        idea_group_id: groupId,
      }));

      fetch(`/api/idea-groups/${groupId}/`)
        .then((response) => response.json())
        .then((data) => {
          setOrganizationDetails(data.organization);
          // Additional logic here for setting organization options based on the fetched data
        })
        .catch((error) =>
          console.error("Failed to fetch IdeaGroup details:", error)
        );
    }

    // Check login status could be included here or in a separate useEffect based on your preference
    const checkLoginStatus = () => {
      const token = localStorage.getItem("userToken");
      if (token) {
        setIsLoggedIn(true);
        setUser({ name: "User Name" }); // Mocked user information
      }
    };
    checkLoginStatus();
  }, [orgId, groupId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "newOrganizationName") {
      // Check if the value contains spaces
      if (/\s/.test(value)) {
        setOrganizationNameError("Organization name cannot contain spaces.");
      } else {
        setOrganizationNameError(""); // Clear error message if corrected
      }

      // Update organization name regardless of error to allow correction
      setOrganizationOptions((prev) => ({
        ...prev,
        newOrganizationName: value,
      }));
    } else if (name in formData.user) {
      setFormData({
        ...formData,
        user: { ...formData.user, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
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
        if (errorData.message && errorData.message.includes("already exists")) {
          // Update the errors state to reflect the username error
          setErrors((prevErrors) => ({
            ...prevErrors,
            username: "Username already exists.",
          }));
        } else {
          setErrors(errorData);
        }
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

            {/* Idea Group ID - Hidden Input */}
            <input
              type="hidden"
              name="idea_group_id"
              value={formData.idea_group_id}
            />

            {/* Organization Choices */}
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
                {organizationNameError && (
                  <div className="text-red-500">{organizationNameError}</div>
                )}
              </div>
            ) : (
              <div>
                <label>
                  Create new organization
                  <input
                    type="text"
                    name="newOrganizationName"
                    value={organizationOptions.newOrganizationName}
                    onChange={handleChange}
                    placeholder="New Organization Name"
                  />
                </label>
                {organizationNameError && (
                  <div className="text-red-500">{organizationNameError}</div>
                )}
              </div>
            )}

            {/* User Information Inputs */}
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              placeholder="First Name"
              onChange={handleChange}
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
              value={formData.user.username}
              onChange={handleChange}
              placeholder="Username"
              className="block w-full p-2 mb-4"
            />
            {errors.username && (
              <div className="text-red-500">{errors.username}</div>
            )}
            <input
              type="email"
              name="email"
              value={formData.user.email}
              onChange={handleChange}
              placeholder="Email"
              className="block w-full p-2 mb-4"
            />
            <input
              type="password"
              name="password"
              value={formData.user.password}
              onChange={handleChange}
              placeholder="Password"
              className="block w-full p-2 mb-4"
            />

            {/* Submit Button */}
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
