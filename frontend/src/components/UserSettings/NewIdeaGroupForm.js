import React, { useState } from "react";
import { getCookie } from "../Authentication/csrftoken";
import { useAuth } from "../Authentication/AuthContext";

function NewIdeaGroupForm({ onClose, onAdd }) {
  //   const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    // The status is hardcoded to "active" in the POST request body
    const requestBody = JSON.stringify({
      name,
      description,
      status: "active",
    });

    const url = `/api/ideagroups`;
    try {
      console.log(requestBody);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: requestBody,
      });
      if (!response.ok) {
        throw new Error("Failed to create idea group");
      }
      onAdd();
      onClose();
    } catch (error) {
      console.error("Error creating idea group:", error);
    }
  };

  return (
    <div className="modal modal-open fixed w-full h-full top-0 left-0 flex items-center justify-center">
      <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>

      <div className="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
        <div className="modal-content py-4 text-left px-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center pb-3">
            <p className="text-2xl font-bold">Add New Idea Group</p>
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

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
              <button
                type="button"
                className="modal-close px-4 bg-gray-400 p-3 rounded-lg text-white hover:bg-gray-300"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 bg-blue-500 p-3 rounded-lg text-white hover:bg-blue-400"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewIdeaGroupForm;
