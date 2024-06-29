import React from "react";
import { useLocation } from "react-router-dom";

function Chat({ messages }) {
  const { state } = useLocation();
  const username = state?.username || "Anonymous";

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.username === username ? "justify-end" : "justify-start"
          }`}
        >
          <div className="flex-col">
            <span className="text-[12px] font-normal text-gray-500">
              {message.username}
            </span>
            <div
              className={`p-2 rounded-xl max-w-xs ${
                message.username === username
                  ? "bg-blue-500 text-white"
                  : "bg-[#222222] text-white"
              }`}
            >
              <p className="text-sm font-normal text-white">
                {message.messageText}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Chat;
