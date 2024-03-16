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

  const groupId = useParams().groupId || query.get("groupId");
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
    groupId: groupId,
  });

  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);

  // password validation
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
  });

  const validateAndUpdatePasswordCriteria = (password) => {
    const criteria = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
    };

    setPasswordCriteria(criteria);

    const valid = Object.values(criteria).every(Boolean);
    setIsPasswordValid(valid);
  };

  useEffect(() => {
    const fetchGroupAndOrganizationDetails = async () => {
      try {
        if (groupId) {
          const response = await fetch(`/api/idea-groups/${groupId}/`);
          const data = await response.json();
          setOrganizationDetails(data.organization_details);
          setFormData((prevFormData) => ({
            ...prevFormData,
            existingOrganizationId: data.organization_details?.id || null,
            joinExisting: !!data.organization_details,
          }));
        }
      } catch (error) {
        console.error(
          "Failed to fetch IdeaGroup or organization details:",
          error
        );
      }
    };

    fetchGroupAndOrganizationDetails();
  }, [groupId, orgIdFromQuery]);

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
    const { name, value } = e.target;

    if (name === "username" || name === "email" || name === "password") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user: {
          ...prevFormData.user,
          [name]: value,
        },
      }));
      if (name === "password") {
        validateAndUpdatePasswordCriteria(value);
      }
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
      organization_name: formData.organization_name.trim(),
      existingOrganizationId: formData.existingOrganizationId,
      groupId,
    };

    Object.keys(registrationData).forEach(
      (key) =>
        (registrationData[key] === undefined ||
          registrationData[key] === null) &&
        delete registrationData[key]
    );

    try {
      console.log("Sending registration data:", registrationData);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) throw new Error(await response.text());
      setIsRegistered(true);
      navigate("/login?fromRegister=true");
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ ...errors, form: "Registration failed. Please try again." });
    }
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-2 px-8">
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
      <div className="password-criteria text-xs">
        <p
          style={{
            color: passwordCriteria.minLength ? "green" : "black",
          }}
        >
          At least 8 characters
        </p>
        <p
          style={{
            color: passwordCriteria.hasUpperCase ? "green" : "black",
          }}
        >
          At least one uppercase letter
        </p>
        <p
          style={{
            color: passwordCriteria.hasLowerCase ? "green" : "black",
          }}
        >
          At least one lowercase letter
        </p>
        <p
          style={{
            color: passwordCriteria.hasDigit ? "green" : "black",
          }}
        >
          At least one digit
        </p>
        <p
          style={{
            color: passwordCriteria.hasSpecialChar ? "green" : "black",
          }}
        >
          At least one special character
        </p>
      </div>
      <button type="submit" className="btn btn-sm btn-primary w-full">
        Register
      </button>
    </form>
  );
}

export default Register;
