import React, { useState, useEffect } from "react";
import { FaBan, FaSkull } from "react-icons/fa";

function HOS() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannedUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_ORIGIN}/api/banned-users`
        );
        const data = await response.json();

        const sortedUsers = data.sort(
          (a, b) => new Date(b.bannedAt) - new Date(a.bannedAt)
        );
        setBannedUsers(sortedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching banned users:", error);
        setLoading(false);
      }
    };

    fetchBannedUsers();

    const interval = setInterval(fetchBannedUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-[#15202b] p-6 rounded-lg shadow-lg mt-10 max-w-md w-full">
        <div className="text-gray-400 text-center">
          Loading the wall of shame...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#15202b] p-6 rounded-lg shadow-lg mt-10 max-w-md w-full">
      <h2 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-2">
        <FaBan className="animate-pulse" />
        Hall of Shame
      </h2>

      {bannedUsers.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          <FaSkull className="text-4xl mx-auto mb-4 opacity-50" />
          <p>The hall stands empty... for now.</p>
        </div>
      ) : (
        <div
          className="space-y-4 max-h-[400px] overflow-y-auto pr-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(239, 68, 68, 0.2) rgba(31, 41, 55, 0.2)",
          }}
        >
          {bannedUsers.map((user, index) => (
            <div
              key={`${user.id}-${user.bannedAt}-${index}`}
              className="bg-[#192734] p-4 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <FaSkull className="text-red-500" size={12} />
                    {user.username}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{user.banReason}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Banned on: {new Date(user.bannedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-center text-gray-500">
        Breaking chat rules has consequences. Don't end up here.
        {bannedUsers.length > 5 && (
          <div className="mt-1 text-red-500/60">
            Scroll to see more banned users...
          </div>
        )}
      </div>
    </div>
  );
}

export default HOS;
