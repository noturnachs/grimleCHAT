import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket"; // Import the singleton socket instance
import { motion, useSpring, useTransform } from "framer-motion";
import Announcement from "./Announcement";
import FingerprintJS from "@fingerprintjs/fingerprintjs"; // Import FingerprintJS
import FAQ from "./Faq";
import { FaFlag } from "react-icons/fa";

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

const fontSize = 30;
const padding = 15;
const height = fontSize + padding;

function Counter({ value }) {
  return (
    <div
      style={{ fontSize }}
      className="flex space-x-2 overflow-hidden rounded bg-[#0d141b] px-2 leading-none text-white"
    >
      <Digit place={100000} value={value} />
      <Digit place={10000} value={value} />
      <Digit place={1000} value={value} />
      <Digit place={100} value={value} />
      <Digit place={10} value={value} />
      <Digit place={1} value={value} />
      <span className="text-[#3ba55c] font-extrabold flex items-center text-[20px] md:text-[25px]">
        ONLINE
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
  const [interest, setInterest] = useState([]);
  const [interestInput, setInterestInput] = useState(""); // For handling the input field
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [userCount, setUserCount] = useState(0); // State to store user count
  const [error, setError] = useState(""); // State to store error messages
  const [password, setPassword] = useState(""); // State to store password
  const [showPasswordInput, setShowPasswordInput] = useState(false); // State to show password input
  const navigate = useNavigate();

  const socketRef = useRef();
  const visitorIdRef = useRef(null); // Add a ref to store the visitor ID

  const handleRemoveInterest = (indexToRemove) => {
    setInterest(interest.filter((_, index) => index !== indexToRemove));
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault();
      setInterest([...interest, interestInput.trim()]);
      setInterestInput(""); // Clear the input field after adding the interest
    }
  };

  useEffect(() => {
    const handleUserCountUpdate = (count) => {
      setUserCount(count);
    };

    socket.on("userCountUpdate", handleUserCountUpdate);

    return () => {
      socket.off("userCountUpdate", handleUserCountUpdate);
    };
  }, []);

  // Add this useEffect for fingerprinting
  useEffect(() => {
    const getFingerprint = async () => {
      try {
        // Load FingerprintJS
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        visitorIdRef.current = result.visitorId; // Store the visitorId in the ref

        // Emit the fingerprint to the server (if needed)
        socket.emit("fingerprintGenerated", visitorIdRef.current);

        // Send the fingerprint to your backend and check the response
        const response = await fetch(`${SERVER_ORIGIN}/api/identify-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ visitorId: visitorIdRef.current }),
        });

        if (response.status === 403) {
          // Redirect to the ban page if the user is banned
          navigate("/banned");
        } else if (response.ok) {
          const data = await response.json();
          console.log(data.message); // Handle successful identification
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching fingerprint or identifying user:", error);
      }
    };

    getFingerprint();
  }, [navigate]);

  const handleReportClick = () => {
    navigate("/report-problems"); // Navigate to the report form route
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (username.toLowerCase().includes("admin")) {
      if (username.toLowerCase() === "admin" && !showPasswordInput) {
        setShowPasswordInput(true);
        return;
      } else if (username.toLowerCase() === "admin" && showPasswordInput) {
        try {
          const response = await fetch(`${SERVER_ORIGIN}/validate-admin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          });

          const result = await response.json();
          if (!result.success) {
            setError("Incorrect admin password.");
            return;
          }
        } catch (error) {
          setError("Server error. Please try again later.");
          return;
        }
      } else {
        setError("Username cannot contain the word 'admin'.");
        return;
      }
    }

    if (username.trim() !== "" && over18 && agreeTerms) {
      // Include visitorId in the socket.emit and navigate calls
      socket.emit("startMatch", {
        username,
        interest,
        visitorId: visitorIdRef.current,
      });
      navigate("/chat", {
        state: { username, interest, visitorId: visitorIdRef.current },
      });
    } else {
      setError("Please fulfill the age requirement and acknowledge the terms.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#192734] p-4">
      <Announcement />
      <div className="flex flex-col space-y-10 justify-center items-center md:flex-row md:space-x-5 md:space-y-0 ">
        <div className="mt-[50vh] iphone-xr:mt-[10vh] md:mt-[20vh] pixel-7:mt-[10vh] s-8+:mt-[30vh] ipad-air:mt-[1vh] surface-duo:mt-[30vh] z-fold:mt-[20vh] nest-hub:mt-[70vh] nest-hubmax:mt-[40vh] def-an:mt-[30vh] ip-se:mt-[50vh]">
          <div className="bg-[#15202b] p-3 rounded-lg shadow-lg max-w-md w-full md:p-8">
            <h1 className="text-2xl font-normal mb-6 text-white text-center ">
              Welcome to LeeyosChat
            </h1>

            <p className="text-sm text-gray-300 mb-4">
              Talk with random strangers anywhere and everywhere.
            </p>

            {/* Display user count */}
            <div className="text-sm text-gray-300 mb-4 text-center">
              <Counter value={userCount} />
            </div>

            {showTerms && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#192734] bg-opacity-50 text-gray-300 z-50">
                <div className="bg-[#15202b] p-6 rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">
                    LeeyosChat Terms and Conditions
                  </h2>
                  <p>
                    By using LeeyosChat, you agree to the following terms and
                    conditions:
                  </p>
                  <ul className="list-disc pl-6 mb-4">
                    <li>
                      You must be at least 18 years old to use LeeyosChat.
                    </li>
                    <li>
                      You are solely responsible for your interactions and the
                      messages you send on LeeyosChat.
                    </li>
                    <li>
                      Do not send any illegal, harmful, threatening, abusive,
                      harassing, defamatory, vulgar, obscene, hateful, or
                      racially, ethnically, or otherwise objectionable messages
                      on LeeyosChat.
                    </li>
                    <li>
                      Do not impersonate any other person or entity on
                      LeeyosChat.
                    </li>
                    <li>
                      We reserve the right to terminate access to LeeyosChat for
                      users who violate our community guidelines.
                    </li>
                  </ul>
                  <p className="font-semibold">Disclaimer of Liability</p>
                  <p>
                    LeeyosChat is provided on an "as is" basis. We make no
                    warranties about the operation of LeeyosChat or the
                    information on it. You agree that your use of LeeyosChat is
                    at your sole risk.
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
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

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

                <input
                  id="interest"
                  value={interestInput}
                  placeholder="What are your interests?"
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestKeyDown} // Add interest on Enter key
                  onBlur={() => {
                    if (interestInput.trim()) {
                      setInterest([...interest, interestInput.trim()]);
                      setInterestInput(""); // Clear the input field after adding the interest
                    }
                  }} // Add interest when the input loses focus
                  className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-6 py-3 text-base hover:border-[#fff] cursor-pointer transition w-full mt-2"
                  type="text"
                />
                {/* Display the interests as tags with remove buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {interest.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-500 text-white px-2 py-1 rounded-lg text-sm"
                    >
                      {item}
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveInterest(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {showPasswordInput && (
                <div>
                  <input
                    id="password"
                    value={password}
                    placeholder="Enter admin password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-6 py-3 text-base hover:border-[#fff] cursor-pointer transition w-full"
                    type="password"
                  />
                </div>
              )}

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
      </div>

      <FAQ />

      <button
        onClick={handleReportClick}
        className="flex items-center text-white mt-4 rounded bg-[#d6663a] p-2 md:p-3 md:mt-6" // Adjust padding and margin for larger screens
      >
        <FaFlag className="mr-2" /> Report an Issue
      </button>

      <footer className="w-full text-center py-4 bg-transparent text-white mt-4 mb-0 md:mt-20">
        {" "}
        {/* Removed absolute positioning */}
        <p className="text-xs font-bold">Leeyos.com 2024</p>
      </footer>
    </div>
  );
}

export default Home;
