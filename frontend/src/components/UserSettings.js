import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getCookie } from "./csrftoken";

import Header from "./Header";

function UserSettings() {
  const { currentUser } = useAuth();
  //   console.log(currentUser);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    profilePic: null,
  });

  const [successMessage, setSuccessMessage] = useState({
    email: "",
    password: "",
    profile: "",
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (currentUser?.organizationId) {
      fetchUserData();
      fetchOrganizationMembers(currentUser.organizationId);
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/person/${currentUser.name}/`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchOrganizationMembers = async (organizationId) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/members/`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const { members } = await response.json();
      setMembers(members);
    } catch (error) {
      console.error("Error fetching organization members:", error);
    }
  };

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/person/settings/account/email`, // Ensure the URL is correct.
        {
          method: "POST",
          body: JSON.stringify({ new_email: formData.email }), // Change 'email' to 'new_email'
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      setSuccessMessage((prev) => ({
        ...prev,
        email: "Email updated successfully.",
      }));
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/person/settings/account/password/${currentUser.userId}`,
        {
          method: "POST",
          body: JSON.stringify({ password: formData.password }),
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      // Handle success...
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    if (formData.firstName) submitData.append("firstName", formData.firstName);
    if (formData.lastName) submitData.append("lastName", formData.lastName);
    if (formData.profilePic)
      submitData.append("profilePic", formData.profilePic);

    console.log(
      "Submitting to URL:",
      `/api/person/settings/profile/${currentUser.userId}`
    );
    console.log("Data being sent:", formData);

    for (let [key, value] of submitData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch(
        `/api/person/settings/profile/${currentUser.userId}`,
        {
          method: "POST",
          body: submitData,
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            // Do not set "Content-Type": "application/json" here
          },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      // Handle success...
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="m-8 flex flex-row gap-8">
        <div
          id="members-table"
          className="w-3/4 bg-white shadow-lg rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold mb-4">Organization Members</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={index}>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td>{member.firstName}</td>
                    <td>{member.lastName}</td>
                    <td>{member.role}</td>
                    <td>{member.regDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-1/4 flex flex-col gap-8">
          <div
            id="account-settings"
            className=" bg-white shadow-lg rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <form
              onSubmit={handleSubmitEmail}
              className="grid grid-cols-1 gap-2"
            >
              <label className="form-control">
                <span className="text-gray-700">Email Address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>
              {successMessage.email && (
                <div className="text-green-500">{successMessage.email}</div>
              )}

              <button type="submit" className="btn btn-primary btn-sm">
                Update email
              </button>
            </form>

            <form
              onSubmit={handleSubmitPassword}
              className="grid grid-cols-1 gap-2"
            >
              <label className="block">
                <span className="text-gray-700">Password</span>
                <input
                  type="email"
                  name="email"
                  value={formData.password}
                  onChange={handleChange}
                  className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>

              <button type="submit" className="btn btn-primary btn-sm">
                Update password
              </button>
            </form>
          </div>
          <div
            id="profile-settings"
            className=" bg-white shadow-lg rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">User Settings</h2>
            <form
              onSubmit={handleSubmitProfile}
              className="grid grid-cols-1 gap-6"
            >
              <label className="block">
                <span className="text-gray-700">First Name</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>

              <label className="block">
                <span className="text-gray-700">Last Name</span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </label>

              <label className="block">
                <span className="text-gray-700">Profile Picture</span>
                <input
                  type="file"
                  name="profilePic"
                  onChange={handleChange}
                  className="mt-1 block w-full"
                />
              </label>

              <button type="submit" className="btn btn-primary">
                Update user profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
