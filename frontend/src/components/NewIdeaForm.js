// NewIdeaForm.js
import React, { useState } from "react";

const NewIdeaForm = ({ ideaGroups, activeGroup, onNewIdeaAdded }) => {
  const [newIdea, setNewIdea] = useState("");
  const postAnonymously = true; // Since there's no authentication, always post anonymously

  const handleNewIdeaChange = (e) => {
    setNewIdea(e.target.value);
  };

  const handlePostIdea = async () => {
    const ideaData = {
      groupId: activeGroup.id,
      title: "New Idea", // You need to add a way to capture the title
      description: newIdea,
      person: null, // Always null since it's anonymous
    };

    try {
      const response = await fetch(`/api/ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ideaData),
      });

      if (response.ok) {
        const newIdea = await response.json();
        onNewIdeaAdded(newIdea);
        setNewIdea("");
      }
    } catch (error) {
      console.error("Error posting idea:", error);
    }
  };

  return (
    <div className="absolute top-1/4 left-1/4 bg-white p-4 rounded shadow-lg">
      {/* ... other form elements ... */}

      <label htmlFor="postAnonymously">Post Anonymously</label>
      <input
        type="checkbox"
        id="postAnonymously"
        checked={postAnonymously}
        disabled={true}
        onChange={() => {}}
      />

      <button onClick={handlePostIdea}>Post Idea</button>
    </div>
  );
};

export default NewIdeaForm;
