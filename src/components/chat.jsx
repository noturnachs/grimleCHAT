import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

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

  return (
    <div className="flex flex-col space-y-4">
      {/* {connectedWith && (
        <div className="text-center text-white py-2">
          Connected with {connectedWith}
        </div>
      )} */}
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
                  : "bg-[#434242] text-white transparent"
              }`}
            >
              <p className="text-sm font-normal text-white">
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
