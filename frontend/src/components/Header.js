import React from "react";
import Logo from "./path-to-your-logo.svg"; // Replace with the path to your logo

function Header() {
  return (
    <header className="bg-white px-4 py-2 flex justify-between items-center">
      <img src={Logo} alt="Logo" className="h-8" />
      <div className="h-10 w-10 rounded-full bg-blue-500"></div>{" "}
      {/* Example colored circle */}
    </header>
  );
}

export default Header;
