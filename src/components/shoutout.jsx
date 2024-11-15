import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Add AnimatePresence

function Shoutout() {
  const [shoutouts, setShoutouts] = useState([]);
  const [currentShoutoutIndex, setCurrentShoutoutIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [remainingShoutouts, setRemainingShoutouts] = useState(5);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchShoutouts();
    checkRemainingShoutouts();
  }, []);

  const fetchShoutouts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/shoutouts`
      );
      const data = await response.json();
      setShoutouts(shuffleArray(data.shoutouts));
    } catch (error) {
      console.error("Error fetching shoutouts:", error);
    }
  };

  const checkRemainingShoutouts = async () => {
    try {
      const visitorId = localStorage.getItem("visitorId");
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/shoutouts/remaining/${visitorId}`
      );
      const data = await response.json();
      setRemainingShoutouts(data.remaining);
    } catch (error) {
      console.error("Error checking remaining shoutouts:", error);
    }
  };

  // Add this function near your other utility functions
  const containsInappropriateContent = (text) => {
    // Convert text to lowercase and remove spaces for checking
    const normalizedText = text.toLowerCase().replace(/\s+/g, "");

    // List of banned words and their variations
    const bannedPatterns = [
      /h[o0]rn[yi3]/, // matches: horny, h0rny, h0rni, etc.
      /h[4a]rn[yi3]/, // matches: h4rny, harny, etc.
      /h[o0]rn[e3]y/, // matches: horney, h0rney, etc.
    ];

    // Check if any banned pattern is found in the text
    return bannedPatterns.some((pattern) => pattern.test(normalizedText));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedMessage = message.trim();
    const trimmedUsername = username.trim();
    if (!trimmedMessage) {
      setError("Please enter a message");
      return;
    }

    if (!trimmedUsername) {
      setError("Please enter a username");
      return;
    }

    // Check both username and message for inappropriate content
    if (
      containsInappropriateContent(trimmedMessage) ||
      containsInappropriateContent(trimmedUsername)
    ) {
      setError("Please keep the content appropriate");
      return;
    }

    try {
      const visitorId = localStorage.getItem("visitorId");
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/shoutouts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `${message.trim()} [from ${username.trim()}]`,
            visitorId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to post shoutout");
        return;
      }

      // Clear the message input
      setMessage("");

      // Add the new shoutout to the existing shoutouts array
      const newShoutout = {
        message: `${message.trim()} [from ${username.trim()}]`,
        created_at: new Date().toISOString(),
      };

      // Update shoutouts state with the new message
      setShoutouts((prevShoutouts) =>
        shuffleArray([newShoutout, ...prevShoutouts])
      );

      // Reset the current index to show the new message
      setCurrentShoutoutIndex(0);

      // Update remaining shoutouts
      checkRemainingShoutouts();
    } catch (error) {
      console.error("Error posting shoutout:", error);
      setError("Failed to post shoutout");
    }
  };
  // Add function to shuffle array
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Add effect to rotate through shoutouts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShoutoutIndex((prevIndex) =>
        prevIndex === shoutouts.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change shoutout every 5 seconds

    return () => clearInterval(interval);
  }, [shoutouts.length]);

  return (
    <div className="bg-[#15202b] rounded-lg shadow-lg p-4 mb-4 max-w-md mx-auto flex flex-col">
      {remainingShoutouts > 0 ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col space-y-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Want to say something? Share your thoughts with everyone..."
              maxLength={100}
              className="w-full text-sm px-4 py-2 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 
                     rounded-xl text-white placeholder:text-gray-400 
                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                     transition-all duration-300 outline-none resize-none"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                maxLength={20}
                className="flex-1 text-sm px-4 py-2 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 
                     rounded-xl text-white placeholder:text-gray-400 
                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                     transition-all duration-300 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     transition-colors text-sm font-medium whitespace-nowrap"
              >
                Post
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {remainingShoutouts} shoutouts remaining today
              </span>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400 text-sm">
            You've used all your shoutouts for today.
          </p>
        </div>
      )}

      {/* Single Shoutout Display with Animation */}
      {shoutouts && shoutouts.length > 0 && (
        <div className="relative mb-4 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShoutoutIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              className="bg-gray-800/50 p-3 rounded-lg w-full"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col space-y-1"
              >
                {/* Extract username from message with safety checks */}
                {(() => {
                  const currentShoutout = shoutouts[currentShoutoutIndex];
                  if (!currentShoutout?.message) return null;

                  const message = currentShoutout.message;
                  const match = message.match(/\[from (.*?)\]$/);
                  const displayUsername = match ? match[1] : "Anonymous";
                  const cleanMessage = message
                    .replace(/\[from .*?\]$/, "")
                    .trim();

                  return (
                    <>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full w-fit">
                        from {displayUsername}
                      </span>
                      <div className="w-full max-w-md">
                        <p className="text-white text-sm break-all whitespace-pre-wrap overflow-hidden">
                          {cleanMessage}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
              {shoutouts[currentShoutoutIndex]?.created_at && (
                <div className="flex justify-between items-center mt-2">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-400 text-xs"
                  >
                    {new Date(
                      shoutouts[currentShoutoutIndex].created_at
                    ).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </motion.span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default Shoutout;
