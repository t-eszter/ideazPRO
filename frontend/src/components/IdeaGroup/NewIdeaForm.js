import React, { useState, useContext } from "react";
import CSRFToken, { getCookie } from "../Authentication/csrftoken";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../Authentication/AuthContext";

const NewIdeaForm = ({
  ideaGroups,
  activeGroup,
  onNewIdeaAdded,
  onClose,
  fetchIdeas,
}) => {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(activeGroup.id);
  const { currentUser } = useAuth();

  const handleClose = () => {
    onClose();
  };

  const handleIdeaTitleChange = (e) => {
    setIdeaTitle(e.target.value);
  };

  const handleIdeaDescriptionChange = (e) => {
    if (descriptionError) setDescriptionError("");
    setIdeaDescription(e.target.value);
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const toggleAnonymous = () => {
    setIsAnonymous(!isAnonymous);
  };
  const handlePostIdea = async (event) => {
    event.preventDefault();

    const data = JSON.stringify({
      title: ideaTitle,
      description: ideaDescription,
      group: selectedGroup,
      person:
        !isAnonymous && currentUser && currentUser.personId
          ? currentUser.personId
          : null,
    });

    try {
      const response = await fetch(`/api/ideas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: data,
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error) {
          setDescriptionError(data.error);
          return;
        }
        throw new Error("Failed to post idea");
      }

      const newIdea = await response.json();
      await fetchIdeas();
      onNewIdeaAdded(newIdea);
      setIdeaTitle("");
      setIdeaDescription("");
      handleClose();
    } catch (error) {
      console.error("Error posting idea:", error);
    }
  };

  return (
    <div className="absolute bottom-40 right-4 w-1/4 h-[460px] bg-white p-4 rounded drop-shadow-lg">
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
            maxLength="300"
            onChange={handleIdeaDescriptionChange}
            style={{ height: "184px" }}
            className="textarea textarea-bordered w-full mb-2 h-46"
            placeholder="Idea description..."
          ></textarea>
          <div className="text-sm">{ideaDescription.length}/240</div>
        </label>
        {descriptionError && (
          <div className="text-red-500 text-sm">{descriptionError}</div>
        )}
        <div className="form-control">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              id="postAnonymously"
              checked={isAnonymous}
              onChange={toggleAnonymous}
              className="checkbox"
            />
            <span className="label-text w-full pl-2" htmlFor="postAnonymously">
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
