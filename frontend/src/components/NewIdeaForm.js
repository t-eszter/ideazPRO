import React, { useState } from "react";
import CSRFToken, { getCookie } from "./csrftoken";
import { IoClose } from "react-icons/io5";

const NewIdeaForm = ({ ideaGroups, activeGroup, onNewIdeaAdded, onClose }) => {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const postAnonymously = true;
  const [selectedGroup, setSelectedGroup] = useState(activeGroup.id);

  const handleClose = () => {
    onClose();
  };

  const handleIdeaTitleChange = (e) => {
    setIdeaTitle(e.target.value);
  };

  const handleIdeaDescriptionChange = (e) => {
    if (descriptionError) setDescriptionError("");
    if (e.target.value.length <= 240) {
      setIdeaDescription(e.target.value);
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handlePostIdea = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", ideaTitle);
    formData.append("description", ideaDescription);
    formData.append("group", selectedGroup);
    formData.append("person", null);
    formData.append("csrfmiddlewaretoken", getCookie("csrftoken"));

    try {
      const response = await fetch(`/api/ideas/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error) {
          setDescriptionError(data.error);
          console.log("does not work");
          return;
        }
        throw new Error("Response not OK");
      }

      const newIdea = await response.json();
      onNewIdeaAdded(newIdea);
      setIdeaTitle("");
      setIdeaDescription("");
    } catch (error) {
      console.error("Error posting idea:", error);
    }
  };

  return (
    <div className="absolute bottom-40 right-4 w-1/4 h-[540px] bg-white p-4 rounded drop-shadow-lg">
      <button
        onClick={handleClose}
        className="absolute top-0 right-0 p-2 text-xl"
      >
        <IoClose />
      </button>
      <form onSubmit={handlePostIdea}>
        <CSRFToken />
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text" htmlFor="ideaTitle">
              Title:
            </span>
          </div>
          <input
            id="ideaTitle"
            type="text"
            placeholder="Title..."
            className="input input-bordered max-w-xs w-full mb-2"
            value={ideaTitle}
            onChange={handleIdeaTitleChange}
          />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text" htmlFor="ideaDescription">
              My idea:
            </span>
          </div>
          <textarea
            id="ideaDescription"
            value={ideaDescription}
            maxLength="300" // Updated character limit
            onChange={handleIdeaDescriptionChange}
            style={{ height: "184px" }}
            className="textarea textarea-bordered w-full mb-2 h-46"
            placeholder="Idea description..."
          ></textarea>
          <div className="text-sm">{ideaDescription.length}/240</div>
        </label>
        {descriptionError && (
          <div className="text-red-500 text-sm">{descriptionError}</div>
        )}{" "}
        {/* Error message */}
        <label className="form-control">
          <div className="label">
            <span className="label-text">Posting to</span>
          </div>
          <select
            className="select select-bordered w-full mb-2"
            value={selectedGroup}
            onChange={handleGroupChange}
          >
            {ideaGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-control">
          <label className="label cursor-pointer w-40">
            <input
              type="checkbox"
              id="postAnonymously"
              checked={postAnonymously}
              className="checkbox"
              disabled
            />
            <span className="label-text" htmlFor="postAnonymously">
              Post Anonymously
            </span>
          </label>
        </div>
        <button className="btn btn-primary" type="submit">
          Post idea
        </button>
      </form>
    </div>
  );
};

export default NewIdeaForm;
