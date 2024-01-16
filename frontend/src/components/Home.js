import React from "react";
import ReactLogo from "./ideaz_logo.svg";

function Home() {
  return (
    <div className="font-kumbh flex flex-col content-center items-center justify-center w-full h-screen gap-12">
      <div className="flex flew-row items-center gap-4 ">
        <h1 className="text-3xl">Welcome to</h1>
        <img
          className="w-auto h-12 mr-5"
          src={ReactLogo}
          alt="Ideaz pro logo"
        />
      </div>
      <h3 className="text-4xl font-bold">
        What topic would you like to brainstorm about?
      </h3>
      <label className="form-control w-full max-w-xs">
        <input
          id="ideaTitle"
          type="text"
          placeholder="Title..."
          className="input input-bordered max-w-xs w-full mb-2"
        />
      </label>
      <button class="btn btn-secondary" type="submit">
        Create idea board
      </button>
    </div>
  );
}

export default Home;
