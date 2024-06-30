import React, { useState, useRef } from "react";

function ChatInput({ sendMessage, onEndChat, disabled }) {
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
      buttonRef.current.focus(); // Focus on the input field after sending message
    }
  };

  return (
    <div className="p-2 bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          ref={buttonRef}
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={disabled} // Disable input field when partner has left
          className="flex-grow p-2 mr-2 bg-gray-700 text-white rounded"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={disabled} // Disable send button when partner has left
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
        <button
          type="button"
          onClick={handleEndChatClick}
          className="bg-red-500 text-white p-2 rounded ml-2"
        >
          {confirmEndChat ? "Confirm" : "End Chat"}
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
