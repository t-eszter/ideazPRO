import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getCookie } from "../Authentication/csrftoken";
import Login from "./Login";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Register({ toggleRegister }) {
  const query = useQuery();
  const params = useParams();

  // Define orgId and groupId here to use later
  const orgId = query.get("orgId");
  const groupId = params.groupId;

  // Now we can safely use orgId and groupId to determine initialModalOpenState
  const initialModalOpenState = !!orgId || !!groupId;
  const [isOpen, setIsOpen] = useState(initialModalOpenState);

  const navigate = useNavigate();

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

  // Correctly extract orgId and groupId based on the context (query or route parameter)

  console.log("Register component mounted.");
  console.log("Org ID:", orgId, "Group ID:", groupId);

  useEffect(() => {
    setIsOpen(initialModalOpenState);
    // Fetching organization details based on orgId
    if (orgId) {
      fetch(`/api/invite/orgs/${orgId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setOrganizationDetails(data); // Set the organization details here
          // No need to adjust organizationOptions if we're only showing a message
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

    // Initialize the registration payload
    const registrationData = {
      username: formData.user.username,
      email: formData.user.email,
      password: formData.user.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      // The idea_group_id might not be necessary or should be handled separately based on your logic
      idea_group_id: formData.idea_group_id,
    };

    // Conditionally add organization details based on the registration context
    if (orgId && organizationDetails) {
      // If registering through an invite link with orgId, attach the user to this organization
      registrationData.organizationId = orgId; // Ensure backend expects 'organizationId' not 'organization_name'
    } else if (!orgId && organizationOptions.newOrganizationName) {
      // If creating a new organization (i.e., no orgId is present but a new organization name is provided)
      registrationData.organization_name =
        organizationOptions.newOrganizationName;
    }

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
        // Handle errors, such as username already exists
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

  useEffect(() => {
    if (isRegistered) {
      const timer = setTimeout(() => {
        // Redirect to the login page after 4 seconds
        navigate("/login?fromRegister=true"); // Use navigate for redirection in react-router-dom v6+
      }, 4000);

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
    }
  }, [isRegistered, navigate]);

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
              Registration successful, now you can log in.
              <br />
              Redirecting to login...
            </h2>
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
            {orgId && organizationDetails ? (
              // If orgId is present, show joining specific organization without giving an option
              <p>Joining {organizationDetails.name}</p>
            ) : groupId && organizationDetails ? (
              // If groupId is present, allow the user to choose between joining the existing group's organization or creating a new one
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
                {organizationOptions.joinExisting ? null : (
                  <input
                    type="text"
                    name="newOrganizationName"
                    value={organizationOptions.newOrganizationName}
                    onChange={handleChange}
                    placeholder="New Organization Name"
                  />
                )}
              </div>
            ) : (
              // If neither orgId nor groupId is present, provide the option to create a new organization
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
