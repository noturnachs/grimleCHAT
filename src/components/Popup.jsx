import React, { useEffect, useState, useRef } from "react";

const Popup = ({ message, onClose }) => {
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

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden z-50 transition-all duration-300 ease-in-out border border-gray-300 ">
      <div className="bg-indigo-600 px-4 py-2 flex justify-between items-center">
        <h1 className="text-white font-semibold text-sm">Admin Message</h1>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <div
        ref={messageRef}
        className="px-4 py-3 overflow-y-auto"
        style={{ maxHeight: "200px", overflowY: "auto" }}
      >
        <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Popup;
