import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import socket from "./socket"; // Import the singleton socket instance
import Chat from "./components/chat";
import ChatInput from "./components/chatInput";
import { lineWobble, leapfrog, squircle } from "ldrs";
import { loadingTexts } from "./loadingTexts"; // Import the loading texts
import { FaTimes, FaInfoCircle } from "react-icons/fa";
import Sidebar from "./components/Sidebar"; // Import Sidebar from a separate file
import Popup from "./components/Popup"; // Import the Popup component
import Confetti from "react-confetti"; // Import Confetti

lineWobble.register();
leapfrog.register();
squircle.register();

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [partnerVisitorId, setPartnerVisitorId] = useState(null);
  const [partnerUsername, setPartnerUsername] = useState(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false); // New state to track if an image is enlarged
  const [showConfetti, setShowConfetti] = useState(false); // State to control confetti display
  const [room, setRoom] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Start Finding a Match");
  const [loading, setLoading] = useState(false); // Loading state
  const [countdown, setCountdown] = useState(5); // Countdown for finding users with the same interest
  const { state } = useLocation();
  const navigate = useNavigate();

  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Added state variables for reporting
  const [reportReason, setReportReason] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const username = state?.username || null;
  const interest = state?.interest || [];
  const [initialStart, setInitialStart] = useState(true);
  const [fromChat, setFromChat] = useState(false);
  const [prevUsernameLeft, setPrevUsernameLeft] = useState(""); // Track the username of the previous user who left
  const [typingStatus, setTypingStatus] = useState({}); // Track typing status
  const sidebarRef = useRef(null); // Ref for the sidebar container

  const socketRef = useRef(socket);
  const chatContainerRef = useRef(null); // Ref for the chat container

  useEffect(() => {
    const handleTriggerEffect = ({ effect }) => {
      console.log("Effect triggered:", effect);
      if (effect === "confetti") {
        socket.emit("confettiTriggered", { room });
      }
    };

    socket.on("triggerEffect", handleTriggerEffect);

    return () => {
      socket.off("triggerEffect", handleTriggerEffect);
    };
  }, [socket, room]);

  useEffect(() => {
    socket.on("confettiTriggered", () => {
      console.log("Confetti effect received");
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // Show confetti for 5 seconds
    });

    return () => {
      socket.off("confettiTriggered");
    };
  }, [socket]);

  useEffect(() => {
    const socketInstance = socketRef.current; // Use the socket reference

    socketInstance.on("telegramMessage", (data) => {
      showPopup(data.message);
    });

    return () => {
      socketInstance.off("telegramMessage"); // Cleanup the event listener
    };
  }, []);
  // Function to show popup with message from Telegram bot
  const showPopup = (message) => {
    setPopupMessage(message);
    setIsPopupVisible(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setIsPopupVisible(false);
  };
  // Redirect to home if no username is present
  useEffect(() => {
    if (!state || !state.username) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    if (chatContainerRef.current && room) {
      chatContainerRef.current.scrollTop = 0; // Scroll to the top when match is found
    }
  }, [room]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleReportSubmit = async () => {
    setIsSubmittingReport(true); // Start loader and disable input
    setReportError(null);
    setReportSuccess(null);

    const formData = new FormData();
    formData.append("visitorId", partnerVisitorId);
    formData.append("reason", reportReason);

    if (screenshot) {
      formData.append("screenshot", screenshot);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/report-user`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setReportSuccess(
          "Report sent successfully. You can end the chat if you want."
        );
        setReportError(null);
      } else {
        const errorData = await response.json();
        setReportError(errorData.message || "Failed to send report.");
        setReportSuccess(null);
      }
    } catch (error) {
      console.error("Error reporting user:", error);
      setReportError("An error occurred while sending the report.");
      setReportSuccess(null);
    }

    setIsSubmittingReport(false); // Stop loader
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Check if the socket is connected
        if (!socket.connected) {
          console.log("Reconnecting socket...");
          socket.connect(); // Reconnect the socket
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleScreenshotChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setScreenshot(file);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false); // Close sidebar if clicked outside
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup the event listener
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(
          loadingTexts[Math.floor(Math.random() * loadingTexts.length)]
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleUserCountUpdate = (count) => {
      setUserCount(count);
    };

    const handleTyping = ({ username: typingUsername, typing }) => {
      if (typingUsername !== username) {
        setTypingStatus({ username: typingUsername, typing });
      }
    };

    const handleMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      // Removed title change logic
    };

    const handleMatchFound = ({
      room,
      username: matchedUsername,
      interest,
      partnerVisitorId, // Capture the partner's visitorId
    }) => {
      setRoom(room);
      setLoadingMessage("Start Finding a Match");
      setLoading(false);

      setPartnerVisitorId(partnerVisitorId);
      setPartnerUsername(matchedUsername); // Store the matched user's name

      const newMessages = [
        {
          username: "System",
          messageText: `Connected with <strong>${matchedUsername}</strong>`,
        },
      ];

      if (interest) {
        newMessages.push({
          username: "System",
          messageText: interest,
        });
      }

      setMessages(newMessages);
    };

    const handleUserLeft = ({ message, username: leftUsername }) => {
      setRoom(null);
      setMessages([]);
      setLoadingMessage("Find Again?");
      setLoading(false);
      setFromChat(true);
      setPrevUsernameLeft(leftUsername);
      setTypingStatus({}); // Reset typing status when a user leaves
    };

    const handleBeforeUnload = () => {
      socket.emit("leaveRoom", username);
      navigate("/");
    };

    const handleBanned = ({ message }) => {
      alert(message); // Display an alert to the user
      navigate("/"); // Redirect them back to the home page
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    socket.on("userCountUpdate", handleUserCountUpdate);
    socket.on("typing", handleTyping);
    socket.on("message", handleMessage);
    socket.on("matchFound", handleMatchFound);
    socket.on("userLeft", handleUserLeft);
    socket.on("banned", handleBanned); // Listen for the "banned" event

    const interval = setInterval(() => {
      if (
        loadingMessage !== "Start Finding a Match" &&
        loadingMessage !== "Find Again?"
      ) {
        const randomIndex = Math.floor(Math.random() * loadingTexts.length);
        setLoadingMessage(loadingTexts[randomIndex]);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.off("userCountUpdate", handleUserCountUpdate);
      socket.off("typing", handleTyping);
      socket.off("message", handleMessage);
      socket.off("matchFound", handleMatchFound);
      socket.off("userLeft", handleUserLeft);
      socket.off("banned", handleBanned); // Cleanup the "banned" event listener
    };
  }, [loadingMessage, navigate, username]);

  useEffect(() => {
    if (loading && countdown > 0 && interest.length > 0) {
      setLoadingMessage("Finding people with the same interests...");
      const countdownInterval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        setLoadingMessage(
          "No people with the same interest, matching you with a random person..."
        );
        socket.emit("startMatch", { username, interest: [] }); // Emit the startMatch event for random matching
        setCountdown(0);
      }, countdown * 1000);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(timeout);
      };
    }
  }, [loading, countdown, socket, username, interest]);

  const startMatch = () => {
    setInitialStart(false);
    setFromChat(false);
    setLoading(true);
    setPrevUsernameLeft("");
    if (interest.length > 0) {
      setCountdown(5); // Reset countdown
      setLoadingMessage("Finding people with the same interests...");
    } else {
      setLoadingMessage("Finding a random match...");
    }

    const visitorId = state?.visitorId; // Get the visitorId from the state
    socket.emit("startMatch", { username, interest, visitorId });
  };

  const sendMessage = (message) => {
    if (room) {
      // Destructure message properties
      const { messageText, gif, sticker } = message; // Include sticker
      const messageData = {
        room,
        message: {
          username,
          messageText: messageText || "", // Default to empty string if not provided
          gif: gif || null, // Include gif if it exists
          sticker: sticker || null, // Include sticker if it exists
        },
      };

      // Emit the message to the server
      socket.emit("sendMessage", messageData);
    }
  };
  const onEndChat = () => {
    if (room) {
      socket.emit("leaveRoom");
      setRoom(null);
      setMessages([]);
      setTypingStatus({}); // Reset typing status when chat ends
    }
    setLoadingMessage("Find Again?");
    setLoading(false);
    setFromChat(true);
  };

  const handleCancel2 = () => {
    setIsSidebarOpen(false);
    setReportReason("");
    setScreenshot(null);
    setReportError(null);
    setReportSuccess(null);
  };

  const handleCancel = () => {
    socket.emit("leaveQueue", username);
    setTypingStatus({}); // Reset typing status when canceling
    navigate("/");
  };

  if (!username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-[#192734] h-screen flex flex-col">
      {showConfetti && <Confetti />}
      {isPopupVisible && <Popup message={popupMessage} onClose={closePopup} />}
      {!room ? (
        <div className="flex flex-col items-center justify-center h-full">
          {prevUsernameLeft && (
            <div className="text-white mb-4">
              {prevUsernameLeft} left the chat.
            </div>
          )}
          <button
            onClick={startMatch}
            className={`${
              loading ? "bg-transparent mb-5" : "bg-blue-500 mb-1"
            } text-white font-normal p-1 rounded text-md`}
            disabled={loading} // Disable button when loading
          >
            {loading ? loadingMessage : "Start Finding a Match"}
          </button>
          {loading && (
            <l-line-wobble
              size="80"
              stroke="5"
              bg-opacity="0.1"
              speed="1.75"
              color="green"
              className="inline-block ml-2"
            ></l-line-wobble>
          )}
          <button
            onClick={handleCancel}
            className="mt-6 inline-flex items-center p-2 text-red-600 transition ease-in-out delay-75 hover:bg-red-300 text-sm font-medium rounded-md hover:-translate-y-1 hover:scale-110"
          >
            <FaTimes size={20} /> {/* Replace text with the icon */}
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden justify-center items-center">
          <div
            className="scrollable-chat w-full md:w-1/2 bg-[#212e3a] relative z-0"
            ref={chatContainerRef}
          >
            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="fixed top-4 right-4 text-white flex items-center space-x-2 z-10"
            >
              <FaInfoCircle size={20} color="#dc3545" />
            </button>
            {isSidebarOpen && (
              <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportSubmit={handleReportSubmit}
                handleScreenshotChange={handleScreenshotChange}
                handleCancel2={handleCancel2}
                screenshot={screenshot}
                reportError={reportError}
                reportSuccess={reportSuccess}
                isSubmittingReport={isSubmittingReport}
                sidebarRef={sidebarRef} // Pass sidebarRef to the Sidebar
                className="z-[9999]"
              />
            )}
            <Chat messages={messages} setIsImageEnlarged={setIsImageEnlarged} />
            {typingStatus.typing && (
              <div className="flex items-center">
                <span className="text-gray-400 ml-2 text-xs">
                  {typingStatus.username} is typing&nbsp;
                </span>
                <l-leapfrog size="20" speed="2.5" color="#9ca3af"></l-leapfrog>
              </div>
            )}
          </div>
          {!isImageEnlarged && (
            <ChatInput
              sendMessage={sendMessage}
              onEndChat={onEndChat}
              socket={socketRef.current}
              room={room}
              username={username}
              isImageEnlarged={isImageEnlarged}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
