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
        socket.emit("leaveRoom", { room, username });
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
    };
  }, []);

  return (
    <div className="p-2 bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center">
        <button
          type="button"
          onClick={handleEndChatClick}
          className="bg-red-500 text-white p-2 rounded mr-2"
        >
          {confirmEndChat ? "Confirm" : "End Chat"}
        </button>
        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-grow p-2 mr-2 bg-gray-700 text-white rounded chat-input scrollbar-custom resize-none"
          placeholder="Type your message..."
          rows={2}
        />
        <motion.button
          type="submit"
          disabled={disabled}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
