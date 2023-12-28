import React, { useState } from "react";
import CSRFToken, { getCookie } from "./csrftoken";

const NewIdeaForm = ({ ideaGroups, activeGroup, onNewIdeaAdded }) => {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState(""); // New state for error message
  const postAnonymously = true;

  const handleIdeaTitleChange = (e) => {
    setIdeaTitle(e.target.value);
  };

  const handleIdeaDescriptionChange = (e) => {
    if (descriptionError) setDescriptionError(""); // Clear error when user starts editing
    setIdeaDescription(e.target.value);
  };

  const handlePostIdea = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", ideaTitle);
    formData.append("description", ideaDescription);
    formData.append("group", activeGroup.id);
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
          setDescriptionError(data.error); // Set the error message
          return; // Prevent form from closing
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
    <div className="absolute top-1/4 left-1/4 bg-white p-4 rounded shadow-lg">
      <form onSubmit={handlePostIdea}>
        <CSRFToken />
        <label htmlFor="ideaTitle">Title</label>
        <input
          id="ideaTitle"
          type="text"
          value={ideaTitle}
          onChange={handleIdeaTitleChange}
          className="w-full mb-2"
        />
        <label htmlFor="ideaDescription">Description</label>
        <textarea
          id="ideaDescription"
          value={ideaDescription}
          onChange={handleIdeaDescriptionChange}
          className="w-full mb-2"
        ></textarea>
        {descriptionError && (
          <div className="text-red-500 text-sm">{descriptionError}</div>
        )}{" "}
        {/* Error message */}
        <label htmlFor="postAnonymously">Post Anonymously</label>
        <input
          type="checkbox"
          id="postAnonymously"
          checked={postAnonymously}
          disabled={true}
        />
        <button type="submit">Post Idea</button>
      </form>
    </div>
  );
};

export default NewIdeaForm;
