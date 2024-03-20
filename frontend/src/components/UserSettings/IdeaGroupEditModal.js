import React, { useState, useEffect } from "react";
import { getCookie } from "../Authentication/csrftoken";

function IdeaGroupEditModal({ group, onClose, onEdit }) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [status, setStatus] = useState(group.status);
  const [comment, setComment] = useState(group.comment || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `/api/ideagroups/update/${group.id}`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ name, description, status, comment }),
      });
      if (!response.ok) throw new Error("Failed to update idea group");
      onEdit();
      onClose();
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
        <div className="flex justify-between items-center pb-3">
          <p className="text-2xl font-bold">Edit Idea Group</p>
          <div className="modal-close cursor-pointer z-50" onClick={onClose}>
            <svg
              className="fill-current text-black"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z" />
            </svg>
          </div>
        </div>
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
            {/* <button type="button" className="btn btn-sm" onClick={onClose}>
              Cancel
            </button> */}
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
