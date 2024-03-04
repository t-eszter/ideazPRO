import React from "react";
import ReactDOM from "react-dom";

const modalRoot = document.getElementById("modal-root"); // Ensure this exists in your index.html

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>

        <div className="bg-white p-5 rounded-lg shadow-lg m-4 max-w-xl w-full relative z-10">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 mt-4 mr-4 text-lg font-semibold"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
