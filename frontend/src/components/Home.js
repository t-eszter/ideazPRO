import React, { useState } from "react";
import ReactLogo from "./ideaz_logo.svg";
import { useNavigate } from "react-router-dom";
import CSRFToken, { getCookie } from "./Authentication/csrftoken";
import Login from "./components/Login";
import Modal from "./components/Modal";
import illuHowItWorks from "./illu-HowItWorks.svg";

function Home() {
  const [groupName, setgroupName] = useState("");

  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const toggleHowItWorks = () => {
    setIsHowItWorksOpen(!isHowItWorksOpen);
  };

  const navigate = useNavigate();
  // const { currentUser } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
    <div className="font-kumbh flex flex-col content-center items-center justify-center w-full h-screen gap-12 md:gap-12 p-12 bg-cerulean-50">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
        <h1 className="text-3xl">Welcome to</h1>
        <img
          className="w-auto h-12 lg:h-20 mr-5"
          src={ReactLogo}
          alt="Ideaz pro logo"
        />
      </div>
      <h3 className="text-4xl font-bold text-center leading-normal">
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
            className="input input-bordered max-w-xs w-full mb-4"
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
      <p className="text-center">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleHowItWorks();
          }}
          className="text-blue-500 hover:text-blue-700"
        >
          How it works
        </a>
      </p>
      {/* Login Modal */}
      {isLoginOpen && (
        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
          <Login toggleLogin={() => setIsLoginOpen(false)} />
        </Modal>
      )}
      {isHowItWorksOpen && (
        <div
          className="modal-overlay"
          onClick={toggleHowItWorks}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: "999",
          }}
        >
          <div id="howitworks" className="fixed inset-0 overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-screen">
              <div
                className="fixed inset-0 bg-lochmara-900 opacity-60 backdrop-filter backdrop-blur-lg"
                onClick={toggleHowItWorks}
              ></div>

              <div className="flex flex-row w-2/3 h-3/4 z-10 ">
                <div className="flex flex-col w-full h-full">
                  {/* UPPER SIDE */}
                  <div className="font-kumbh h-1/2 rounded-t-lg bg-alabaster-50 p-5 flex items-center justify-center">
                    <div className="w-full flex flex-col text-center">
                      <h3 className="text-3xl font-bold pt-5">How it works</h3>
                      <div className="flex flex-row pt-10 pb-5">
                        <div class="flex flex-col w-1/3 items-center">
                          <div className="w-24 h-24 bg-lochmara-50 rounded-full flex items-center justify-center mb-4">
                            <h4 className="text-6xl font-black text-lochmara-500 ">
                              1
                            </h4>
                          </div>
                          <p>Select a topic you want to collect ideas about</p>
                        </div>
                        <div class="flex flex-col w-1/3 items-center">
                          <div className="w-24 h-24 bg-lochmara-50 rounded-full flex items-center justify-center mb-4">
                            <h4 className="text-6xl font-black text-lochmara-500 ">
                              2
                            </h4>
                          </div>
                          <p>Invite others to collaborate</p>
                        </div>
                        <div class="flex flex-col w-1/3 items-center">
                          <div className="w-24 h-24 bg-lochmara-50 rounded-full flex items-center justify-center mb-4">
                            <h4 className="text-6xl font-black text-lochmara-500 ">
                              3
                            </h4>
                          </div>
                          <p>
                            Upvote or downvote and comment on each other's ideas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* BOTTOM SIDE */}
                  <div className="h-1/2 rounded-b-lg bg-sinbad-200 flex flex-col gap-8 items-center content-center p-10">
                    {/* <img src={Logo} alt="Logo" className="w-48" /> */}
                    <img src={illuHowItWorks} alt="Illustration" className="" />
                  </div>
                </div>
                <button
                  onClick={toggleHowItWorks}
                  className="self-start w-10 h-10 ml-4 bg-alabaster-50 rounded-full text-lg font-semibold z-20"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
