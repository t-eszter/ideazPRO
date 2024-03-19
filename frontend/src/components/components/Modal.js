import React from "react";
import ReactDOM from "react-dom";
import Illustration from "./reg_illu.svg";
import HallOfFameIllu from "./hallOfFameIllu.svg";
import Logo from "../ideaz_logo.svg";

const modalRoot = document.getElementById("modal-root");

const Modal = ({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
  contentType,
}) => {
  if (!isOpen) return null;

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const illustrationSrc =
    contentType === "hallOfFame" ? HallOfFameIllu : Illustration;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
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
      <div
        className="fixed inset-0 overflow-y-auto"
        onClick={handleModalContentClick}
      >
        <div className="flex flex-row items-center justify-center min-h-screen">
          <div
            className="fixed inset-0 bg-lochmara-900 opacity-60 backdrop-filter backdrop-blur-lg"
            onClick={onClose}
          ></div>
          {/* LEFT SIDE */}
          <div className="flex flex-row w-2/3 h-2/3 z-10 ">
            <div className="w-1/2 py-[10%] rounded-l-lg bg-sinbad-200 flex flex-col gap-8 items-center content-center p-10">
              <img src={Logo} alt="Logo" className="w-48" />
              <img src={illustrationSrc} alt="Illustration" className="" />
            </div>

            {/* RIGHT SIDE */}
            <div className="font-kumbh w-1/2 rounded-r-lg bg-alabaster-50 p-5 flex items-center justify-center">
              <div className="w-full">{children}</div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="self-start w-10 h-10 ml-4 bg-alabaster-50 rounded-full text-lg font-semibold z-20"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
