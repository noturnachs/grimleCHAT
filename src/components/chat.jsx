import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import userStyles from "./userStyles.json";

function Chat({ messages }) {
  const { state } = useLocation();
  const username = state?.username || "Anonymous";
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
  const getMessageStyles = (messageUsername, isSender) => {
    const styles = userStyles.styles.messages;
    if (messageUsername === "admin" || messageUsername === "System") {
      return styles.admin;
    }
    return isSender ? styles.sender : styles.receiver;
  };

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message, index) => {
        const isSender = message.username === username;
        return (
          <div
            key={index}
            className={`flex ${isSender ? "justify-end" : "justify-start"}`}
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

              {message.username === "System" ? (
                <div
                  className="p-2 rounded-xl max-w-xs text-sm"
                  style={{
                    ...getMessageStyles(message.username, isSender),
                    wordBreak: "break-word",
                  }}
                  dangerouslySetInnerHTML={{ __html: message.messageText }} // Allow HTML rendering for System messages
                />
              ) : (
                <div
                  className="p-2 rounded-xl max-w-xs"
                  style={{
                    ...getMessageStyles(message.username, isSender),
                    wordBreak: "break-word",
                  }}
                >
                  <p
                    className="text-sm font-normal"
                    style={{
                      color:
                        message.username === "admin"
                          ? getMessageStyles(message.username, isSender).color
                          : getMessageStyles(message.username, isSender).color,
                    }}
                  >
                    {message.messageText}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );
}

export default Chat;
