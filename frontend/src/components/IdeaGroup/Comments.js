import React, { useState, useEffect } from "react";
import { getCookie } from "../Authentication/csrftoken";

const Comments = ({ ideaId, title }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const defaultProfilePic = "/images/profile_pics/profile_pic_anon.svg";

  useEffect(() => {
    fetch(`/api/comments/${ideaId}`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("There was an error!", error));
  }, [ideaId]);

  const postComment = () => {
    if (!newComment.trim()) return;
    const commentData = { comment: newComment, idea: ideaId };

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
        setComments([...comments, data]);
        setNewComment("");
      })
      .catch((error) =>
        console.error("There was an error posting the comment!", error)
      );
  };

  return (
    <div className="">
      <h3 className="font-semibold text-lg mb-2 text-primary">{title}</h3>
      <div className="overflow-auto" style={{ maxHeight: "300px" }}>
        <ul className="space-y-2">
          {comments.map((comment, index) => (
            <li key={comment.id || index} className="flex flex-col">
              <div className="flex flex-row items-center space-x-3">
                <img
                  src={comment.user?.profilePic || defaultProfilePic}
                  alt="Profile"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {comment.user?.username || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.commentTime).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="mt-1">{comment.comment}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="form-control mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="textarea textarea-bordered h-24"
        />
        <button onClick={postComment} className="btn btn-primary mt-2">
          Send
        </button>
      </div>
    </div>
  );
};

export default Comments;
