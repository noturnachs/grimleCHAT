import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import userStyles from "./userStyles.json";
import { MinimalAudioPlayer } from "./CustomAudioPlayer";
import { motion } from "framer-motion";

function Chat({ messages, setIsImageEnlarged }) {
  const { state } = useLocation();
  const username = state?.username || "Anonymous";
  const chatEndRef = useRef(null);
  const [enlargedImages, setEnlargedImages] = useState([]); // State to track the enlarged images
  const [currentIndex, setCurrentIndex] = useState(0); // State to track the current image index

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageClick = (images, index) => {
    setEnlargedImages(images);
    setCurrentIndex(index);
    setIsImageEnlarged(true); // Set image enlarged state to true
  };

  const handleNextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === enlargedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? enlargedImages.length - 1 : prevIndex - 1
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("overlay")) {
      setEnlargedImages([]);
      setIsImageEnlarged(false); // Reset image enlarged state to false
    }
  };

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
    <>
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
                {message.images && message.images.length > 0 ? (
                  <div className="relative p-2 rounded-xl max-w-xs z-0">
                    <div className="flex items-center space-x-[-12px]">
                      {message.images.map((image, imgIndex) => (
                        <motion.div
                          key={imgIndex}
                          className="relative w-20 h-28 object-cover rounded-lg overflow-hidden cursor-pointer"
                          initial={{ opacity: 0, x: -10 * imgIndex }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: imgIndex * 0.1 }}
                          style={{ zIndex: imgIndex }}
                          onClick={() =>
                            handleImageClick(message.images, imgIndex)
                          }
                        >
                          <img
                            src={image}
                            alt={`stacked ${imgIndex}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : message.audio ? (
                  <div className="p-2 rounded-xl max-w-xs z-0">
                    <MinimalAudioPlayer src={message.audio} />
                  </div>
                ) : message.gif ? ( // Check if the message contains a GIF
                  <div className="p-2 rounded-xl max-w-xs">
                    <img
                      src={message.gif}
                      alt="GIF"
                      className="w-full h-auto rounded-lg" // Style the GIF
                    />
                  </div>
                ) : message.sticker ? ( // Check if the message contains a sticker
                  <div className="p-2 rounded-xl max-w-xs">
                    <img
                      src={message.sticker}
                      alt="Sticker"
                      className="w-full h-auto rounded-lg" // Style the sticker
                    />
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
                        color: getMessageStyles(message.username, isSender)
                          .color,
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
      {/* Enlarged image overlay */}
      {enlargedImages.length > 0 && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-90 overlay"
          onClick={handleOverlayClick} // Close the enlarged image on click outside the image
        >
          <img
            src={enlargedImages[currentIndex]}
            alt="Enlarged"
            className="max-w-[90%] max-h-[90%] rounded-lg" // Set max width and height
          />
          <button
            onClick={handlePreviousImage}
            className="absolute left-4 text-white text-2xl p-2 bg-black bg-opacity-50 rounded-full focus:outline-none"
          >
            &#8249;
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white text-2xl p-2 bg-black bg-opacity-50 rounded-full focus:outline-none"
          >
            &#8250;
          </button>
        </div>
      )}
    </>
  );
}

export default Chat;
