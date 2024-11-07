import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BanPage = () => {
  const [visitorId, setVisitorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        // Retrieve the visitor ID from localStorage
        const storedVisitorId = localStorage.getItem("visitorId");
        setVisitorId(storedVisitorId);

        // Check if user is actually banned
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_ORIGIN}/api/identify-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ visitorId: storedVisitorId }),
          }
        );

        if (response.status !== 403) {
          // If user is not banned (status !== 403), redirect to home
          navigate("/");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking ban status:", error);
        navigate("/");
      }
    };

    checkBanStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  // Rest of your component remains the same
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-red-500">
          Access Restricted
        </h1>
        <p className="text-lg mb-6">
          Your access to this platform has been restricted due to a violation of
          our community guidelines.
        </p>
        <p className="text-sm text-gray-400 mb-4">
          If you believe this action was taken in error, please reach out to our
          support team for further assistance.{" "}
          <span className="font-bold text-red-400">support@leeyos.com</span>
        </p>
        {visitorId && (
          <p className="text-sm text-gray-300 mt-4">
            Your Visitor ID:{" "}
            <span className="font-mono bg-gray-700 px-2 py-1 rounded">
              {visitorId}
            </span>
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Please include this ID in any correspondence with our support team.
        </p>
      </div>
    </div>
  );
};

export default BanPage;
