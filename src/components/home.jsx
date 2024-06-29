import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [username, setUsername] = useState("");
  const [over18, setOver18] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username.trim() !== "" && over18 && agreeTerms) {
      navigate("/chat", { state: { username } });
    } else {
      alert("Please fulfill the age requirement and acknowledge the terms.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#192734]">
      <div className="bg-[#15202b] p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">
          Welcome to GrimleChat
        </h1>

        <p className="text-sm text-gray-300 mb-4">
          A platform for meaningful conversations and connections.
        </p>
        {/*-----terms and conditions popup code here------*/}

        {showTerms && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#192734] bg-opacity-50 text-gray-300">
            <div className="bg-[#15202b] p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4">
                GrimleChat Terms and Conditions
              </h2>
              <p>
                By using GrimleChat, you agree to the following terms and
                conditions:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>You must be at least 18 years old to use GrimleChat.</li>
                <li>
                  You are solely responsible for your interactions and the
                  messages you send on GrimleChat.
                </li>
                <li>
                  Do not send any illegal, harmful, threatening, abusive,
                  harassing, defamatory, vulgar, obscene, hateful, or racially,
                  ethnically, or otherwise objectionable messages on GrimleChat.
                </li>
                <li>
                  Do not impersonate any other person or entity on GrimleChat.
                </li>
                <li>
                  We reserve the right to terminate access to GrimleChat for
                  users who violate our community guidelines.
                </li>
              </ul>
              <p className="font-semibold">Disclaimer of Liability</p>
              <p>
                GrimleChat is provided on an "as is" basis. We make no
                warranties about the operation of GrimleChat or the information
                on it. You agree that your use of GrimleChat is at your sole
                risk.
              </p>
              <button
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => setShowTerms(false)}
              >
                I Agree
              </button>
            </div>
          </div>
        )}

        {/*------------------------------------------------------*/}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-white block mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded border border-black bg-gray-400"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="over18"
              checked={over18}
              onChange={() => setOver18(!over18)}
              className="mr-2"
              required
            />
            <label htmlFor="over18" className="text-white">
              I am over 18 years old
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="mr-2"
              required
            />
            <label htmlFor="agreeTerms" className="text-white">
              I agree to the{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => setShowTerms(true)}
              >
                Terms of Service
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            Enter Chat
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
