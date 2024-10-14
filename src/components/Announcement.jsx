import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import DOMPurify from "dompurify";

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

    socket.on("announcementUpdate", (newAnnouncement) => {
      setAnnouncement(newAnnouncement);
    });

    return () => {
      socket.off("announcementUpdate");
    };
  }, []);

  const createMarkup = (htmlContent) => {
    // Replace newline characters with <br> tags
    const contentWithLineBreaks = htmlContent.replace(/\n/g, "<br>");
    return {
      __html: DOMPurify.sanitize(contentWithLineBreaks, {
        ADD_ATTR: ["style"],
      }),
    };
  };

  return (
    <div className="w-full bg-blue-500 text-white text-center p-2 fixed top-0 z-50">
      <div dangerouslySetInnerHTML={createMarkup(announcement)} />
    </div>
  );
}

export default Announcement;
