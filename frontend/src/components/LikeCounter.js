import React, { useState } from "react";
import CSRFToken from "./csrftoken";

const LikeCounter = ({ idea, onLike }) => {
  const [userVote, setUserVote] = useState(null); // null, 1 (liked), -1 (disliked)

  const handleLike = (e, vote) => {
    e.preventDefault(); // Prevent default form submission

    // User is changing their vote or resetting it if they click the same button again
    const newVote = userVote === vote ? 0 : vote;

    onLike(idea.id, newVote);
    setUserVote(newVote);
  };

  return (
    <div className="bg-white drop-shadow-card flex flex-col items-center">
      <form onSubmit={(e) => handleLike(e, -1)}>
        <CSRFToken />
        <button
          className={`mx-2 p-2 ${
            userVote === -1 ? "text-red-500" : "text-gray-500"
          }`}
          type="submit"
          disabled={userVote === 1}
        >
          👎
        </button>
      </form>
      <span>{idea.likes}</span>
      <form onSubmit={(e) => handleLike(e, 1)}>
        <CSRFToken />
        <button
          className={`mx-2 p-2 ${
            userVote === 1 ? "text-green-500" : "text-gray-500"
          }`}
          type="submit"
          disabled={userVote === -1}
        >
          👍
        </button>
      </form>
    </div>
  );
};

export default LikeCounter;
