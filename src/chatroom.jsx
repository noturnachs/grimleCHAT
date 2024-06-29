import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import io from "socket.io-client";
import Chat from "./components/chat";
import ChatInput from "./components/chatInput";

// Use the environment variable for the server URL
const SERVER_ORIGIN =
  process.env.REACT_APP_SERVER_ORIGIN || "http://localhost:3001";

const socket = io(SERVER_ORIGIN, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000, // 20 seconds
});

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Start Match");
  const { state } = useLocation();
  const navigate = useNavigate();
  const username = state?.username || null;
  const [initialStart, setInitialStart] = useState(true);
  const [fromChat, setFromChat] = useState(false);
  const loadingTexts = [
    "Waiting for partner...",
    "Looking for your soulmate...",
    "Finding a match...",
    "Connecting you to someone <3...",
  ];

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
      }, 1000);
    }

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("matchFound", ({ room, username: matchedUsername }) => {
      setRoom(room);
      setLoadingMessage("Start Match"); // Reset to default when match is found
      console.log(`Matched with ${matchedUsername} in room ${room}`);
      setMessages([
        {
          username: "System",
          messageText: `Connected with ${matchedUsername}`,
        },
      ]);
    });

    socket.on("userLeft", ({ message }) => {
      setRoom(null);
      setMessages([]);
      console.log(message);
      setLoadingMessage("Find Again?");
      setFromChat(true);
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
      setLoadingMessage("Find Again?");
      setFromChat(true);
    }
  };

  const cancelMatch = () => {
    navigate("/");
  };

  if (!username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-[#192734] h-screen flex flex-col">
      {!room ? (
        <div className="flex flex-col items-center justify-center h-full">
          <button
            onClick={startMatch}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4"
          >
            {initialStart || fromChat ? loadingMessage : loadingMessage}
          </button>
          <button
            onClick={cancelMatch}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded"
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
