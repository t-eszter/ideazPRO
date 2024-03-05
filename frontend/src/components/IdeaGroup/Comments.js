import React, { useState, useEffect } from "react";
import { getCookie } from "../Authentication/csrftoken";

const Comments = ({ ideaId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(""); // State to hold the new comment input
  const defaultProfilePic = "/images/profile_pics/profile_pic_anon.svg"; // Path to your default image

  useEffect(() => {
    fetch(`/api/comments/${ideaId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Check if each comment has a unique and defined `id`
        setComments(data);
      })
      .catch((error) => console.error("There was an error!", error));
  }, [ideaId]);

  // Function to handle posting a new comment
  const postComment = () => {
    if (!newComment.trim()) return; // Prevent sending empty comments

    // Adjust according to your backend requirements
    const commentData = {
      comment: newComment,
      idea: ideaId, // Ensure this matches the expected format of the backend
    };

    fetch(`api/comments/new/${ideaId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify(commentData),
    })
      .then((response) => response.json())
      .then((data) => {
        setComments([...comments, data]); // Add the new comment to the local state
        setNewComment(""); // Clear the input field after sending
      })
      .catch((error) =>
        console.error("There was an error posting the comment!", error)
      );
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2">Comments</h3>
      <ul>
        {comments.map((comment, index) => (
          <li key={comment.id || index} className="mb-1">
            <div>
              <img
                src={comment.user?.profilePic || defaultProfilePic}
                alt="Profile"
                style={{ width: 50, height: 50, borderRadius: "50%" }}
              />
              <span>{comment.user?.username || "Anonymous"}</span>
              <span>{new Date(comment.commentTime).toLocaleString()}</span>
            </div>
            <p>{comment.comment}</p>
          </li>
        ))}
      </ul>
      <div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="border rounded p-2 w-full"
        />
        <button
          onClick={postComment}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Comments;
