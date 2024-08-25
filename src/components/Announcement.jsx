import React, { useState, useEffect } from "react";
import socket from "../socket"; // Import the singleton socket instance

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

function Announcement() {
  const [announcement, setAnnouncement] = useState("Welcome to LeeyosChat!");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`${SERVER_ORIGIN}/announcement`);
        const data = await response.json();
        setAnnouncement(data.announcement);
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };

    fetchAnnouncement();

    // Listen for real-time updates via socket
    socket.on("announcementUpdate", (newAnnouncement) => {
      setAnnouncement(newAnnouncement);
    });

    return () => {
      socket.off("announcementUpdate");
    };
  }, []);

  return (
    <div className="w-full bg-blue-500 text-white text-center p-2 fixed top-0 z-50">
      {announcement}
    </div>
  );
}

export default Announcement;
