import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import userStyles from "./userStyles.json";
import { MinimalAudioPlayer } from "./CustomAudioPlayer";
import { motion } from "framer-motion";
import { FaReply } from "react-icons/fa";

function Chat({ messages, setIsImageEnlarged, onReply, typingStatus }) {
  const { state } = useLocation();
  const username = state?.username || "Anonymous";
  const chatEndRef = useRef(null);
  const messageRefs = useRef({});
  const chatContainerRef = useRef(null);

  const [enlargedImages, setEnlargedImages] = useState([]); // State to track the enlarged images
  const [currentIndex, setCurrentIndex] = useState(0); // State to track the current image index
  const [showReplyButton, setShowReplyButton] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [replyPreviews, setReplyPreviews] = useState({});

  const [showLinkConfirm, setShowLinkConfirm] = useState(false);
  const [pendingLink, setPendingLink] = useState(null);

  const sparkleGlowAnimation = `
  @keyframes shine {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 200%;
    }
  }
  
  @keyframes glowGold {
    0%, 100% { 
      text-shadow: 0 0 4px #ffd700, 0 0 11px #ffd700, 0 0 19px #ffd700;
    }
    50% { 
      text-shadow: 0 0 4px #ffd700, 0 0 15px #ffd700, 0 0 25px #ffd700;
    }
  }

  @keyframes glowPurple {
    0%, 100% { 
      text-shadow: 0 0 4px #c27eff, 0 0 11px #c27eff, 0 0 19px #c27eff;
    }
    50% { 
      text-shadow: 0 0 4px #c27eff, 0 0 15px #c27eff, 0 0 25px #c27eff;
    }
  }

  @keyframes sparkleStars {
    0%, 100% { 
      opacity: 1;
      transform: scale(1);
    }
    50% { 
      opacity: 0.4;
      transform: scale(0.8);
    }
  }
`;

  const getSpecialStyle = (style) => {
    const styles = {
      gold: {
        gradient: "linear-gradient(90deg, #ffd700, #fff6a9, #ffd700)",
        sparkleColor: "#ffd700",
        glowAnimation:
          "shine 3s linear infinite, glowGold 2s ease-in-out infinite",
      },
      purple: {
        gradient: "linear-gradient(90deg, #c27eff, #e2bdff, #c27eff)",
        sparkleColor: "#ffd700", // Changed to gold for the stars
        glowAnimation:
          "shine 3s linear infinite, glowPurple 2s ease-in-out infinite",
      },
    };
    return styles[style];
  };

  const renderUsername = (messageUsername, isAdmin) => {
    // Define username styles
    const specialStyles = {
      slin: "purple",
      admin: "gold", // This will now have purple text with gold stars
    };

    const style = specialStyles[messageUsername];
    if (style) {
      const styleConfig = getSpecialStyle(style);
      return (
        <>
          <style>{sparkleGlowAnimation}</style>
          <span className="relative inline-block">
            {/* Sparkle elements - now using ✯ for a more ornate star */}
            <span
              style={{
                position: "absolute",
                top: "-4px",
                left: "-4px",
                content: "✯",
                color: styleConfig.sparkleColor,
                animation: "sparkleStars 1.5s ease-in-out infinite",
                fontSize: "0.8em",
              }}
            >
              ✯
            </span>
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                content: "✯",
                color: styleConfig.sparkleColor,
                animation: "sparkleStars 1.5s ease-in-out infinite 0.2s",
                fontSize: "0.8em",
              }}
            >
              ✯
            </span>
            {/* Main username text */}
            <span
              style={{
                background: styleConfig.gradient,
                backgroundSize: "200% auto",
                color: "transparent",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                animation: styleConfig.glowAnimation,
                fontWeight: "bold",
                padding: "0 4px",
                display: "inline-block",
              }}
            >
              {messageUsername}
            </span>
            {/* Bottom sparkle */}
            <span
              style={{
                position: "absolute",
                bottom: "-4px",
                left: "50%",
                transform: "translateX(-50%)",
                content: "✯",
                color: styleConfig.sparkleColor,
                animation: "sparkleStars 1.5s ease-in-out infinite 0.4s",
                fontSize: "0.8em",
              }}
            >
              ✯
            </span>
          </span>
        </>
      );
    }
    return messageUsername;
  };

  // Add this function to handle link clicks
  const handleLinkClick = (e, link) => {
    e.preventDefault();
    setPendingLink(link);
    setShowLinkConfirm(true);
  };

  // Add this function to handle link confirmation
  const handleLinkConfirm = () => {
    if (pendingLink) {
      window.open(pendingLink, "_blank", "noopener,noreferrer");
    }
    setShowLinkConfirm(false);
    setPendingLink(null);
  };

  // Add this function to process text and convert links to clickable elements
  const processMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts
      .map((part, index) => {
        if (part.match(urlRegex)) {
          return `<a href="${part}" class="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1" onclick="return false;">
          ${part}
          <span class="inline-block"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></svg></span>
        </a>`;
        }
        return part;
      })
      .join("");
  };

  useEffect(() => {
    messages.forEach((message) => {
      if (
        message.replyTo &&
        message.replyTo.type === "image" &&
        message.replyTo.preview
      ) {
        if (message.replyTo.preview instanceof ArrayBuffer) {
          const blob = new Blob([message.replyTo.preview], {
            type: "image/jpeg",
          });
          const url = URL.createObjectURL(blob);
          setReplyPreviews((prev) => ({ ...prev, [message.id]: url }));
        }
      }
    });

    return () => {
      // Cleanup: revoke object URLs
      Object.values(replyPreviews).forEach(URL.revokeObjectURL);
    };
  }, [messages]);

  const renderImage = (image, imgIndex, messageImages) => {
    let imageSrc;

    if (typeof image === "string") {
      imageSrc = image;
    } else if (image instanceof Blob) {
      imageSrc = URL.createObjectURL(image);
    } else if (image instanceof ArrayBuffer) {
      // Convert ArrayBuffer to Blob
      const blob = new Blob([image], { type: "image/jpeg" }); // Assume JPEG, adjust if needed
      imageSrc = URL.createObjectURL(blob);
    } else if (typeof image === "object") {
      if (image.data) {
        imageSrc = `data:image/jpeg;base64,${image.data}`;
      } else if (image.url) {
        imageSrc = image.url;
      } else if (image.buffer) {
        imageSrc = `data:image/jpeg;base64,${Buffer.from(image.buffer).toString(
          "base64"
        )}`;
      } else {
        console.error(
          `Unsupported image object format for image ${imgIndex}:`,
          image
        );
        return null;
      }
    } else {
      console.error(`Unsupported image format for image ${imgIndex}:`, image);
      return null;
    }

    return (
      <motion.div
        key={imgIndex}
        className="relative w-20 h-28 object-cover rounded-lg overflow-hidden cursor-pointer"
        initial={{ opacity: 0, x: -10 * imgIndex }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: imgIndex * 0.1 }}
        style={{ zIndex: imgIndex }}
        onClick={() => handleImageClick(messageImages, imgIndex)}
      >
        <img
          src={imageSrc}
          alt={` ${imgIndex + 1}`}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            console.error(`Error loading image ${imgIndex}:`, e);
            e.target.src = "/path/to/fallback/image.jpg"; // Replace with a valid fallback image path
          }}
          onLoad={() => {
            if (image instanceof Blob || image instanceof ArrayBuffer) {
              URL.revokeObjectURL(imageSrc);
            }
          }}
        />
      </motion.div>
    );
  };

  const handleMouseEnter = (index) => {
    if (window.innerWidth > 768) {
      // Only for desktop
      setShowReplyButton(index);
    }
  };

  const scrollToMessage = (messageId) => {
    setTimeout(() => {
      const messageElement = messageRefs.current[messageId];
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        console.log("Message element not found:", messageId);
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      // Only for desktop
      setShowReplyButton(null);
    }
  };

  const handleTouchStart = (index) => {
    const timer = setTimeout(() => {
      setShowReplyButton(index);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
  };

  const handleReply = (message) => {
    onReply({
      id: message.id,
      username: message.username,
      content:
        message.messageText ||
        (message.images ? "Image" : null) ||
        (message.audio ? "Voice Message" : null) ||
        (message.gif ? "GIF" : null) ||
        (message.sticker ? "Sticker" : null) ||
        "Message",
      type: message.messageText
        ? "text"
        : message.images
        ? "image"
        : message.audio
        ? "audio"
        : message.gif
        ? "gif"
        : message.sticker
        ? "sticker"
        : "unknown",
      preview: message.images ? message.images[0] : null, // Add this line to include image preview
    });
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageClick = (images, index) => {
    // Convert images to an array of URLs if they're not already
    const imageUrls = images
      .map((image) => {
        if (typeof image === "string") return image;
        if (image instanceof Blob) return URL.createObjectURL(image);
        if (image instanceof ArrayBuffer) {
          const blob = new Blob([image], { type: "image/jpeg" });
          return URL.createObjectURL(blob);
        }
        if (typeof image === "object") {
          if (image.data) return `data:image/jpeg;base64,${image.data}`;
          if (image.url) return image.url;
          if (image.buffer)
            return `data:image/jpeg;base64,${Buffer.from(image.buffer).toString(
              "base64"
            )}`;
        }
        console.error("Unsupported image format:", image);
        return null;
      })
      .filter((url) => url !== null);

    setEnlargedImages(imageUrls);
    setCurrentIndex(index);
    setIsImageEnlarged(true);
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
      <div ref={chatContainerRef} className="flex flex-col space-y-4  h-full ">
        {messages.map((message, index) => {
          const isSender = message.username === username;
          const isAdmin = message.isAdmin; // Add this line
          return (
            <div
              key={message.id}
              ref={(el) => {
                if (el) messageRefs.current[message.id] = el;
              }}
              className={`flex ${
                isSender ? "justify-end" : "justify-start"
              } relative `}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => handleTouchStart(index)}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex-col">
                <span
                  className="font-normal"
                  style={{
                    ...getUsernameStyles(message.username),
                  }}
                >
                  {renderUsername(message.username, isAdmin)}{" "}
                </span>

                {message.replyTo && (
                  <div
                    className="bg-gray-700 p-2 rounded-lg mb-1 text-sm cursor-pointer"
                    onClick={() => scrollToMessage(message.replyTo.id)}
                  >
                    <p className="text-gray-400 font-semibold text-xs">
                      Replying to {message.replyTo.username}
                    </p>
                    {message.replyTo.type === "image" &&
                    message.replyTo.preview ? (
                      <img
                        src={
                          replyPreviews[message.id] || message.replyTo.preview
                        }
                        alt="Rs"
                        className="w-16 h-16 object-cover rounded mt-1"
                      />
                    ) : (
                      <p className="text-white">{message.replyTo.content}</p>
                    )}
                  </div>
                )}
                {message.images && message.images.length > 0 ? (
                  <div className="relative p-2 rounded-xl max-w-xs z-0">
                    <div className="flex items-center space-x-[-12px]">
                      {message.images.map((image, imgIndex) => {
                        return renderImage(image, imgIndex, message.images);
                      })}
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
                    className={`p-2 rounded-xl max-w-xs ${
                      isAdmin ? "bg-red-500 text-white" : ""
                    }`} // Add admin styling
                    style={{
                      ...(!isAdmin
                        ? getMessageStyles(message.username, isSender)
                        : {}),
                      wordBreak: "break-word",
                    }}
                  >
                    <p
                      className="text-sm font-normal"
                      dangerouslySetInnerHTML={{
                        __html: processMessageText(message.messageText), // Update this line
                      }}
                      onClick={(e) => {
                        const clickedLink = e.target.closest("a");
                        if (clickedLink) {
                          handleLinkClick(e, clickedLink.href);
                        }
                      }}
                      style={{
                        color: isAdmin
                          ? "white"
                          : getMessageStyles(message.username, isSender).color,
                      }}
                    />
                  </div>
                )}
              </div>
              {showReplyButton === index && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleReply(message)}
                  className="text-gray-500 hover:text-gray-300 p-1 rounded-full bg-gray-800 bg-opacity-50 self-end mb-1"
                >
                  <FaReply size={13} />
                </motion.button>
              )}
            </div>
          );
        })}
        {typingStatus.typing && (
          <div className="flex justify-start relative w-full">
            <div className="flex-col max-w-[70%]">
              <span
                className="font-normal"
                style={getUsernameStyles(typingStatus.username)}
              >
                {typingStatus.username}
              </span>
              <div
                className="bg-gray-700 p-2 rounded-xl mb-2 text-sm flex items-center justify-center"
                style={{ minHeight: "40px", minWidth: "60px" }}
              >
                <l-leapfrog size="20" speed="2.5" color="#9ca3af"></l-leapfrog>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} className="h-4 pt-1" />
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

      {showLinkConfirm && (
        <div className="fixed inset-0 z-[1001] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-white text-lg font-semibold mb-4">
              External Link
            </h3>
            <p className="text-gray-300 mb-4">
              You will be redirected to:
              <br />
              <span className="text-blue-400 break-all">{pendingLink}</span>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLinkConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;
