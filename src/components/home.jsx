import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket"; // Import the singleton socket instance
import { motion, useSpring, useTransform } from "framer-motion";
import Announcement from "./Announcement";
import FingerprintJS from "@fingerprintjs/fingerprintjs"; // Import FingerprintJS
import FAQ from "./Faq";
import { FaFlag } from "react-icons/fa";
import Ads from "./ads";
import { FaFacebook } from "react-icons/fa";
import HOS from "./hallOfShame";
// import Survey from "./Survey";
import Shoutout from "./shoutout";
import { FiInfo } from "react-icons/fi";
import ReportHistory from "./ReportHistory";

// import Warning from "./warning"; // Import the Warning component

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

const fontSize = 30;
const padding = 15;
const height = fontSize + padding;

function Counter({ value }) {
  return (
    <div
      style={{ fontSize }}
      className="flex justify-center items-center space-x-2 overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm px-4 py-2 leading-none text-white border border-gray-700/30 shadow-lg w-full"
    >
      <div className="flex items-center space-x-1">
        <Digit place={100000} value={value} />
        <Digit place={10000} value={value} />
        <Digit place={1000} value={value} />
        <Digit place={100} value={value} />
        <Digit place={10} value={value} />
        <Digit place={1} value={value} />
      </div>
      <span className="text-emerald-400 font-bold flex items-center text-[20px] md:text-[25px] tracking-wide">
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
        <Number key={`${place}-${i}`} mv={animatedValue} number={i} />
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [youtubeLink, setYoutubeLink] = useState(
  //   "https://www.youtube.com/watch?v=GemKqzILV4w"
  // ); // Default link
  const [visitorIdGenerated, setVisitorIdGenerated] = useState(false);
  const [visitorId, setVisitorId] = useState(null);
  const [isSpecialUsername, setIsSpecialUsername] = useState(false);
  const [specialToken, setSpecialToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Add useEffect to listen for maintenance status
  // Add this useEffect to fetch initial maintenance status
  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await fetch(`${SERVER_ORIGIN}/api/maintenance-status`);
        if (response.ok) {
          const data = await response.json();
          setMaintenanceMode(data.enabled);
        }
      } catch (error) {
        console.error("Error fetching maintenance status:", error);
      }
    };

    fetchMaintenanceStatus(); // Initial fetch

    // Listen for maintenance mode updates via socket
    socket.on("maintenanceStatus", ({ enabled }) => {
      setMaintenanceMode(enabled);
    });

    // Cleanup socket listener
    return () => {
      socket.off("maintenanceStatus");
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    async function generateFingerprint() {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const generatedVisitorId = result.visitorId;
        return generatedVisitorId;
      } catch (error) {
        console.error("Error generating fingerprint:", error);
        return null;
      }
    }

    async function checkAndUpdateVisitorId() {
      const storedVisitorId = localStorage.getItem("visitorId");
      const newGeneratedId = await generateFingerprint();

      if (newGeneratedId) {
        if (!storedVisitorId || storedVisitorId !== newGeneratedId) {
          // If there's no stored ID or the stored ID is different from the new one
          localStorage.setItem("visitorId", newGeneratedId);
          setVisitorId(newGeneratedId);
          console.log("New Visitor ID generated and saved:", newGeneratedId);
        } else {
          // If the stored ID is the same as the new one, just use the stored ID
          setVisitorId(storedVisitorId);
          console.log("Using stored Visitor ID:", storedVisitorId);
        }
        setVisitorIdGenerated(true);
      } else {
        // If we couldn't generate a new ID, use the stored one if available
        if (storedVisitorId) {
          setVisitorId(storedVisitorId);
          setVisitorIdGenerated(true);
          console.log("Using stored Visitor ID:", storedVisitorId);
        } else {
          setVisitorIdGenerated(false);
          console.error("Failed to generate or retrieve Visitor ID");
        }
      }
    }

    checkAndUpdateVisitorId();
  }, []);

  useEffect(() => {
    // Listen for the updateYouTubeLink event
    // socket.on("updateYouTubeLink", (newLink) => {
    //   setYoutubeLink(newLink); // Update the YouTube link state
    // });

    // Listen for visitorId generation
    socket.on("visitorIdGenerated", (generatedVisitorId) => {
      visitorIdRef.current = generatedVisitorId;
      setVisitorIdGenerated(true);
    });

    return () => {
      // socket.off("updateYouTubeLink"); // Clean up the event listener
      socket.off("visitorIdGenerated");
    };
  }, []);

  const socketRef = useRef();
  const visitorIdRef = useRef(null); // Add a ref to store the visitor ID

  useEffect(() => {
    // Check if the URL contains "#announcement"
    if (window.location.hash === "#announcements") {
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optionally, remove the hash from the URL after closing the modal
    window.history.pushState("", document.title, window.location.pathname);
  };

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
    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Immediately request user count
    socket.emit("requestUserCount");

    // Handle reconnection
    socket.on("connect", () => {
      socket.emit("requestUserCount");
    });

    // Handle user count updates
    const handleUserCountUpdate = (count) => {
      if (count === 0) {
        // If count is 0, request again after a short delay
        setTimeout(() => socket.emit("requestUserCount"), 1000);
      } else {
        setUserCount(count);
      }
    };

    socket.on("userCountUpdate", handleUserCountUpdate);

    // Set up periodic count updates
    const countInterval = setInterval(() => {
      socket.emit("requestUserCount");
    }, 5000);

    // Cleanup function
    return () => {
      socket.off("userCountUpdate", handleUserCountUpdate);
      socket.off("connect");
      clearInterval(countInterval);
    };
  }, []);

  useEffect(() => {
    const requestAndSetUserCount = () => {
      socket.emit("requestUserCount");
    };

    // Request count immediately when component mounts
    requestAndSetUserCount();

    // Set up interval to request count periodically
    const interval = setInterval(requestAndSetUserCount, 5000);

    const handleUserCountUpdate = (count) => {
      setUserCount(count);
    };

    socket.on("userCountUpdate", handleUserCountUpdate);

    // Clean up event listeners and interval when component unmounts
    return () => {
      socket.off("userCountUpdate", handleUserCountUpdate);
      clearInterval(interval);
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
          setVisitorIdGenerated(true); // Set the state to true when visitorId is generated
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
    setIsLoading(true); // Set loading to true when starting validation

    if (!visitorIdGenerated || !visitorIdRef.current) {
      setError(
        "Please wait for your VisitorID to be generated or refresh the page."
      );
      setIsLoading(false);
      return;
    }

    // First, check if the username is special
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/validate-special-username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.toLowerCase(),
            token: specialToken,
          }),
        }
      );

      const data = await response.json();

      // If it's a special username and no token provided yet
      if (
        data.message === "Invalid token for this special username." &&
        !showPasswordInput
      ) {
        setShowPasswordInput(true);
        setIsLoading(false);
        setError("This username requires a token. Please enter it.");
        return;
      }

      // If token was provided but invalid
      if (!data.success && showPasswordInput) {
        setError(data.message || "Invalid token for this username.");
        setIsLoading(false);
        return;
      }

      // If validation passed or username is not special, continue with normal flow
      if (username.trim() !== "" && over18 && agreeTerms) {
        const currentVisitorId = visitorIdRef.current;

        if (!currentVisitorId) {
          setError("VisitorID is not available. Please refresh the page.");
          setIsLoading(false);
          return;
        }

        socket.emit("startMatch", {
          username,
          interest,
          visitorId: currentVisitorId,
        });
        navigate("/chat", {
          state: { username, interest, visitorId: currentVisitorId },
        });
      } else {
        setError(
          "Please fulfill the age requirement and acknowledge the terms."
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error validating username:", error);
      setError("Server error. Please try again later.");
      setIsLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start items-center bg-[#192734] p-4">
      <Announcement />
      <div className="flex flex-col space-y-4 md:space-y-10 justify-center items-center md:flex-row md:space-x-5">
        <div className="mt-[15vh] md:mt-[20vh] z-10">
          <Shoutout maintenanceMode={maintenanceMode} />
          <div className="bg-[#15202b] p-3 rounded-lg shadow-lg max-w-md w-full md:p-8 ">
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text tracking-tight">
                LeeyosChat
              </h1>

              <div className="space-y-2">
                <p className="text-lg text-gray-200 font-medium">
                  Connect Instantly. Chat Anonymously.
                </p>
                <p className="text-sm text-gray-400">
                  Join thousands of people making meaningful connections
                  worldwide
                </p>
              </div>
            </div>

            {/* Display user count */}
            <div className="text-sm text-gray-300 mb-6 text-center">
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
                  disabled={maintenanceMode}
                  placeholder="What should we call you?"
                  onChange={(e) => {
                    // Get the input value
                    const inputValue = e.target.value;

                    // Remove spaces and limit to 10 characters
                    const filteredValue = inputValue
                      .replace(/\s+/g, "")
                      .slice(0, 20);

                    // Update the state with the filtered value
                    setUsername(filteredValue);
                  }}
                  required
                  className={`w-full px-6 py-3.5 ${
                    maintenanceMode
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gray-800/50"
                  } backdrop-blur-sm border-2 border-gray-700/50 rounded-xl text-white 
                  placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-2 
                  focus:ring-blue-500/20 transition-all duration-300 outline-none`}
                  type="text"
                />

                <div className="relative mt-3">
                  <input
                    id="interest"
                    value={interestInput}
                    disabled={maintenanceMode}
                    placeholder="What are your interests?"
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={handleInterestKeyDown}
                    onBlur={() => {
                      if (interestInput.trim()) {
                        setInterest([...interest, interestInput.trim()]);
                        setInterestInput("");
                      }
                    }}
                    className={`w-full px-6 py-3.5 ${
                      maintenanceMode
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-gray-800/50"
                    } backdrop-blur-sm border-2 border-gray-700/50 rounded-xl text-white 
                    placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-2 
                    focus:ring-blue-500/20 transition-all duration-300 outline-none`}
                    type="text"
                  />
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <FiInfo
                      className={`w-5 h-5 transition-colors ${
                        showTooltip
                          ? "text-blue-400"
                          : "text-gray-400 hover:text-blue-400"
                      }`}
                    />

                    {/* Tooltip */}
                    <div
                      className={`absolute bottom-full right-0 mb-2 w-64 p-3 
                bg-gray-800/90 
                rounded-lg shadow-lg border border-gray-700/50 
                text-xs text-gray-200
                transition-opacity duration-200 
                ${
                  showTooltip ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                    >
                      <div className="relative">
                        Our website's logic will try to find people who share
                        the same interests as you. If no match is found with the
                        same interests, you will be paired with a random person.
                        <div className="absolute -bottom-2 right-4 w-2 h-2 bg-gray-800/90 backdrop-blur-sm border-r border-b border-gray-700/50 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Display the interests as tags with remove buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {interest.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-1.5 px-3 py-1.5 
        bg-blue-500/10 text-blue-400 rounded-full text-sm
        border border-blue-500/20 hover:border-blue-500/40 transition-all"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveInterest(index)}
                        className="text-blue-400/60 hover:text-blue-400 transition-colors"
                      >
                        ×
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
                    placeholder={
                      username.toLowerCase() === "admin"
                        ? "Enter admin password"
                        : "Enter special username token"
                    }
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSpecialToken(e.target.value); // Set both password and special token
                    }}
                    required
                    className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-6 py-3 text-base hover:border-[#fff] cursor-pointer transition w-full"
                    type="password"
                  />
                </div>
              )}

              {/* Checkboxes */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-3 group cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer hidden"
                      checked={over18}
                      onChange={() => setOver18(!over18)}
                    />
                    <div
                      className="w-5 h-5 border-2 border-gray-600 rounded-md 
      peer-checked:bg-blue-500 peer-checked:border-blue-500 
      transition-all duration-200"
                    >
                      {over18 && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    I am over 18 years old
                  </span>
                </label>

                <label
                  htmlFor="agreeTerms"
                  className="flex items-center space-x-3 group cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      className="peer hidden"
                      checked={agreeTerms}
                      onChange={() => setAgreeTerms(!agreeTerms)}
                      required
                    />
                    <div
                      className="w-5 h-5 border-2 border-gray-600 rounded-md 
      peer-checked:bg-blue-500 peer-checked:border-blue-500 
      group-hover:border-gray-500
      transition-all duration-200"
                    >
                      {agreeTerms && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-blue-400 hover:text-blue-300 transition-colors underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded"
                    >
                      Terms of Service
                    </button>
                  </span>
                </label>
              </div>

              {!showTerms && (
                <button
                  type="submit"
                  disabled={!visitorIdGenerated || isLoading || maintenanceMode}
                  className={`
                  w-full py-3.5 rounded-xl font-medium text-sm
                  transition-all duration-300
                  ${
                    maintenanceMode
                      ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                      : visitorIdGenerated && !isLoading
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  }
                  relative overflow-hidden group
                `}
                >
                  <span className="relative z-10">
                    {maintenanceMode
                      ? "System Under Maintenance"
                      : !visitorIdGenerated
                      ? "Generating Visitor ID..."
                      : isLoading
                      ? "Loading..."
                      : "Are you ready?"}
                  </span>
                  <div
                    className={`
                    absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 
                    translate-y-full group-hover:translate-y-0 transition-transform duration-300
                    ${maintenanceMode ? "hidden" : ""}
                  `}
                  />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      <Ads />
      {/* Conditional Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500"
            >
              &times;
            </button>
            <Ads isModalOpen={isModalOpen} onClose={handleCloseModal} />
          </div>
        </div>
      )}
      {/* <Survey /> */}
      {visitorIdGenerated && (
        <div className="w-full max-w-md mx-auto">
          <ReportHistory visitorId={localStorage.getItem("visitorId")} />
        </div>
      )}
      <HOS />
      <FAQ />
      <div className="mt-8 mb-6">
        <button
          onClick={handleReportClick}
          className="group relative inline-flex items-center justify-center px-6 py-3 
    bg-gradient-to-r from-orange-500 to-red-500 
    rounded-xl text-white font-medium shadow-lg 
    hover:shadow-orange-500/25 transition-all duration-200 
    overflow-hidden"
        >
          {/* Background animation on hover */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500 to-orange-500 
      opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />

          {/* Icon and text container */}
          <div className="relative flex items-center space-x-2">
            <FaFlag className="w-4 h-4 text-white/90" />
            <span className="tracking-wide">Report an Issue</span>
          </div>

          {/* Subtle shine effect */}
          <div
            className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 
      -translate-x-full group-hover:translate-x-[400%] transition-transform duration-700"
          />
        </button>

        {/* Optional tooltip */}
        <p className="text-center text-sm text-gray-400 mt-2">
          Found a bug? Let us know!
        </p>
      </div>
      <footer className="w-full py-6 bg-transparent text-white">
        <div className="max-w-screen-sm mx-auto px-4">
          <div className="flex items-center justify-center space-x-6 border-t border-gray-700 pt-6">
            <a
              href="https://www.facebook.com/profile.php?id=61560553714601"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#1877F2] transition-colors duration-300"
              aria-label="Facebook"
            >
              <FaFacebook size={18} />
            </a>
            <span className="text-xs text-gray-400">|</span>
            <p className="text-xs text-gray-400">© 2024 Leeyos.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
