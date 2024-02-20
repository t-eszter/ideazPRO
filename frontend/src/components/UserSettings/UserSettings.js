import React, { useState, useEffect } from "react";
import { useAuth } from "../Authentication/AuthContext";
import { getCookie } from "../Authentication/csrftoken";
import NewIdeaGroupForm from "./NewIdeaGroupForm";
import IdeaGroupEditModal from "./IdeaGroupEditModal";

import Header from "../components/Header";

function UserSettings() {
  const { currentUser } = useAuth();
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  //   console.log(currentUser);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    profilePic: null,
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState({
    email: "",
    password: "",
    profile: "",
    invite: "",
  });

  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ideaGroups, setIdeaGroups] = useState([]);

  //Search and pagination of tables
  const [searchQueryIdeaGroups, setSearchQueryIdeaGroups] = useState("");
  const [currentPageIdeaGroups, setCurrentPageIdeaGroups] = useState(1);
  const [ideaGroupsPerPage] = useState(5); // Adjust as needed

  const [searchQueryMembers, setSearchQueryMembers] = useState("");
  const [currentPageMembers, setCurrentPageMembers] = useState(1);
  const [membersPerPage] = useState(5); // Adjust as needed

  const [selectedIdeaGroup, setSelectedIdeaGroup] = useState(null);

  const indexOfLastIdeaGroup = currentPageIdeaGroups * ideaGroupsPerPage;
  const indexOfFirstIdeaGroup = indexOfLastIdeaGroup - ideaGroupsPerPage;
  const currentIdeaGroups = ideaGroups
    .filter((group) =>
      group.name.toLowerCase().includes(searchQueryIdeaGroups.toLowerCase())
    )
    .slice(indexOfFirstIdeaGroup, indexOfLastIdeaGroup);

  const indexOfLastMember = currentPageMembers * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members
    .filter((member) =>
      member.username.toLowerCase().includes(searchQueryMembers.toLowerCase())
    )
    .slice(indexOfFirstMember, indexOfLastMember);

  //

  useEffect(() => {
    if (currentUser?.organizationId) {
      fetchUserData();
      fetchOrganizationMembers(currentUser.organizationId);
      // Assuming `isAdmin` is a property of `currentUser`, adjust based on your actual data structure
      setIsAdmin(currentUser.isAdmin);
    }
  }, [currentUser]);

  const sendInvite = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/organizations/${currentUser.organizationId}/invite`,
        {
          method: "POST",
          body: JSON.stringify({ email: inviteEmail }),
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
        invite: "Invitation sent successfully.",
      }));
      setInviteEmail(""); // Reset the invite email input after successful send
    } catch (error) {
      console.error("Error sending invite:", error);
    }
  };

  const fetchIdeaGroups = async () => {
    // Ensure currentUser and its properties are defined before making the API call
    if (currentUser?.organizationName) {
      // Encode the organizationName to ensure the URL is correctly formatted
      const organizationNameEncoded = encodeURIComponent(
        currentUser.organizationName
      );
      const url = `/api/organizations/${organizationNameEncoded}/ideagroups`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch idea groups");
        }
        const data = await response.json();
        setIdeaGroups(data);
      } catch (error) {
        console.error("Error fetching idea groups:", error);
      }
    }
  };

  useEffect(() => {
    fetchIdeaGroups();
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
      setIsAdmin(data.role === "admin");
      console.log(data.role);
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

  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const handleEditGroup = (group) => {
    setSelectedIdeaGroup(group);
    setShowEditGroupModal(true);
  };

  return (
    <div>
      <Header />
      <div className="m-8 flex flex-row gap-8">
        {isAdmin && (
          <div id="left-side" className="w-3/4 flex flex-col gap-8">
            <div
              id="ideaGroups-table"
              className=" bg-white shadow-lg rounded-lg p-6 flex flex-col"
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold mb-4">Idea Groups</h3>
                <input
                  type="text"
                  placeholder="Search Idea Groups..."
                  value={searchQueryIdeaGroups}
                  onChange={(e) => setSearchQueryIdeaGroups(e.target.value)}
                  className="input input-sm input-bordered w-full max-w-xs"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Comment</th>
                      <th>Created At</th> {/* New Header */}
                      <th>Last Updated</th> {/* New Header */}
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentIdeaGroups.map((group) => (
                      <tr key={group.id}>
                        <td>{group.name}</td>
                        <td>{group.description}</td>
                        <td>{group.status}</td>
                        <td>{group.comment}</td>
                        <td>{new Date(group.created).toLocaleString()}</td>{" "}
                        {/* Display Created */}
                        <td>
                          {new Date(group.last_updated).toLocaleString()}
                        </td>{" "}
                        {/* Display Last Updated */}
                        <td>
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={() => handleEditGroup(group)}
                          >
                            Edit
                          </button>
                          {showEditGroupModal && selectedIdeaGroup && (
                            <IdeaGroupEditModal
                              group={selectedIdeaGroup}
                              onEdit={() => {
                                fetchIdeaGroups();
                                setShowEditGroupModal(false);
                              }}
                              onClose={() => setShowEditGroupModal(false)}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  className="btn btn-primary btn-sm self-end"
                  onClick={() => setShowAddGroupForm(true)}
                >
                  Add New IdeaGroup
                </button>
                {showAddGroupForm && (
                  <NewIdeaGroupForm
                    onClose={() => setShowAddGroupForm(false)}
                    onAdd={fetchIdeaGroups}
                  />
                )}
                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    onClick={() =>
                      setCurrentPageIdeaGroups((prevPage) =>
                        Math.max(prevPage - 1, 1)
                      )
                    }
                  >
                    Previous
                  </button>
                  {Array.from(
                    {
                      length: Math.ceil(ideaGroups.length / ideaGroupsPerPage),
                    },
                    (_, i) => (
                      <button
                        className="join-item btn btn-sm"
                        key={i}
                        onClick={() => setCurrentPageIdeaGroups(i + 1)}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                  <button
                    className="join-item btn btn-sm"
                    onClick={() =>
                      setCurrentPageIdeaGroups((prevPage) =>
                        Math.min(
                          prevPage + 1,
                          Math.ceil(ideaGroups.length / ideaGroupsPerPage)
                        )
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
              {/* 
              <h3 className="text-xl font-semibold mb-4">Invite New Member</h3>
              <form onSubmit={sendInvite} className="flex mt-2">
                <input
                  type="email"
                  name="inviteEmail"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
                <button type="submit" className="btn btn-primary ml-2">
                  Send Invite
                </button>
              </form>
              {successMessage.invite && (
                <div className="text-green-500">{successMessage.invite}</div>
              )}*/}
            </div>
            <div
              id="members-table"
              className=" bg-white shadow-lg rounded-lg p-6"
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold mb-4">
                  Organization Members
                </h3>

                <input
                  type="text"
                  placeholder="Search Organizations Members..."
                  value={searchQueryMembers}
                  onChange={(e) => setSearchQueryMembers(e.target.value)}
                  className="input input-sm input-bordered w-full max-w-xs"
                />
              </div>
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
                    {currentMembers.map((member) => (
                      <tr key={member.id}>
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
          </div>
        )}
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
