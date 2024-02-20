import React, { useState, useEffect } from "react";
import { getCookie } from "../Authentication/csrftoken"; // Make sure the path is correct

function IdeaGroupEditModal({ group, onClose, onEdit }) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [status, setStatus] = useState(group.status);
  const [comment, setComment] = useState(group.comment || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Example API endpoint - adjust URL as needed
    const url = `/api/ideagroups/update/${group.id}`;
    try {
      const response = await fetch(url, {
        method: "PUT", // Or "PUT", depending on your backend
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ name, description, status, comment }),
      });
      if (!response.ok) throw new Error("Failed to update idea group");
      onEdit(); // Refresh the IdeaGroups list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating idea group:", error);
    }
  };

  return (
    <div
      className="modal modal-open fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="my-modal"
    >
      <div className="modal-box relative">
        <h3 className="font-bold text-lg">Edit Idea Group</h3>
        <form onSubmit={handleSubmit} className="py-4">
          <div className="form-control">
            <label className="label" htmlFor="name">
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="description">
              Description:
            </label>
            <input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="status">
              Status:
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-sm select-bordered"
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label" htmlFor="comment">
              Comment:
            </label>
            <textarea
              type="text"
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="textarea textarea-sm textarea-bordered h-24"
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IdeaGroupEditModal;
