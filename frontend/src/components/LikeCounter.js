import React, { useState } from "react";

const LikeCounter = ({ idea, onLike }) => {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (!liked) {
      onLike(idea.id, 1); // Increase like count by 1
    } else {
      onLike(idea.id, -1); // Decrease like count by 1
    }
    setLiked(!liked);
  };

  return (
    <div className="flex items-center">
      <button
        className={`mx-2 p-2 ${liked ? "text-green-500" : "text-gray-500"}`}
        onClick={handleLike}
      >
        {liked ? "👍" : "👍"}
      </button>
      <span>{idea.likes}</span>
    </div>
  );
};

export default LikeCounter;
