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
  const orgIdFromQuery = query.get("orgId");

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
    existingOrganizationId: orgIdFromQuery || null,
    joinExisting: orgIdFromQuery ? true : null,
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

  useEffect(() => {
    if (orgIdFromQuery) {
      fetch(`/api/invite/orgs/${orgIdFromQuery}`)
        .then((response) => response.json())
        .then((data) => {
          setOrganizationDetails(data);
        })
        .catch((error) =>
          console.error("Failed to fetch organization details:", error)
        );
    }
  }, [orgIdFromQuery]);

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
        <div class="flex flex-row gap-4 w-1/3">
          <div className="bg-white p-5 rounded-lg shadow-lg w-11/12">
            <form onSubmit={handleSubmit} className="space-y-2">
              <h2 className="text-center text-2xl mb-4 ">Register</h2>
              {organizationDetails && (
                <div className="form-control">
                  <label className="cursor-pointer label">
                    <span className="label-text">
                      Join existing organization: {organizationDetails.name}
                    </span>
                    <input
                      type="radio"
                      name="joinExisting"
                      value="true"
                      checked={formData.joinExisting === true}
                      onChange={handleChange}
                      className="radio radio-primary radio-sm"
                    />
                  </label>
                  <label className="cursor-pointer label">
                    <span className="label-text">Create new organization</span>
                    <input
                      type="radio"
                      name="joinExisting"
                      value="false"
                      checked={formData.joinExisting === false}
                      onChange={handleChange}
                      className="radio radio-primary radio-sm"
                    />
                  </label>
                </div>
              )}
              {formData.joinExisting === false && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Organization Name</span>
                  </label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    placeholder="Organization Name"
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              )}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.user.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.user.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.user.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Register
              </button>
            </form>
          </div>
          <button onClick={toggleRegister} className="btn btn-square btn-sm">
            X
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
