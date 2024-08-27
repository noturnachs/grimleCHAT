import React from "react";

const Popup = ({ message, onClose }) => {
  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-[200px] bg-[#384d61] bg-opacity-80 shadow-lg p-4 transition-transform animate-slide-down z-[9999] mt-5 rounded">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-red-500 text-lg font-bold"
      >
        &times;
      </button>
      <h1 className="font-extrabold text-[#ff9927] text-sm">Admin</h1>
      <p className="whitespace-pre-wrap break-words font-bold text-white text-sm">
        {message}
      </p>
    </div>
  );
};

export default Popup;
