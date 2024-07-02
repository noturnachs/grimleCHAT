import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import userStyles from "./userStyles.json";

function Chat({ messages }) {
  const { state } = useLocation();
  const username = state?.username || "Anonymous";
  const connectedWith = messages.length > 0 ? messages[0].username : null;
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get styles from JSON file for usernames
  const getUsernameStyles = (messageUsername) => {
    const styles = userStyles.styles.usernames;
    return styles[messageUsername] || styles.default;
  };

  // Get styles from JSON file for messages
  const getMessageStyles = (messageUsername) => {
    const styles = userStyles.styles.messages;
    return styles[messageUsername] || styles.default;
  };

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.username === username ? "justify-end" : "justify-start"
          }`}
        >
          <div className="flex-col">
            <span
              className="font-normal"
              style={{
                ...getUsernameStyles(message.username),
              }}
            >
              {message.username}
            </span>
            <div
              className="p-2 rounded-xl max-w-xs"
              style={{
                ...getMessageStyles(message.username),
                wordBreak: "break-word",
              }}
            >
              <p
                className="text-sm font-normal"
                style={{
                  color:
                    message.username === "admin"
                      ? getMessageStyles(message.username).color
                      : getMessageStyles().color,
                }}
              >
                {message.messageText}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}

export default Chat;
