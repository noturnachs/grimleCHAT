import React, { useState, useRef } from "react";

function ChatInput({ sendMessage, onEndChat }) {
  const [messageText, setMessageText] = useState("");
  const [confirmEndChat, setConfirmEndChat] = useState(false);
  const buttonRef = useRef(null);

  const handleEndChatClick = () => {
    if (confirmEndChat) {
      onEndChat(); // End the chat
    } else {
      setConfirmEndChat(true); // Show confirmation message
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    sendMessage(messageText);
    setMessageText("");

    if (buttonRef.current) {
      buttonRef.current.classList.add("animate-bounce");
      setTimeout(() => {
        buttonRef.current.classList.remove("animate-bounce");
      }, 500);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" bottom-0 left-0 w-full bg-[#192734] p-2"
    >
      <div className="flex items-center rounded-full bg-transparent p-3 shadow-sm border-2 border-[#38444d]">
        <button
          type="button"
          onClick={handleEndChatClick}
          className={`mr-4 rounded-full px-4 py-2 hover:bg-[#961614] 
                        ${
                          confirmEndChat
                            ? "bg-[#961614] text-white"
                            : "bg-[#e02421] text-white"
                        }`}
        >
          {confirmEndChat ? "Are you sure?" : "End Chat"}
        </button>

        <div className="flex-grow">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write a message..."
            className="w-full rounded-full py-2 px-4 focus:outline-none bg-transparent text-[#e7e9ea]"
          />
        </div>

        <button
          type="submit"
          ref={buttonRef}
          className="ml-4 text-[#1d9bf0] font-semibold rounded-full px-4 py-2 hover:bg-[#1a8cd8] hover:text-white"
        >
          Send
        </button>
      </div>
    </form>
  );
}

export default ChatInput;
