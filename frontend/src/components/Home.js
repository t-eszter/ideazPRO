import React, { useState } from "react";
import ReactLogo from "./ideaz_logo.svg";
import { useNavigate } from "react-router-dom";
import CSRFToken, { getCookie } from "./Authentication/csrftoken";
import Login from "./components/Login";
import Modal from "./components/Modal";

function Home() {
  const [groupName, setgroupName] = useState("");
  const navigate = useNavigate();
  // const { currentUser } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const toggleLoginModal = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const createIdeaGroup = async (name) => {
    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("csrfmiddlewaretoken", getCookie("csrftoken"));
    try {
      const response = await fetch("/api/create_idea_group/", {
        method: "POST",
        body: formData,
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
    const response = await createIdeaGroup(groupName);
    if (response.success) {
      navigate(`/guests/${response.data.id}`);
    } else {
      console.error("There was a problem with the url", error);
    }
  };

  return (
    <div className="font-kumbh flex flex-col content-center items-center justify-center w-full h-screen gap-4 md:gap-12">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
        <h1 className="text-3xl">Welcome to</h1>
        <img
          className="w-auto h-12 lg:h-20 mr-5"
          src={ReactLogo}
          alt="Ideaz pro logo"
        />
      </div>
      <h3 className="text-2xl md:text-4xl font-bold text-center">
        What topic would you like to brainstorm about?
      </h3>
      <form
        onSubmit={handleSubmit}
        className="w-full md:max-w-md lg:max-w-lg flex flex-col items-center"
      >
        <CSRFToken />
        <label className="form-control w-full max-w-xs">
          <input
            id="groupName"
            type="text"
            placeholder="I would like to collect ideas about..."
            className="input input-bordered max-w-xs w-full mb-2"
            value={groupName}
            onChange={(e) => setgroupName(e.target.value)}
          />
        </label>
        <button
          className="btn btn-accent text-white focus:outline-lochmara-500 focus:outline-2 self-center"
          type="submit"
        >
          Create idea board
        </button>
      </form>
      <p className="text-center">
        If you already have an account, you can
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsLoginOpen(true);
          }}
          className="text-blue-500 hover:text-blue-700"
        >
          &nbsp;log in&nbsp;
        </a>
        here.
      </p>
      {/* Login Modal */}
      {isLoginOpen && (
        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
          <Login toggleLogin={() => setIsLoginOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

export default Home;
