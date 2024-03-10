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

  const orgId = query.get("orgId");
  const groupId = params.groupId;

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
    organization_name: "",
    existingOrganizationId: null,
  });

  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [organizationNameError, setOrganizationNameError] = useState("");

  console.log("Register component mounted.");
  console.log("Org ID:", orgId, "Group ID:", groupId);

  useEffect(() => {
    setIsOpen(initialModalOpenState);
    if (orgId) {
      fetch(`/api/invite/orgs/${orgId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setOrganizationDetails(data);
        })
        .catch((error) =>
          console.error("Failed to fetch organization details:", error)
        );
    }

    if (groupId && !orgId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        idea_group_id: groupId,
      }));

      fetch(`/api/idea-groups/${groupId}/`)
        .then((response) => response.json())
        .then((data) => {
          setOrganizationDetails(data.organization);
        })
        .catch((error) =>
          console.error("Failed to fetch IdeaGroup details:", error)
        );
    }

    const checkLoginStatus = () => {
      const token = localStorage.getItem("userToken");
      if (token) {
        setIsLoggedIn(true);
        setUser({ name: "User Name" });
      }
    };
    checkLoginStatus();
  }, [orgId, groupId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "newOrganizationName") {
      if (/\s/.test(value)) {
        setOrganizationNameError("Organization name cannot contain spaces.");
      } else {
        setOrganizationNameError("");
      }

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [organizationOptions, setOrganizationOptions] = useState({
    existingOrganizationId: null,
    newOrganizationName: "",
    joinExisting: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const registrationData = {
      username: formData.user.username,
      email: formData.user.email,
      password: formData.user.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      idea_group_id: formData.idea_group_id,
    };

    if (orgId && organizationDetails) {
      registrationData.organizationId = orgId;
    } else if (!orgId && organizationOptions.newOrganizationName) {
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
        const errorData = await response.json();
        setErrors(errorData);
        console.error("Registration failed:", errorData);
        return;
      }

      const registerData = await response.json();
      console.log("Registration successful:", registerData);
      setIsRegistered(true);
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
        navigate("/login?fromRegister=true");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isRegistered, navigate]);

  if (isRegistered) {
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
            {}
            <input
              type="hidden"
              name="idea_group_id"
              value={formData.idea_group_id}
            />
            {orgId && organizationDetails ? (
              <p>Joining {organizationDetails.name}</p>
            ) : groupId && organizationDetails ? (
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
            {}
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
            {}
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
