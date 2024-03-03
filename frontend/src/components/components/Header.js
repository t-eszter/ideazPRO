import React, { useState, useEffect } from "react";
import Logo from "../ideaz_logo.svg";
import { IoClose } from "react-icons/io5";
import { IoShareSocialOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const defaultProfilePic = "/images/profile_pics/profile_pic_anon.svg";

  const toggleLoginModal = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const toggleRegisterModal = () => {
    setIsRegisterOpen(!isRegisterOpen); // Corrected to properly toggle isRegisterOpen
  };

  useEffect(() => {
    if (currentUser) {
      console.log(currentUser.profilePic);
    }
  }, [currentUser]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    console.log("Org name:::" + localStorage.getItem("organizationName"));
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    navigate("/");
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999); // For mobile devices

    try {
      var successful = document.execCommand("copy");
      setIsCopied(true); // Update state to indicate the URL has been copied
    } catch (err) {
      console.error("Oops, unable to copy", err);
    }

    document.body.removeChild(el);
  };

  return (
    <header className="bg-alabaster-100 px-4 py-2 flex justify-between items-center">
      <div className=" flex flex-row gap-4">
        <div className="flex flex-row gap-4">
          <Link to="/">
            <img src={Logo} alt="Logo" className="h-8" />
          </Link>
        </div>
        {currentUser?.organizationName && (
          <div className="organization-name">
            <h2 className="font-kumbh text-3xl">
              {currentUser.organizationName}
            </h2>
          </div>
        )}
      </div>
      <div className="flex flex-row gap-8 items-center">
        {!currentUser && (
          <button
            onClick={toggleModal}
            className="btn-share flex flex-row items-center gap-2"
          >
            <IoShareSocialOutline />
            Share
          </button>
        )}
        <div className="w-1/11 flex flex-col">
          <span>Hello, {currentUser ? currentUser.name : "Anon"}!</span>
          <span className="text-sm flex gap-4">
            {currentUser ? (
              <a href="#" onClick={handleLogout}>
                Logout
              </a>
            ) : (
              <>
                <a href="#" onClick={toggleRegisterModal}>
                  Register
                </a>
                <a href="#" onClick={toggleLoginModal}>
                  Login
                </a>
              </>
            )}
          </span>
        </div>
        <div className="h-10 w-10 rounded-full bg-sinbad-400 flex items-center justify-center">
          {currentUser ? (
            <Link to={`/settings/${currentUser.name}`}>
              <img
                src={
                  currentUser.profilePic
                    ? currentUser.profilePic
                    : defaultProfilePic
                }
                alt="Profile"
                className="h-10 w-10 rounded-full"
              />
            </Link>
          ) : (
            <img
              src={defaultProfilePic}
              alt="Profile"
              className="h-10 w-10 rounded-full"
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-lochmara-800 bg-opacity-80 z-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="flex justify-center items-center h-full">
            <div className="relative bg-white rounded-lg shadow w-1/3">
              <button
                onClick={toggleModal}
                className="absolute top-0 right-0 m-2 text-gray-600 bg-transparent rounded-lg text-xl p-1.5 ml-auto inline-flex items-center"
                aria-label="Close"
              >
                <IoClose />
              </button>
              <div className="p-6 text-center">
                <h3 className="mb-5 text-lg font-normal text-gray-500 ">
                  Share this URL
                </h3>
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="text-gray-900 bg-gray-100 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-lg p-2.5"
                />
                <button
                  onClick={copyToClipboard}
                  className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-6"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRegisterOpen && <Register toggleRegister={toggleRegisterModal} />}
      {isLoginOpen && <Login toggleLogin={toggleLoginModal} />}
    </header>
  );
}

export default Header;
