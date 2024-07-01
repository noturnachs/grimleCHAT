import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import socket from "./socket"; // Import the singleton socket instance
import Chat from "./components/chat";
import ChatInput from "./components/chatInput";
import { jellyTriangle, leapfrog } from "ldrs";

jellyTriangle.register();
leapfrog.register();

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
  const [typingStatus, setTypingStatus] = useState({}); // Track typing status

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
    "Scouting the area...",
    "Searching nearby...",
    "Widening the search...",
    "Checking all the usual spots...",
    "Looking for someone who shares your interests...",
    "Finding someone who gets your jokes...",
    "Matching you with someone who's just as awesome...",
    "Seeking out a compatible connection...",
    "Calculating compatibility...",
    "Analyzing your profile...",
    "Comparing your interests...",
    "Finding your perfect match...",
    "Piecing together your puzzle...",
    "Building your connection...",
    "Establishing a link...",
    "Making introductions...",
    "Breaking the ice...",
    "Starting the conversation...",
    "Laying the groundwork...",
    "Planting the seeds of friendship...",
    "Fostering a connection...",
    "Cultivating a bond...",
    "Creating chemistry...",
    "Building a bridge...",
    "Sparking a conversation...",
    "Connecting the dots...",
    "Weaving a connection...",
    "Igniting a spark...",
    "Creating a match made in heaven...",
    "We're on the hunt for your perfect match...",
    "Your perfect match is out there somewhere...",
    "Don't worry, we'll find them for you...",
    "We're working hard to find you a compatible partner...",
    "We're leaving no stone unturned...",
    "We're scouring the earth for your soulmate...",
    "We're using all our resources to find you a match...",
    "We're not giving up until we find you the perfect match...",
    "We're confident that we'll find you someone special...",
    "Your perfect match is just around the corner...",
    "Be patient, your perfect match is on their way...",
    "The wait is almost over...",
  ];

  const socketRef = useRef(socket);
  const chatContainerRef = useRef(null); // Ref for the chat container

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleUserCountUpdate = (count) => {
      setUserCount(count);
    };

    const handleTyping = ({ username: typingUsername, typing }) => {
      if (typingUsername !== username) {
        setTypingStatus({ username: typingUsername, typing });
      }
    };

    const handleMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleMatchFound = ({ room, username: matchedUsername }) => {
      setRoom(room);
      setLoadingMessage("Start Finding a Match");
      setLoading(false);
      setMessages([
        {
          username: "System",
          messageText: `Connected with ${matchedUsername}`,
        },
      ]);
    };

    const handleUserLeft = ({ message, username: leftUsername }) => {
      setRoom(null);
      setMessages([]);
      setLoadingMessage("Find Again?");
      setLoading(false);
      setFromChat(true);
      setPrevUsernameLeft(leftUsername);
    };

    const handleBeforeUnload = () => {
      socket.emit("leaveRoom", username);
      navigate("/");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    socket.on("userCountUpdate", handleUserCountUpdate);
    socket.on("typing", handleTyping);
    socket.on("message", handleMessage);
    socket.on("matchFound", handleMatchFound);
    socket.on("userLeft", handleUserLeft);

    const interval = setInterval(() => {
      if (
        loadingMessage !== "Start Finding a Match" &&
        loadingMessage !== "Find Again?"
      ) {
        const randomIndex = Math.floor(Math.random() * loadingTexts.length);
        setLoadingMessage(loadingTexts[randomIndex]);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.off("userCountUpdate", handleUserCountUpdate);
      socket.off("typing", handleTyping);
      socket.off("message", handleMessage);
      socket.off("matchFound", handleMatchFound);
      socket.off("userLeft", handleUserLeft);
    };
  }, [loadingMessage, navigate, username, loadingTexts, fromChat]);
  const startMatch = () => {
    setLoadingMessage(loadingTexts[0]);
    setInitialStart(false);
    setFromChat(false);
    setLoading(true);
    setPrevUsernameLeft("");
    socket.emit("startMatch", username);
  };

  const sendMessage = (messageText) => {
    if (messageText.trim() !== "" && room) {
      socket.emit("sendMessage", {
        room,
        message: { username, messageText },
      });
    }
  };

  const onEndChat = () => {
    if (room) {
      socket.emit("leaveRoom", username);
      setRoom(null);
      setMessages([]);
    }
    setLoadingMessage("Find Again?");
    setLoading(false);
    setFromChat(true);
  };

  const handleCancel = () => {
    navigate("/");
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
              size="50"
              speed="1.50"
              color="#04d9ff"
              className="inline-block ml-2"
            ></l-jelly-triangle>
          )}
          <button
            onClick={handleCancel}
            className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 transition ease-in-out delay-75 hover:bg-red-700 text-white text-sm font-medium rounded-md hover:-translate-y-1 hover:scale-110"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="scrollable-chat" ref={chatContainerRef}>
            <Chat messages={messages} />
            {typingStatus.typing && (
              <div className="flex items-center">
                <span className="text-gray-400 ml-2">
                  {typingStatus.username} is typing&nbsp;
                </span>
                <l-leapfrog size="20" speed="2.5" color="#9ca3af"></l-leapfrog>
              </div>
            )}
          </div>
          <ChatInput
            sendMessage={sendMessage}
            onEndChat={onEndChat}
            socket={socketRef.current}
            room={room}
            username={username}
          />
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
