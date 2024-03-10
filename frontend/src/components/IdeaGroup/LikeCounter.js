import React, { useEffect, useState } from "react";
import { getCookie } from "../Authentication/csrftoken";

const LikeCounter = ({ ideaId }) => {
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(null);

  const fetchIdeaVotes = async () => {
    try {
      const response = await fetch(`/api/ideas/vote/${ideaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch votes");
      const data = await response.json();
      setVoteCount(data.total_votes);
      setUserVote(data.user_vote);
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const onLike = async (voteType) => {
    try {
      const response = await fetch(`/api/ideas/vote/${ideaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error("Failed to update vote");
      const updatedData = await response.json();
      setVoteCount(updatedData.total_votes);
      setUserVote(updatedData.user_vote);
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  useEffect(() => {
    fetchIdeaVotes();
  }, [ideaId]);

  return (
    <div className="bg-white flex flex-col w-8 drop-shadow-card">
      <button
        disabled={userVote === "upvote"}
        onClick={() => onLike(userVote === "upvote" ? null : "upvote")}
      >
        👍
      </button>
      <span>{voteCount}</span>
      <button
        disabled={userVote === "downvote"}
        onClick={() => onLike(userVote === "downvote" ? null : "downvote")}
      >
        👎
      </button>
    </div>
  );
};

export default LikeCounter;
