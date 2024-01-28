import React from "react";
import Logo from "./ideaz_logo.svg";
function Header() {
  return (
    <header className="bg-white px-4 py-2 flex justify-between items-center">
      <img src={Logo} alt="Logo" className="h-8" />
      <div className="flex flex-row gap-4">
        <div className="w-1/11 flex flex-col">
          <span>Hello, Anon! </span>{" "}
          <span className="text-sm flex gap-4">
            <a href="#">Register</a>
            <a href="#"> Login</a>
          </span>
        </div>
        <div className="h-10 w-10 rounded-full bg-sinbad-400"></div>
      </div>
      {/* Example colored circle */}
    </header>
  );
}

export default Header;
