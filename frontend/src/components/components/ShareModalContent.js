// ShareModalContent.jsx
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

const ShareModalContent = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999); // For mobile devices

    try {
      var successful = document.execCommand("copy");
      setIsCopied(true);
    } catch (err) {
      console.error("Oops, unable to copy", err);
    }

    document.body.removeChild(el);
  };

  return (
    <div className="p-6 text-center">
      <h3 className="mb-5 text-lg font-normal text-gray-500">Share this URL</h3>
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
  );
};

export default ShareModalContent;
