import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { MotionValue, motion, useSpring, useTransform } from "framer-motion";

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;
const socket = io(SERVER_ORIGIN, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000, // 20 seconds
});

const fontSize = 30;
const padding = 15;
const height = fontSize + padding;

function Counter({ value }) {
  return (
    <div
      style={{ fontSize }}
      className="flex space-x-2 overflow-hidden rounded bg-white px-2 leading-none text-gray-900"
    >
      <Digit place={100000} value={value} />
      <Digit place={10000} value={value} />
      <Digit place={1000} value={value} />
      <Digit place={100} value={value} />
      <Digit place={10} value={value} />
      <Digit place={1} value={value} />
      <span className="text-[#3ba55c] font-extrabold	 flex items-center text-[20px] md:text-[25px]">
        ONLINE USERS
      </span>
    </div>
  );
}

function Digit({ place, value }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ mv, number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest;
    const offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}

function Home() {
  const [username, setUsername] = useState("");
  const [over18, setOver18] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [userCount, setUserCount] = useState(0); // State to store user count
  const navigate = useNavigate();

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = socket;

    const handleUserCountUpdate = (count) => {
      setUserCount(count);
    };

    // Subscribe to the 'userCountUpdate' event
    socketRef.current.on("userCountUpdate", handleUserCountUpdate);

    // Clean up event listener on component unmount
    return () => {
      socketRef.current.off("userCountUpdate", handleUserCountUpdate);
    };
  }, []); // Empty dependency array ensures this effect runs only once

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
        <h1 className="text-2xl font-normal mb-6 text-white text-center">
          Welcome to GrimleChat
        </h1>

        <p className="text-sm text-gray-300 mb-4">
          Talk with random strangers anywhere and everywhere.
        </p>

        {/* Display user count */}
        <div className="text-sm text-gray-300 mb-4 text-center">
          <Counter value={userCount} />
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="username"
              value={username}
              placeholder="What should we call you?"
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-6 py-3 text-base hover:border-[#fff] cursor-pointer transition w-full"
              type="text"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="over18"
              className="text-white flex items-center text-md"
            >
              <input
                type="checkbox"
                id="over18"
                checked={over18}
                onChange={() => setOver18(!over18)}
                className="mr-2 w-4 h-4"
                required
              />
              I am over 18 years old
            </label>

            <label
              htmlFor="agreeTerms"
              className="text-white flex items-center text-md"
            >
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="mr-2 w-4 h-4"
                required
              />
              I agree to the&nbsp;
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="underline cursor-pointer"
              >
                Terms of Service
              </button>
            </label>
          </div>

          {!showTerms && (
            <button
              type="submit"
              className="overflow-hidden w-full p-2 h-12 bg-[#325E87] text-white border-none rounded-md text-md font-normal cursor-pointer relative z-10 group flex items-center justify-center"
            >
              <span className="absolute inset-0 flex items-center justify-center bg-[#325E87] group-hover:opacity-0 transition-opacity duration-1000">
                Are you ready?
              </span>
              <span className="absolute w-[200%] h-32 -top-8 -left-1/2 bg-green-200 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-bottom"></span>
              <span className="absolute w-[200%] h-32 -top-8 -left-1/2 bg-green-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-bottom"></span>
              <span className="absolute w-[200%] h-32 -top-8 -left-1/2 bg-green-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-bottom"></span>
              <span className="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute inset-0 flex items-center justify-center z-10">
                Continue
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Home;
