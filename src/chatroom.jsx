import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import io from "socket.io-client";
import Chat from "./components/chat";
import ChatInput from "./components/chatInput";
import { jellyTriangle } from "ldrs";

jellyTriangle.register();

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

const socket = io(SERVER_ORIGIN, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000, // 20 seconds
});

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [room, setRoom] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Start Finding a Match");
  const [loading, setLoading] = useState(false); // Loading state
  const { state } = useLocation();
  const navigate = useNavigate();
  const username = state?.username || null;
  const [initialStart, setInitialStart] = useState(true);
  const [fromChat, setFromChat] = useState(false);
  const [prevUsernameLeft, setPrevUsernameLeft] = useState(""); // Track the username of the previous user who left
  const loadingTexts = [
    "Waiting for partner...",
    "Looking for your soulmate...",
    "Finding a match...",
    "Connecting you to someone <3...",
    "Creating a spark...",
    "Searching for the one...",
    "On the hunt for love...",
    "Seeking your perfect pair...",
    "Getting ready for romance...",
    "Preparing for a perfect match...",
    "Igniting a connection...",
    "Building anticipation...",
    "Just a moment longer...",
    "Love is in the air...",
    "Cupid is working his magic...",
    "Your love story is about to begin...",
    "The stars are aligning...",
    "Destiny is calling...",
    "Fate is bringing you closer...",
    "Love is worth the wait...",
    "Matching you with happiness...",
    "Searching high and low for love...",
    "We're almost there...",
    "Patience is a virtue...",
    "Good things come to those who wait...",
    "Love is patient, love is kind...",
    "The best is yet to come...",
    "Your heart will skip a beat soon...",
    "Love is just around the corner...",
    "Get ready to fall in love...",
  ];

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = socket;

    const handleUserCountUpdate = (count) => {
      setUserCount(count);
    };

    // Subscribe to the 'userCountUpdate' event
    socketRef.current.on("userCountUpdate", handleUserCountUpdate);

    // Clean up event listener on component unmount
    return () => {
      socketRef.current.off("userCountUpdate", handleUserCountUpdate);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    let interval;
    if (fromChat && loadingMessage === "Find Again?") {
      // Do not start interval yet
    } else if (
      loadingMessage !== "Start Finding a Match" &&
      loadingMessage !== "Find Again?"
    ) {
      interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * loadingTexts.length);
        setLoadingMessage(loadingTexts[randomIndex]);
      }, 3000);
    }

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("matchFound", ({ room, username: matchedUsername }) => {
      setRoom(room);
      setLoadingMessage("Start Finding a Match"); // Reset to default when match is found
      setLoading(false); // Stop loading animation
      console.log(`Matched with ${matchedUsername} in room ${room}`);
      setMessages([
        {
          username: "System",
          messageText: `Connected with ${matchedUsername}`,
        },
      ]);
    });

    socket.on("userLeft", ({ message, username: leftUsername }) => {
      setRoom(null);
      setMessages([]);
      console.log(message);
      setLoadingMessage("Find Again?");
      setLoading(false); // Stop loading animation
      setFromChat(true);
      setPrevUsernameLeft(leftUsername); // Set the username of the user who left
    });

    // Handle disconnect
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom", username);
      navigate("/");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.off("message");
      socket.off("matchFound");
      socket.off("userLeft");
    };
  }, [loadingMessage, navigate, username, loadingTexts, fromChat]);

  const startMatch = () => {
    if (loadingMessage === "Find Again?") {
      setLoadingMessage(loadingTexts[0]);
      setInitialStart(false);
      setFromChat(false);
    } else {
      setLoadingMessage(loadingTexts[0]);
      setInitialStart(false);
    }
    setLoading(true); // Start loading animation
    setPrevUsernameLeft("");
    socket.emit("startMatch", username);
  };

  const sendMessage = (messageText) => {
    if (messageText.trim() !== "" && room) {
      socket.emit("sendMessage", { room, message: { username, messageText } });
    }
  };

  const onEndChat = () => {
    if (room) {
      socket.emit("leaveRoom", username);
      setRoom(null);
      setMessages([]);
      console.log("You have left the chat and are back in the queue.");
    }
    setLoadingMessage("Find Again?");
    setLoading(false); // Stop loading animation
    setFromChat(true);
    navigate("/"); // Redirect to home
  };

  if (!username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-[#192734] h-screen flex flex-col">
      {!room ? (
        <div className="flex flex-col items-center justify-center h-full">
          {prevUsernameLeft && (
            <div className="text-white mb-4">
              {prevUsernameLeft} left the chat.
            </div>
          )}
          <button
            onClick={startMatch}
            className={`${
              loading ? "bg-transparent mb-5" : "bg-blue-500 mb-1"
            } text-white font-normal p-2 rounded`}
            disabled={loading} // Disable button when loading
          >
            {initialStart || fromChat ? loadingMessage : loadingMessage}
          </button>
          {loading && (
            <l-jelly-triangle
              size="30"
              speed="1.75"
              color="#80c794"
              className="inline-block ml-2"
            ></l-jelly-triangle>
          )}
          <button
            onClick={onEndChat}
            className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 transition ease-in-out delay-75 hover:bg-red-700 text-white text-sm font-medium rounded-md hover:-translate-y-1 hover:scale-110"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="scrollable-chat">
            <Chat messages={messages} />
          </div>
          <ChatInput sendMessage={sendMessage} onEndChat={onEndChat} />
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
