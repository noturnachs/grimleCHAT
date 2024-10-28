import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import DOMPurify from "dompurify";
import blooddrip from "./GIFS/blood drip.gif";

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
    <>
      {/* default bg bg-blue-500 */}
      <div
        className="w-full text-white text-center p-2 fixed top-0 z-50 animate-gradient"
        style={{
          background: "linear-gradient(45deg, #cc0000, #a80202, #780404)",
          backgroundSize: "200% 200%",
          animation: "gradient 15s ease infinite",
        }}
      >
        {" "}
        <div dangerouslySetInnerHTML={createMarkup(announcement)} />
      </div>
      <div className="w-full fixed top-[32px] left-0 z-40">
        <img
          src={blooddrip}
          alt="blood drip"
          className="w-full h-auto object-contain"
        />
      </div>
    </>
  );
}

export default Announcement;
