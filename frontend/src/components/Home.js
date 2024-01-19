import React, { useState } from "react";
import ReactLogo from "./ideaz_logo.svg";
import { useNavigate } from "react-router-dom";
import CSRFToken, { getCookie } from "./csrftoken";

function Home() {
  const [ideaTitle, setIdeaTitle] = useState("");
  const navigate = useNavigate();

  const createIdeaGroup = async (title) => {
    const csrftoken = getCookie("csrftoken");
    try {
      const response = await fetch("/api/create_idea_group/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ name: title }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return await response.json();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return { success: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await createIdeaGroup(ideaTitle);
    if (response.success) {
      navigate(`/${response.data.slug}`);
    } else {
      // Handle error here, e.g., display a notification
    }
  };

  return (
    <div className="font-kumbh flex flex-col content-center items-center justify-center w-full h-screen gap-12">
      <div className="flex flew-row items-center gap-4 ">
        <h1 className="text-3xl">Welcome to</h1>
        <img
          className="w-auto h-12 mr-5"
          src={ReactLogo}
          alt="Ideaz pro logo"
        />
      </div>
      <h3 className="text-4xl font-bold">
        What topic would you like to brainstorm about?
      </h3>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <CSRFToken />
        <label className="form-control w-full max-w-xs">
          <input
            id="ideaTitle"
            type="text"
            placeholder="Title..."
            className="input input-bordered max-w-xs w-full mb-2"
          />
        </label>
        <button
          className="btn btn-accent text-white focus:outline-lochmara-500 focus:outlne-2 "
          type="submit"
        >
          Create idea board
        </button>
      </form>
    </div>
  );
}

export default Home;
