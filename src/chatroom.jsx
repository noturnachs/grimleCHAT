import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import socket from "./socket"; // Import the singleton socket instance
import Chat from "./components/chat";
import ChatInput from "./components/chatInput";
import { lineWobble, leapfrog } from "ldrs";
import { loadingTexts } from "./loadingTexts"; // Import the loading texts
import { FaTimes } from "react-icons/fa";

lineWobble.register();
leapfrog.register();

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [room, setRoom] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Start Finding a Match");
  const [loading, setLoading] = useState(false); // Loading state
  const [countdown, setCountdown] = useState(5); // Countdown for finding users with the same interest
  const { state } = useLocation();
  const navigate = useNavigate();
  const username = state?.username || null;
  const interest = state?.interest || [];
  const [initialStart, setInitialStart] = useState(true);
  const [fromChat, setFromChat] = useState(false);
  const [prevUsernameLeft, setPrevUsernameLeft] = useState(""); // Track the username of the previous user who left
  const [typingStatus, setTypingStatus] = useState({}); // Track typing status

  const socketRef = useRef(socket);
  const chatContainerRef = useRef(null); // Ref for the chat container

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(
          loadingTexts[Math.floor(Math.random() * loadingTexts.length)]
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading]);

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

    const handleMatchFound = ({
      room,
      username: matchedUsername,
      interest,
    }) => {
      setRoom(room);
      setLoadingMessage("Start Finding a Match");
      setLoading(false);

      // Initial system message
      const newMessages = [
        {
          username: "System",
          messageText: `Connected with <strong>${matchedUsername}</strong>`,
        },
      ];

      // Add interest message if provided
      if (interest) {
        newMessages.push({
          username: "System",
          messageText: interest,
        });
      }

      setMessages(newMessages);
    };

    const handleUserLeft = ({ message, username: leftUsername }) => {
      setRoom(null);
      setMessages([]);
      setLoadingMessage("Find Again?");
      setLoading(false);
      setFromChat(true);
      setPrevUsernameLeft(leftUsername);
      setTypingStatus({}); // Reset typing status when a user leaves
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
  }, [loadingMessage, navigate, username]);

  useEffect(() => {
    if (loading && countdown > 0 && interest.length > 0) {
      setLoadingMessage("Finding people with the same interests...");
      const countdownInterval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        setLoadingMessage(
          "No people with the same interest, matching you with a random person..."
        );
        socket.emit("startMatch", { username, interest: [] }); // Emit the startMatch event for random matching
        setCountdown(0);
      }, countdown * 1000);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(timeout);
      };
    }
  }, [loading, countdown, socket, username, interest]);

  const startMatch = () => {
    setInitialStart(false);
    setFromChat(false);
    setLoading(true);
    setPrevUsernameLeft("");
    if (interest.length > 0) {
      setCountdown(5); // Reset countdown
      setLoadingMessage("Finding people with the same interests...");
    } else {
      setLoadingMessage("Finding a random match...");
      socket.emit("startMatch", { username, interest: [] });
    }
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
      socket.emit("leaveRoom");
      setRoom(null);
      setMessages([]);
      setTypingStatus({}); // Reset typing status when chat ends
    }
    setLoadingMessage("Find Again?");
    setLoading(false);
    setFromChat(true);
  };

  const handleCancel = () => {
    socket.emit("leaveQueue", username);
    setTypingStatus({}); // Reset typing status when canceling
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
            } text-white font-normal p-1 rounded text-md`}
            disabled={loading} // Disable button when loading
          >
            {loading ? loadingMessage : "Start Finding a Match"}
          </button>
          {loading && (
            <l-line-wobble
              size="80"
              stroke="5"
              bg-opacity="0.1"
              speed="1.75"
              color="green"
              className="inline-block ml-2"
            ></l-line-wobble>
          )}
          <button
            onClick={handleCancel}
            className="mt-6 inline-flex items-center p-2 text-red-600 transition ease-in-out delay-75 hover:bg-red-300 text-sm font-medium rounded-md hover:-translate-y-1 hover:scale-110"
          >
            <FaTimes size={20} /> {/* Replace text with the icon */}
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden justify-center items-center">
          <div
            className="scrollable-chat w-full md:w-1/2 bg-[#212e3a]"
            ref={chatContainerRef}
          >
            <Chat messages={messages} />
            {typingStatus.typing && (
              <div className="flex items-center">
                <span className="text-gray-400 ml-2 text-xs">
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
