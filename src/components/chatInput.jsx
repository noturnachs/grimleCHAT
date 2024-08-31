import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { FaMicrophone, FaImage, FaTimes, FaPlus, FaStar } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import autosize from "autosize";
import RecordRTC from "recordrtc";
import imageCompression from "browser-image-compression";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";

const giphyFetch = new GiphyFetch("1BhL1pC32fiqXaGE9ckNqzbKYYkgPf3vC"); // Replace with your Giphy API key

function ChatInput({
  sendMessage,
  onEndChat,
  disabled,
  socket,
  room,
  username,
  isImageEnlarged,
}) {
  const [showEffects, setShowEffects] = useState(false); // State to show effects

  const [messageText, setMessageText] = useState("");
  const [confirmEndChat, setConfirmEndChat] = useState(false);

  const [gifs, setGifs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState("");
  const optionsRef = useRef(null);
  const [gifError, setGifError] = useState(""); // Add this state
  const [gifSearchQuery, setGifSearchQuery] = useState(""); // New state for GIF search query

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingError, setRecordingError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState("auto");
  const buttonRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const springConfig = { stiffness: 300, damping: 20 };
  const scaleSpring = useSpring(0, springConfig);
  const [preSavedStickers, setPreSavedStickers] = useState([]);
  const scaleTransform = useTransform(scaleSpring, (value) =>
    value > 0 ? 1 + value / 10 : 1
  );

  const toggleEffects = () => {
    setShowEffects(!showEffects);
  };

  const handleEffectSelect = (effect) => {
    if (effect === "confetti") {
      console.log("Confetti effect selected");
      socket.emit("triggerEffect", { effect: "confetti", room });
      setShowEffects(false); // Close effects menu
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
        setShowGifPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsRef]);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const toggleGifPicker = () => {
    setShowGifPicker(!showGifPicker);
    setGifSearchQuery(""); // Clear the search query when the picker is toggled
    if (!showGifPicker) {
      fetchGifs(); // Fetch GIFs when the picker is opened
    }
  };

  const customFetch = async (fetchFunction) => {
    try {
      return await fetchFunction();
    } catch (error) {
      if (error.message.includes("API rate limit exceeded")) {
        throw new Error("API rate limit exceeded"); // Throw the same error to be caught later
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

  const fetchGifs = async (query = "") => {
    try {
      const { data } = query
        ? await customFetch(() => giphyFetch.search(query, { limit: 10 }))
        : await customFetch(() => giphyFetch.trending({ limit: 10 }));

      setGifs(data);
      setGifError(""); // Clear any previous error message
    } catch (error) {
      if (
        error.message.includes("API rate limit exceeded") ||
        error.message.includes("Unauthorized")
      ) {
        console.log("Giphy broke 😂");
        // Fallback to fetching stickers if GIF fetch fails
        fetchStickers(); // Call the fetchStickers function to get stickers
      } else {
        setGifError("Error loading GIFs. Please try again later.");
      }
    }
  };

  const fetchStickers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/stickers`
      ); // Use the environment variable
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.success) {
        setPreSavedStickers(data.stickers); // Set the stickers from the response
      } else {
        console.error("Failed to fetch stickers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching stickers:", error);
      setError("Error loading stickers. Please try again later.");
    }
  };

  const handleGifSelect = (gif) => {
    // Send the GIF URL as part of the message
    sendMessage({ username, gif: gif.images.original.url }); // Include the username and gif in the message
    setShowGifPicker(false);
  };

  const fileInputRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const handleEndChatClick = () => {
    if (confirmEndChat) {
      if (socket) {
        socket.emit("leaveRoom", { room, username });
        setIsTyping(false);
        socket.emit("typing", { room, username, typing: false });
      }
      onEndChat();
    } else {
      setConfirmEndChat(true);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Only process messageText if it's a string
    const trimmedMessage =
      typeof messageText === "string" ? messageText.trim() : "";

    if (trimmedMessage) {
      sendMessage({ username, messageText: trimmedMessage }); // Send text message
      setMessageText(""); // Clear the text input
    } else if (selectedImages.length > 0) {
      sendImageMessage();
    } else if (isRecording && recordedAudio) {
      sendVoiceMessage();
    }

    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (confirmEndChat) {
      setConfirmEndChat(false); // Reset confirmation state
    }

    if (socket) {
      if (!isTyping) {
        setIsTyping(true);
        scaleSpring.set(1);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socket.emit("typing", { room, username, typing: true });

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit("typing", { room, username, typing: false });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Initialize RecordRTC
      mediaRecorderRef.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        disableLogs: true,
        bitsPerSecond: 128000, // Set bit rate (128 kbps)
      });

      mediaRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingError(null);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);

      setContainerHeight("400px");
    } catch (error) {
      setRecordingError(
        "Unable to start recording. Please check your microphone permissions."
      );
    }
  };

  useEffect(() => {
    socket.on("new-sticker", (newStickerUrl) => {
      setPreSavedStickers((prevStickers) => {
        // Ensure the sticker isn't duplicated
        if (!prevStickers.includes(newStickerUrl)) {
          return [...prevStickers, newStickerUrl];
        }
        return prevStickers;
      });
    });

    return () => {
      socket.off("new-sticker");
    };
  }, [socket]);

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const compressedImages = [];

    // Check if the total number of selected images exceeds 3
    if (selectedImages.length + files.length > 3) {
      setError("You can only upload a maximum of 3 images.");
      return;
    } else {
      setError(""); // Clear error message if within limit
    }

    for (let file of files) {
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        compressedImages.push(compressedFile);
      } catch (error) {
        console.error("Error compressing the image:", error);
      }
    }
    setSelectedImages((prevSelectedImages) => [
      ...prevSelectedImages,
      ...compressedImages,
    ]); // Update state with previous selected images and new compressed ones
  };

  const sendImageMessage = () => {
    if (selectedImages.length > 0) {
      const imagePromises = selectedImages.map((image) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      });

      Promise.all(imagePromises)
        .then((imagesBase64) => {
          socket.emit("sendMessage", {
            room,
            message: {
              username,
              images: imagesBase64, // Send images as an array
            },
          });
          setSelectedImages([]); // Clear selected images after sending
        })
        .catch((error) => {
          console.error("Error converting images to base64:", error);
        });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pauseRecording();
      setIsPaused(true);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resumeRecording();
      setIsPaused(false);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stopRecording(() => {
        const blob = mediaRecorderRef.current.getBlob();
        setRecordedAudio(blob);
        setAudioURL(URL.createObjectURL(blob));
      });

      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const sendVoiceMessage = () => {
    if (recordedAudio) {
      const audioBlob = recordedAudio;
      const reader = new FileReader();

      reader.onloadend = () => {
        const audioBase64 = reader.result;

        socket.emit("sendMessage", {
          room,
          message: {
            username,
            audio: audioBase64,
          },
        });

        resetRecordingState();
      };

      reader.readAsDataURL(audioBlob);
    }
  };

  const resetRecordingState = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    setAudioURL(null);
    setIsRecording(false);
    setIsPaused(false);

    if (mediaRecorderRef.current) {
      const tracks = mediaRecorderRef.current.stream?.getTracks();
      if (tracks) {
        tracks.forEach((track) => track.stop()); // Stops the media tracks
      }
      mediaRecorderRef.current.destroy();
      mediaRecorderRef.current = null;
    }

    setContainerHeight("auto");
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && socket) {
        socket.emit("typing", { room, username, typing: false });
      }
      clearInterval(recordingIntervalRef.current);

      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isTyping, socket, room, username]);

  return (
    <div
      className="relative p-3 pl-2 pr-1 bg-[#192734] w-full md:w-1/2 rounded-lg shadow-md"
      style={{ height: containerHeight, zIndex: 1 }}
    >
      {selectedImages.length > 0 && (
        <div className="flex space-x-2 mb-4">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt="Selected"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <motion.button
                onClick={() => {
                  const newImages = selectedImages.filter(
                    (_, i) => i !== index
                  );
                  setSelectedImages(newImages);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transition-transform transform hover:scale-105 focus:outline-none"
                style={{ lineHeight: 0 }}
              >
                <FaTimes size={12} />
              </motion.button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}{" "}
      {/* Display error message */}
      {isRecording || audioURL ? (
        <div className="absolute inset-0 bg-[#141b22] bg-opacity-100 flex flex-col items-center justify-center z-20 p-4 rounded-lg ">
          {!audioURL ? (
            <>
              <div className="text-white text-lg mb-2">
                {isPaused ? "Paused" : ""} {Math.floor(recordingTime / 60)}:
                {("0" + (recordingTime % 60)).slice(-2)}
              </div>
              <div className="flex flex-row space-x-2 text-lg">
                <motion.button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="bg-yellow-500 text-white p-2 rounded-lg focus:outline-none"
                >
                  {isPaused ? "Resume" : "Pause"}
                </motion.button>
                <motion.button
                  onClick={stopRecording}
                  className="bg-red-500 text-white p-2 rounded-lg focus:outline-none"
                >
                  Stop
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 w-full flex justify-center">
                <CustomAudioPlayer src={audioURL} />
              </div>

              <div className="flex flex-row space-x-2 mt-2 mb-10 text-lg">
                <motion.button
                  onClick={sendVoiceMessage}
                  className="bg-blue-500 text-white p-2  rounded-lg focus:outline-none"
                >
                  Send
                </motion.button>
                <motion.button
                  onClick={resetRecordingState}
                  className="bg-gray-500 text-white p-2 rounded-lg focus:outline-none"
                >
                  Cancel
                </motion.button>
              </div>
            </>
          )}
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-1 z-10 "
      >
        <motion.button
          type="button"
          onClick={handleEndChatClick}
          className=" text-red-500 p-1 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 h-full"
        >
          {confirmEndChat ? "Confirm" : "End"}
        </motion.button>
        <div className="relative " ref={optionsRef}>
          <motion.button
            type="button"
            onClick={toggleOptions} // Toggle the visibility of the additional options
            className="text-white p-1 transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
          >
            <div className={`w-8 h-10 flex items-center justify-center`}>
              <FaPlus size={20} /> {/* Plus Icon */}
            </div>
          </motion.button>

          {/* Conditionally render microphone and image buttons */}
          {showOptions && (
            <div className="absolute flex flex-col space-y-2 bottom-12 left-0 bg-[#1a2631] rounded-lg">
              <motion.button
                type="button"
                onClick={startRecording}
                className="text-white p-1 transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
              >
                <div className={`w-8 h-10 flex items-center justify-center`}>
                  <FaMicrophone size={24} />
                </div>
              </motion.button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="hidden"
                multiple
              />
              <motion.button
                type="button"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                className="text-white p-1 transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
              >
                <div className={`w-8 h-10 flex items-center justify-center`}>
                  <FaImage size={24} />
                </div>
              </motion.button>
              {username === "admin" && (
                <motion.button
                  type="button"
                  onClick={toggleGifPicker}
                  className="text-white p-1 transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
                >
                  <div className={`w-8 h-10 flex items-center justify-center`}>
                    <span>🎉</span>
                  </div>
                </motion.button>
              )}

              {username === "admin" && (
                <motion.button
                  type="button"
                  onClick={toggleEffects}
                  className="text-white p-1 transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
                >
                  <div className={`w-8 h-10 flex items-center justify-center`}>
                    <FaStar size={24} /> {/* Effects Icon */}
                  </div>
                </motion.button>
              )}
              {showEffects && (
                <div className="absolute flex flex-col bottom-12 left-0 bg-[#1a2631] rounded-lg p-2 w-[150px]">
                  <motion.button
                    type="button"
                    onClick={() => handleEffectSelect("confetti")}
                    className="text-white p-1 transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
                  >
                    Confetti
                  </motion.button>
                  {/* Add more effects here if needed */}
                </div>
              )}
              {showGifPicker && (
                <div className="absolute flex flex-col bottom-12 left-0 bg-[#1a2631] rounded-lg p-2 w-[300px] scrollbar-custom">
                  <input
                    type="text"
                    value={gifSearchQuery}
                    onChange={(e) => {
                      setGifSearchQuery(e.target.value);
                      fetchGifs(e.target.value); // Fetch GIFs dynamically as you type
                    }}
                    placeholder="Search GIFs..."
                    className="p-2 mb-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {gifError ? (
                    <p className="text-red-500">{gifError}</p>
                  ) : (
                    <div
                      className="grid grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden"
                      style={{ maxHeight: "300px" }}
                    >
                      {gifs.map((gif) => (
                        <motion.button
                          key={gif.id}
                          onClick={() => handleGifSelect(gif)}
                          className="transition-transform transform hover:scale-105 focus:outline-none"
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            padding: 0,
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <img
                            src={gif.images.fixed_height.url}
                            alt={gif.title}
                            className="rounded-lg w-full h-auto"
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Display pre-saved stickers */}
                  <h3 className="text-white mt-2">Stickers:</h3>
                  <div className="flex space-x-2 overflow-x-auto">
                    {preSavedStickers.map((sticker, index) => (
                      <img
                        key={index}
                        src={sticker}
                        alt={`Sticker ${index + 1}`}
                        className="min-w-10 max-w-md h-10 cursor-pointer"
                        onClick={() => sendMessage({ username, sticker })} // Send sticker on click
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-grow px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm resize-none"
          placeholder="Type your message..."
          rows={1}
        />
        <motion.button
          type="submit"
          disabled={disabled}
          className=" text-blue-400 p-1 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ scale: scaleTransform }}
          whileTap={{ scale: 1.1 }}
        >
          <IoSend size={25} />
        </motion.button>
      </form>
      {recordingError && <p className="text-red-500">{recordingError}</p>}
    </div>
  );
}

export default ChatInput;
