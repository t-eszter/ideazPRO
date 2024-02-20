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
  const [userName, setUserName] = useState("Anon"); // Use null to explicitly indicate no user
  const navigate = useNavigate();
  const { currentUser, logout, organizationName } = useAuth();

  const profilePicElement = (
    <img
      src={
        currentUser?.profilePic || "/images/profile_pics/profile_pic_anon.svg"
      }
      alt="Profile"
      className="block mx-auto my-auto h-10 w-10 rounded-full" // Ensure your img tag includes the necessary classes
    />
  );

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName);
    console.log("Org name:::" + localStorage.getItem("organizationName"));
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("organizationName");
    setUserName("Anon"); // Or "Anon" if you prefer to default to "Anon" instead of hiding the user-specific UI
    window.dispatchEvent(new Event("loginSuccess"));
    navigate("/"); // Reuse the same event to trigger UI update
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUserName = localStorage.getItem("userName");
      setUserName(storedUserName || "Anon");
    };

    // Listen for local storage changes
    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleRegister = () => {
    setIsRegisterOpen(!isRegisterOpen);
  };

  const toggleLogin = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    // Reset the copied state whenever the modal is opened or closed
    setIsCopied(false);
  };

  useEffect(() => {
    const handleLoginSuccess = () => {
      const storedUserName = localStorage.getItem("userName");
      // console.log(storedUserName);
      setUserName(storedUserName || "Anon");
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    return () => window.removeEventListener("loginSuccess", handleLoginSuccess);
  }, []);

  const copyToClipboard = () => {
    // Create a temporary text element
    const el = document.createElement("textarea");
    el.value = window.location.href;
    document.body.appendChild(el);

    // Select the text
    el.select();
    el.setSelectionRange(0, 99999); // for mobile devices

    // Execute the copy command
    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      // console.log("Copying text command was " + msg);
      setIsCopied(true); // Update state to indicate the URL has been copied
    } catch (err) {
      console.error("Oops, unable to copy", err);
    }

    // Remove the temporary element
    document.body.removeChild(el);
  };

  return (
    <header className="bg-alabaster-100 px-4 py-2 flex justify-between items-center">
      <div className=" flex flex-row gap-4">
        <div className="flex flex-row gap-4">
          {currentUser && currentUser.organizationName ? (
            <Link to={`/${currentUser.organizationName}/`}>
              <img src={Logo} alt="Logo" className="h-8" />
            </Link>
          ) : (
            <Link to="/">
              <img src={Logo} alt="Logo" className="h-8" />
            </Link>
          )}
        </div>
        {currentUser && currentUser.organizationName && (
          <div className="organization-name">
            <h2 className="font-kumbh text-3xl">
              {currentUser.organizationName}
            </h2>
          </div>
        )}
      </div>
      <div className="flex flex-row gap-8 items-center">
        <button
          onClick={toggleModal}
          className="btn-share flex flex-row items-center gap-2"
        >
          <IoShareSocialOutline />
          Share
        </button>
        <div className="w-1/11 flex flex-col">
          <span>Hello, {currentUser ? currentUser.name : "Anon"}!</span>
          {/* Assuming currentUser has a name property */}
          <span className="text-sm flex gap-4">
            {currentUser ? (
              <a href="#" onClick={handleLogout}>
                Logout
              </a>
            ) : (
              <>
                <a href="#" onClick={toggleRegister}>
                  Register
                </a>
                {/* The Register component and its modal toggle logic */}
                <Register
                  isOpen={isRegisterOpen}
                  toggleRegister={toggleRegister}
                />

                <a href="#" onClick={toggleLogin}>
                  Login
                </a>
                {/* The Login component and its modal toggle logic */}
                <Login isOpen={isLoginOpen} toggleLogin={toggleLogin} />
              </>
            )}
          </span>
        </div>
        <div className="h-10 w-10 rounded-full bg-sinbad-400 flex items-center justfy-center">
          {currentUser ? (
            <Link to={`/settings/${currentUser.name}`} className="text-white">
              {profilePicElement}
            </Link>
          ) : (
            <div className="h-10 w-10 rounded-full bg-sinbad-400 flex items-center justify-center">
              {profilePicElement}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-lochmara-800 bg-opacity-80 z-50 overflow-y-auto h-full w-full z-50"
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
                <div className="mt-6">
                  <button
                    onClick={copyToClipboard}
                    className="text-white btn btn-primary  focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
