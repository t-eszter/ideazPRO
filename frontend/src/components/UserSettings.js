import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getCookie } from "./csrftoken";

import Header from "./Header";

function UserSettings() {
  const { currentUser } = useAuth(); // Use currentUser directly from AuthContext
  console.log(currentUser);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePic: null,
  });
  const [members, setMembers] = useState([]);

  //   useEffect(() => {
  //     console.log("Current User:", currentUser);
  //   }, [currentUser]);

  // Function to fetch current user's details and organization members
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
    const { name, value } = e.target;
    if (Object.hasOwn(formData, name)) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("handleSubmit triggered");
    console.log("Current User ID:", currentUser.userId);

    // Construct a new FormData object for submission
    const submitData = new FormData();

    // Only append fields that are being updated
    if (formData.firstName) submitData.append("firstName", formData.firstName);
    if (formData.lastName) submitData.append("lastName", formData.lastName);
    if (formData.email) submitData.append("email", formData.email);

    // Handle profile picture as a file
    if (formData.profilePic) {
      submitData.append("profilePic", formData.profilePic);
    }

    try {
      const response = await fetch(`/api/person/update/${currentUser.userId}`, {
        method: "POST", // Use POST for the operation
        body: submitData, // Use submitData which includes only fields to update
        headers: {
          // No need to set "Content-Type": "application/json" for FormData
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include", // Ensure cookies are included with the request
      });
      if (!response.ok) throw new Error("Network response was not ok");
      // Handle success response here, maybe update local state or UI accordingly
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
        <div
          id="user-settings"
          className="w-1/4 bg-white shadow-lg rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">User Settings</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
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
              <span className="text-gray-700">Email Address</span>
              <input
                type="email"
                name="email"
                value={formData.email}
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
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
