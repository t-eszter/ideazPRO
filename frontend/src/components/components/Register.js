import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getCookie } from "../Authentication/csrftoken";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Register({ toggleRegister }) {
  const query = useQuery();
  const params = useParams();
  const navigate = useNavigate();

  const groupId = params.groupId;

  const [isOpen, setIsOpen] = useState(true);
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
    joinExisting: null,
  });

  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetch(`/api/idea-groups/${groupId}/`)
        .then((response) => response.json())
        .then((data) => {
          setOrganizationDetails(data.organization_details);
          if (data.organization_details) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              existingOrganizationId: data.organization_details.id,
              joinExisting: true,
            }));
          } else {
            setFormData((prevFormData) => ({
              ...prevFormData,
              joinExisting: false,
            }));
          }
        })
        .catch((error) =>
          console.error("Failed to fetch IdeaGroup details:", error)
        );
    }
  }, [groupId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "username" || name === "email" || name === "password") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user: {
          ...prevFormData.user,
          [name]: value,
        },
      }));
    } else if (type === "radio") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        joinExisting: value === "true",
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let registrationData = {
      ...formData.user,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    if (formData.joinExisting) {
      registrationData.existingOrganizationId = formData.existingOrganizationId;
    } else {
      registrationData.organization_name = formData.organization_name.trim();
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

      setIsRegistered(true);
      navigate("/login?fromRegister=true");
    } catch (error) {
      console.error("Registration error:", error);
    }
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
            {organizationDetails && (
              <>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="joinExisting"
                      value="true"
                      checked={formData.joinExisting === true}
                      onChange={handleChange}
                    />
                    Join existing organization: {organizationDetails.name}
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="joinExisting"
                      value="false"
                      checked={formData.joinExisting === false}
                      onChange={handleChange}
                    />
                    Create new organization
                  </label>
                </div>
              </>
            )}
            {formData.joinExisting === false && (
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                placeholder="Organization Name"
                className="block w-full p-2 mb-4"
              />
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
              value={formData.user.username}
              onChange={handleChange}
              placeholder="Username"
              className="block w-full p-2 mb-4"
            />
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
