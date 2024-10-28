import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#192734] text-white p-4">
      <div className="bg-[#15202b] p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl mb-6">Page Not Found</p>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#325E87] hover:bg-[#4a7fb3] text-white font-normal py-2 px-6 rounded-md transition-colors duration-300"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
