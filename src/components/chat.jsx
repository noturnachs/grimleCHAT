import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import userStyles from "./userStyles.json";
import { MinimalAudioPlayer } from "./CustomAudioPlayer";

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

              {message.audio ? (
                <div className="p-2 rounded-xl max-w-xs">
                  <MinimalAudioPlayer src={message.audio} />
                </div>
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
                    dangerouslySetInnerHTML={{ __html: message.messageText }}
                    style={{
                      color:
                        message.username === "admin"
                          ? getMessageStyles(message.username, isSender).color
                          : getMessageStyles(message.username, isSender).color,
                    }}
                  />
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
