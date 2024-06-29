import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Chat from "./components/chat";
import ChatInput from "./components/chatInput";
import { useLocation } from "react-router-dom"; // Import useLocation

const socket = io("http://localhost:3001");

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const { state } = useLocation();
  const username = state?.username || "Anonymous";

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = (messageText) => {
    if (messageText.trim() !== "") {
      socket.emit("sendMessage", { username, messageText });
    }
  };

  return (
    <div className="bg-zinc-900 h-screen">
      <Chat messages={messages} />
      <ChatInput sendMessage={sendMessage} />
    </div>
  );
}

export default ChatRoom;
