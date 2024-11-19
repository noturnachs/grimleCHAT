import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Add AnimatePresence

function Shoutout() {
  const [shoutouts, setShoutouts] = useState([]);
  const [currentShoutoutIndex, setCurrentShoutoutIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [remainingShoutouts, setRemainingShoutouts] = useState(null);
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const VerifiedBadge = () => (
    <svg
      className="w-3 h-3 text-blue-400 fill-current"
      viewBox="0 0 24 24"
      aria-label="Verified account"
    >
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
    </svg>
  );
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
      // English sexual terms
      /h[o0]rn[yi3]/i, // horny
      /h[4a]rn[yi3]/i, // h4rny
      /h[o0]rn[e3]y/i, // horney
      /f[u0]ck/i, // fuck
      /f[4u]ck/i, // f4ck
      /s[e3]x/i, // sex
      /l[i1]b[o0]g/i, // libog
      /k[a@]nt[o0]t/i, // kantot
      /n[0o]d[0o]s/i, // nudes
      /fubu/i, // fubu
      /hook[ups]?/i, // hookups
      /s[0o]m[0o]n[0o]s/i, // somn0s (slang for sexual acts)

      // Tagalog/Cebuano sexual terms
      /s3x/i, // s3x (common slang)
      /[l1]ibog/i, // libog (arousal)
      /[kq]antot/i, // kantot (to have sex)
      /[b8]ab[a@]e/i, // babe
      /[b8]oy/i, // boy
      /[s5]exy/i, // sexy
      /[s5]exy[ ]?time/i, // sexy time
      /[s5]exy[ ]?girl/i, // sexy girl
      /[s5]exy[ ]?boy/i, // sexy boy
      /[s5]exy[ ]?babe/i, // sexy babe
      /[s5]exy[ ]?fubu/i, // sexy fubu
      /[s5]exy[ ]?hookup/i, // sexy hookup
      /[s5]exy[ ]?partner/i, // sexy partner
      /[s5]exy[ ]?friend/i, // sexy friend

      // Phrases related to finding sex
      /find[ ]?fubu/i, // find fubu
      /find[ ]?hookup/i, // find hookup
      /looking[ ]?for[ ]?sex/i, // looking for sex
      /looking[ ]?for[ ]?fubu/i, // looking for fubu
      /looking[ ]?for[ ]?hookup/i, // looking for hookup
      /searching[ ]?for[ ]?sex/i, // searching for sex
      /searching[ ]?for[ ]?fubu/i, // searching for fubu
      /searching[ ]?for[ ]?hookup/i, // searching for hookup

      /h[\W_]*o[\W_]*r[\W_]*n[\W_]*y/i, // h-o-r-n-y, h o r n y, h_o_r_n_y, etc.
      /h[\W_]*o[\W_]*r[\W_]*n[yi3]/i, // h-o-r-n-y, h o r n y, h_o_r_n[yi3], etc.
      /h[\W_]*r[\W_]*n[\W_]*y/i, // h-r-n-y, h_r_n_y, etc.
      /h[\W_]*r[\W_]*n[4a]/i, // h-r-n4, h_r_n4, etc.

      /h[-o0]r[-n]y/i, // h-o-r-n-y, h0rny, h0rn-y, etc.
      /h[-o0]r[-n][yi3]/i, // h-o-r-n-y, h0rny, h0rn[yi3], etc.
      /h[-o0]rn[-yi3]/i, // h-o-rn-y, h0rn[yi3], etc.
      /h[-o0]rn[4a]/i, // h-o-rn4, etc.
    ];

    // Check if any banned pattern is found in the text
    return bannedPatterns.some((pattern) => pattern.test(normalizedText));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const trimmedMessage = message.trim();
    const trimmedUsername = username.trim();

    if (!trimmedMessage) {
      setError("Please enter a message");
      setIsSubmitting(false);
      return;
    }

    if (!trimmedUsername) {
      setError("Please enter a username");
      setIsSubmitting(false);
      return;
    }

    if (
      containsInappropriateContent(trimmedMessage) ||
      containsInappropriateContent(trimmedUsername)
    ) {
      setError("Please keep the content appropriate");
      setIsSubmitting(false);
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

      // Clear the message input and show success
      setMessage("");
      setSuccessMessage("Shoutout posted successfully!");

      // Add the new shoutout to the existing shoutouts array
      const newShoutout = {
        message: `${message.trim()} [from ${username.trim()}]`,
        created_at: new Date().toISOString(),
      };

      setShoutouts((prevShoutouts) =>
        shuffleArray([newShoutout, ...prevShoutouts])
      );
      setCurrentShoutoutIndex(0);
      checkRemainingShoutouts();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error posting shoutout:", error);
      setError("Failed to post shoutout");
    } finally {
      setIsSubmitting(false);
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
      {remainingShoutouts !== null ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-xl font-bold text-white mb-4">To Everyone</h1>
            {/* Status Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-2 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Want to say something? Share your thoughts with everyone..."
              maxLength={100}
              disabled={isSubmitting}
              className="w-full text-sm px-4 py-2 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 
              rounded-xl text-white placeholder:text-gray-400 
              focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
              transition-all duration-300 outline-none resize-none
              disabled:opacity-50 disabled:cursor-not-allowed"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="From?"
                disabled={isSubmitting}
                maxLength={20}
                className="flex-1 text-sm px-4 py-2 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 
             rounded-xl text-white placeholder:text-gray-400 
             focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
             transition-all duration-300 outline-none
             disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
             transition-colors text-sm font-medium whitespace-nowrap
             disabled:opacity-50 disabled:cursor-not-allowed
             flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Posting...
                  </>
                ) : (
                  "Post Shoutout"
                )}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {remainingShoutouts} shoutouts remaining today
              </span>
              <span className="text-xs text-red-300 italic">
                Shoutouts only last for 20 minutes
              </span>
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
                  let displayUsername = match ? match[1] : "Anonymous";

                  // Check for admin signature
                  const isAdmin = displayUsername.startsWith("**/");
                  if (isAdmin) {
                    displayUsername = displayUsername.replace("**/", ""); // Remove the admin signature
                  }

                  const cleanMessage = message
                    .replace(/\[from .*?\]$/, "")
                    .trim();

                  return (
                    <>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full w-fit flex items-center gap-1">
                        from {isAdmin && <VerifiedBadge />} {displayUsername}
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
