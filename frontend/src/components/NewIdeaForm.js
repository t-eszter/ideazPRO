// NewIdeaForm.js
import React, { useState } from "react";
import CSRFToken, { getCookie } from "./csrftoken";

const NewIdeaForm = ({ ideaGroups, activeGroup, onNewIdeaAdded }) => {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const postAnonymously = true; // Since there's no authentication, always post anonymously

  const handleIdeaTitleChange = (e) => {
    setIdeaTitle(e.target.value);
  };

  const handleIdeaDescriptionChange = (e) => {
    setIdeaDescription(e.target.value);
  };

  const handlePostIdea = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", ideaTitle);
    formData.append("description", ideaDescription);
    formData.append("group", activeGroup.id);
    formData.append("person", null); // Since it's posted anonymously
    formData.append("csrfmiddlewaretoken", getCookie("csrftoken"));

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const csrfToken = getCookie("csrftoken");
    console.log("CSRF Token:", csrfToken);

    try {
      const response = await fetch(`/api/ideas`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text(); // Get the response text
        console.error("Server response:", text); // Log the response text
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
