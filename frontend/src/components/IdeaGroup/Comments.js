import React, { useEffect, useState } from "react";

const Comments = ({ ideaId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch(`/api/comments/${ideaId}`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("There was an error!", error));
  }, [ideaId]);

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2">Comments</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id} className="mb-1">
            <div>
              <img
                src={comment.user.profilePic}
                alt="Profile"
                style={{ width: 50, height: 50, borderRadius: "50%" }}
              />
              <span>{comment.user.username}</span>
              <span>{new Date(comment.commentTime).toLocaleString()}</span>
            </div>
            <p>{comment.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;
