import React, { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion"; // Add framer-motion for smooth animations

const Popup = ({ message, onClose, isHtml }) => {
  const [isVisible, setIsVisible] = useState(true);
  const messageRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 8000); // Auto-close after 8 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    if (messageRef.current) {
      const height = messageRef.current.scrollHeight;
      messageRef.current.style.maxHeight = `${Math.min(height, 200)}px`; // Max height of 200px
    }
  }, [message]);

  if (!isVisible) return null;

  const createMarkup = (content) => {
    if (!content) return { __html: "" }; // Handle undefined or null content
    const contentWithLineBreaks = content.replace(/\\n/g, "<br>");
    return isHtml
      ? {
          __html: DOMPurify.sanitize(contentWithLineBreaks, {
            ADD_ATTR: ["style"],
          }),
        }
      : { __html: contentWithLineBreaks };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-x-0 top-0 z-50 p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto mx-auto max-w-md w-full"
          >
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <h1 className="text-white font-medium text-sm">
                    Admin Message
                  </h1>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors duration-200 
                           hover:bg-white/10 rounded-full p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Message Content */}
              <div
                ref={messageRef}
                className="px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md overflow-y-auto"
                style={{ maxHeight: "40vh" }} // Limit height on mobile
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  {message ? (
                    <div
                      className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed break-words"
                      dangerouslySetInnerHTML={createMarkup(message)}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No message to display
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Progress Bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 8, ease: "linear" }}
                className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 origin-left"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
