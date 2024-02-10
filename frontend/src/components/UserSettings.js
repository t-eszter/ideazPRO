import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getCookie } from "./csrftoken";

import Header from "./Header";

function UserSettings() {
  const { username } = useParams(); // If you're using dynamic routing to get the username
  const { updateProfile, getOrganizationMembers } = useAuth(); // Assuming these functions are implemented in your AuthContext
  const [currentUser, setCurrentUser] = useState(null);
  const organizationId = localStorage.getItem("organizationId");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePic: null,
  });

  useEffect(() => {
    console.log("Auth Context useEffect running");
    const user = localStorage.getItem("userName");
    const orgName = localStorage.getItem("organizationName");
    const orgId = localStorage.getItem("organizationId");
    console.log("Retrieved from localStorage:", { user, orgName, orgId });
    if (user && orgName && orgId) {
      setCurrentUser({
        name: user,
        organizationName: orgName,
        organizationId: orgId,
      });
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.organizationId) {
      loadOrganizationMembers(currentUser.organizationId);
    }
  }, [currentUser]);

  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Load user data and organization members on component mount
    // console.log(currentUser);
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        profilePic: currentUser.profilePic || null,
      });

      loadOrganizationMembers();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Retrieve CSRF token from cookies
    const csrfToken = getCookie("csrftoken");

    const formData = new FormData();
    formData.append("firstName", formData.firstName);
    formData.append("lastName", formData.lastName);
    formData.append("email", formData.email);
    // For files, ensure you're handling them correctly on the backend
    if (formData.profilePic) {
      formData.append(
        "profilePic",
        formData.profilePic,
        formData.profilePic.name
      );
    }

    try {
      const response = await fetch(`/api/person/update/${userId}`, {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": csrfToken,
        },
        credentials: "include", // Necessary for cookies to be sent with the request
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Handle successful profile update here
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const loadOrganizationMembers = async (organizationId) => {
    try {
      // Ensure the URL matches your Django project's URL structure
      console.log(organizationId);
      const response = await fetch(
        `/api/organizations/${organizationId}/members/`,
        {
          method: "GET", // A GET request to fetch data
          headers: {
            Accept: "application/json", // Expecting JSON response
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setMembers(data.members); // Update state with the fetched members
    } catch (error) {
      console.error("Error fetching organization members:", error);
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
