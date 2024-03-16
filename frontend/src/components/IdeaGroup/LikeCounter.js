import React, { useEffect, useState } from "react";
import { getCookie } from "../Authentication/csrftoken";
import Modal from "../components/Modal";

const LikeCounter = ({ ideaId }) => {
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setErrorMessage(""); // Reset error message on successful vote
      setIsModalOpen(false); // Close the modal if open
    } catch (error) {
      console.error("Error updating vote:", error);
      setErrorMessage(
        "To vote on ideas, \nplease log in or register an account."
      );
      setIsModalOpen(true); // Open the modal on error
    }
  };

  useEffect(() => {
    fetchIdeaVotes();
  }, [ideaId]);

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage("");
  };

  return (
    <div className="bg-white flex flex-col w-8 drop-shadow-card">
      {/* Your buttons and vote count display */}
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

      {/* Integrated Modal for displaying error message */}
      <Modal isOpen={!!errorMessage} onClose={handleCloseModal}>
        <div className="flex flex-col items-center">
          <div className="text-lg text-center whitespace-pre-line">
            {errorMessage}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LikeCounter;
