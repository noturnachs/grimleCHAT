import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username.trim() !== "") {
      navigate("/chat", { state: { username } });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#192734]">
      <div className="bg-[#15202b] p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">
          GrimleChat
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#22303c]"
          />
          <button
            type="submit"
            className="bg-[#1d9bf0] hover:bg-[#1a8cb2] text-white font-bold py-2 px-4 rounded-lg w-full"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
