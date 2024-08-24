import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import autosize from "autosize";

function ChatInput({
  sendMessage,
  onEndChat,
  disabled,
  socket,
  room,
  username,
}) {
  const [messageText, setMessageText] = useState("");
  const [confirmEndChat, setConfirmEndChat] = useState(false);
  const buttonRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const springConfig = { stiffness: 300, damping: 20 };
  const scaleSpring = useSpring(0, springConfig);
  const scaleTransform = useTransform(scaleSpring, (value) =>
    value > 0 ? 1 + value / 10 : 1
  );

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const handleEndChatClick = () => {
    if (confirmEndChat) {
      if (socket) {
        console.log(username, "leaving room", room);
        socket.emit("leaveRoom", { room, username });

        setIsTyping(false);
        socket.emit("typing", { room, username, typing: false });
      }
      onEndChat();
    } else {
      setConfirmEndChat(true);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(messageText);
    setMessageText("");

    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (socket) {
      if (!isTyping) {
        setIsTyping(true);
        scaleSpring.set(1);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socket.emit("typing", { room, username, typing: true });

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit("typing", { room, username, typing: false });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear typing status when component unmounts
      if (isTyping && socket) {
        socket.emit("typing", { room, username, typing: false });
      }
    };
  }, [isTyping, socket, room, username]);

  return (
    <div className="p-4 bg-[#192734] w-full md:w-1/2 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <motion.button
          type="button"
          onClick={handleEndChatClick}
          className="bg-red-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 h-full"
        >
          {confirmEndChat ? "Confirm" : "End"}
        </motion.button>
        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-grow px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm resize-none"
          placeholder="Type your message..."
          rows={1}
        />
        <motion.button
          type="submit"
          disabled={disabled}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ scale: scaleTransform }}
          whileTap={{ scale: 1.1 }}
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}

export default ChatInput;
