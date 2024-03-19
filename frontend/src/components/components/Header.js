import React, { useState, useEffect } from "react";
import Logo from "../ideaz_logo.svg";
import {
  IoClose,
  IoTrophyOutline,
  IoShareSocialOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Modal from "./Modal";
import ShareModalContent from "./ShareModalContent";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import HallOfFameModal from "./HallOfFame";

function Header() {
  const navigate = useNavigate();
  const defaultProfilePic = "/images/profile_pics/profile_pic_anon.svg";
  const { currentUser, logout } = useAuth();
  const toggleHallOfFameModal = () => setModalContent("hallOfFame");

  // const toggleHallOfFameModal = () => setIsHallOfFameOpen(!isHallOfFameOpen);

  const [modalContent, setModalContent] = useState("");

  const switchToLogin = () => {
    setModalContent("login");
  };

  const handleModalOpen = (content) => {
    setModalContent(content);
  };

  const handleModalClose = () => {
    setModalContent("");
    setIsCopied(false);
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    navigate("/");
  };

  return (
    <header className="bg-alabaster-100 px-4 py-2 flex justify-between items-center">
      <div className=" flex flex-row gap-4">
        <div className="flex flex-row gap-4">
          <Link
            to={
              currentUser?.organizationName
                ? `/${currentUser.organizationName}`
                : "/"
            }
          >
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
        {currentUser && (
          <button
            onClick={toggleHallOfFameModal}
            className="btn-hall-of-fame flex flex-row items-center gap-2"
          >
            <IoTrophyOutline />
            Hall of Fame
          </button>
        )}
        {!currentUser && (
          <button
            onClick={() => handleModalOpen("share")}
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
                <a href="#" onClick={() => handleModalOpen("register")}>
                  Register
                </a>
                <a href="#" onClick={() => handleModalOpen("login")}>
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
                src={`${
                  currentUser.profilePic
                    ? currentUser.profilePic
                    : // + "?v=" + new Date().getTime()
                      defaultProfilePic
                }`}
                alt="Profile"
                key={currentUser.profilePic}
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

      {modalContent && (
        <Modal
          isOpen={!!modalContent}
          onClose={handleModalClose}
          contentType={modalContent}
        >
          {modalContent === "register" && (
            <Register
              toggleRegister={handleModalClose}
              switchToLogin={switchToLogin}
            />
          )}
          {modalContent === "login" && <Login toggleLogin={handleModalClose} />}
          {modalContent === "share" && <ShareModalContent />}
          {modalContent === "hallOfFame" && (
            <HallOfFameModal toggleModal={handleModalClose} />
          )}
        </Modal>
      )}
    </header>
  );
}

export default Header;
