import React, { useEffect, useState } from "react";

const Popup = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 10000); // Auto-close after 10 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-4 z-50 text-center">
      <button onClick={onClose} className="absolute top-1 right-2 text-black">
        ×
      </button>
      <h1 className="font-extrabold text-black text-sm">Admin</h1>
      <p className="whitespace-pre-wrap break-words font-bold text-black text-sm">
        {message}
      </p>
    </div>
  );
};

export default Popup;
