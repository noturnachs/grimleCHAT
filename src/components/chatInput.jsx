import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import {
  FaMicrophone,
  FaImage,
  FaTimes,
  FaPlus,
  FaStar,
  FaSmile,
} from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import autosize from "autosize";
import RecordRTC from "recordrtc";
import imageCompression from "browser-image-compression";
import { GiphyFetch } from "@giphy/js-fetch-api";
import EmojiPicker from "emoji-picker-react";

const giphyFetch = new GiphyFetch("1BhL1pC32fiqXaGE9ckNqzbKYYkgPf3vC"); // Replace with your Giphy API key

function ChatInput({
  sendMessage,
  onEndChat,
  disabled,
  socket,
  room,
  username,
  isImageEnlarged,
  replyTo,
  setReplyTo,
  isReportSidebarOpen,
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
  const replyToRef = useRef(replyTo);
  const [replyPreviewSrc, setReplyPreviewSrc] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerLoaded, setEmojiPickerLoaded] = useState(false);
  const emojiPickerRef = useRef(null);
  const [emojiData, setEmojiData] = useState(null);

  useEffect(() => {
    // Check if emoji data is in local storage
    const cachedEmojiData = localStorage.getItem("emojiData");
    if (cachedEmojiData) {
      setEmojiData(JSON.parse(cachedEmojiData));
      setEmojiPickerLoaded(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiData = (data) => {
    // Save emoji data to local storage
    localStorage.setItem("emojiData", JSON.stringify(data));
    setEmojiData(data);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (!emojiPickerLoaded) {
      setEmojiPickerLoaded(true);
    }
  };

  const onEmojiClick = (emojiObject) => {
    // Ensure the emoji is inserted as a Unicode character
    setMessageText((prevText) => prevText + emojiObject.emoji);
  };

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  useEffect(() => {
    if (replyTo && replyTo.type === "image" && replyTo.preview) {
      if (replyTo.preview instanceof ArrayBuffer) {
        const blob = new Blob([replyTo.preview], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setReplyPreviewSrc(url);
        return () => URL.revokeObjectURL(url);
      } else if (typeof replyTo.preview === "string") {
        setReplyPreviewSrc(replyTo.preview);
      }
    }
  }, [replyTo]);

  useEffect(() => {
    replyToRef.current = replyTo;
  }, [replyTo]);

  const toggleEffects = () => {
    setShowEffects(!showEffects);
  };

  const renderReplyPreview = () => {
    if (!replyTo) return null;

    return (
      <div className="bg-gray-700 p-2 rounded-lg mb-2 text-sm flex items-center">
        {replyTo.type === "image" && replyPreviewSrc && (
          <div className="mr-2 relative">
            <img
              src={replyPreviewSrc}
              alt="Reply preview"
              className="w-16 h-16 object-cover rounded"
            />
            <FaImage
              className="absolute bottom-0 right-0 text-white bg-gray-800 rounded-full p-1"
              size={16}
            />
          </div>
        )}
        <div className="flex-grow">
          <p className="text-gray-400">Replying to {replyTo.username}</p>
          {replyTo.type !== "image" && (
            <p className="text-white">{replyTo.content}</p>
          )}
        </div>
        <button
          onClick={() => {
            setReplyTo(null);
            setReplyPreviewSrc(null);
          }}
          className="text-red-500 ml-2"
        >
          <FaTimes size={16} />
        </button>
      </div>
    );
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

  // const toggleGifPicker = () => {
  //   setShowGifPicker(!showGifPicker);
  //   setGifSearchQuery(""); // Clear the search query when the picker is toggled
  //   if (!showGifPicker) {
  //     fetchGifs(); // Fetch GIFs when the picker is opened
  //   }
  // };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim() || selectedImages.length > 0 || recordedAudio) {
      const replyData = replyTo
        ? {
            id: replyTo.id,
            username: replyTo.username,
            content: replyTo.content,
            type: replyTo.type,
            preview: replyTo.preview,
          }
        : null;

      const newMessage = {
        id: Date.now().toString(), // Generate a unique ID for the message
        username,
        messageText: messageText.trim(),
        images: selectedImages,
        audio: recordedAudio,
        replyTo: replyData,
      };

      sendMessage(newMessage);
      setMessageText("");
      setSelectedImages([]);
      setRecordedAudio(null);
      setReplyTo(null);
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
      className={`relative p-3 pl-2 pr-1 bg-[#192734] w-full md:w-1/2 rounded-lg shadow-md transition-opacity duration-300 ${
        isReportSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ height: containerHeight, zIndex: 1 }}
    >
      {renderReplyPreview()}{" "}
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
        <div className="relative" ref={optionsRef}>
          <motion.button
            type="button"
            onClick={toggleOptions}
            className="text-gray-400 hover:text-gray-300 p-2 rounded-full transition-all duration-200 hover:bg-gray-700/30"
          >
            <FaPlus size={18} />
          </motion.button>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            className="hidden"
            multiple
          />

          {showOptions && (
            <div className="absolute bottom-12 left-0 bg-gray-800/95 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-gray-700/50 min-w-[45px]">
              <div className="flex flex-col gap-3">
                {/* Voice Record Button */}
                <motion.button
                  type="button"
                  onClick={startRecording}
                  className="p-2 text-gray-400 hover:text-gray-200 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaMicrophone size={18} />
                </motion.button>

                {/* Image Upload Button */}
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-200 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaImage size={18} />
                </motion.button>

                {/* GIF Button (Admin only) */}
                {/* {username === "admin" && (
                  <motion.button
                    type="button"
                    onClick={toggleGifPicker}
                    className="p-2 text-gray-400 hover:text-gray-200 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">🎉</span>
                  </motion.button>
                )} */}

                {/* Effects Button (Admin only) */}
                {username === "admin" && (
                  <motion.button
                    type="button"
                    onClick={toggleEffects}
                    className="p-2 text-gray-400 hover:text-gray-200 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎉
                  </motion.button>
                )}
              </div>

              {/* Effects Menu */}
              {showEffects && (
                <div className="absolute left-full bottom-0 ml-2 bg-gray-800/95 backdrop-blur-sm rounded-xl p-2 shadow-xl border border-gray-700/50">
                  <motion.button
                    type="button"
                    onClick={() => handleEffectSelect("confetti")}
                    className="w-full px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Confetti
                  </motion.button>
                </div>
              )}

              {/* GIF Picker */}
              {showGifPicker && (
                <div className="absolute left-full bottom-0 ml-2 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 w-[300px]">
                  <div className="p-3 space-y-3">
                    <input
                      type="text"
                      value={gifSearchQuery}
                      onChange={(e) => {
                        setGifSearchQuery(e.target.value);
                        fetchGifs(e.target.value);
                      }}
                      placeholder="Search GIFs..."
                      className="w-full px-3 py-2 bg-gray-700/50 text-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    />

                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50">
                      {gifs.map((gif) => (
                        <motion.button
                          key={gif.id}
                          onClick={() => handleGifSelect(gif)}
                          className="rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <img
                            src={gif.images.fixed_height.url}
                            alt={gif.title}
                            className="w-full h-auto"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative flex-grow ">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="w-full px-4 py-3 rounded-xl
              bg-gray-800/50 backdrop-blur-sm
              border border-gray-700
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              text-gray-100 placeholder-gray-400
              transition-all duration-200"
              placeholder="Type your message..."
              rows={1}
            />
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="absolute right-2 top-[45%] transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              <FaSmile size={20} />
            </button>
          </div>
          {emojiPickerLoaded && (
            <div
              ref={emojiPickerRef}
              className={`absolute bottom-full right-0 mb-2 z-50 ${
                showEmojiPicker ? "" : "hidden"
              }`}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                lazyLoadEmojis={true}
                emojiStyle="apple"
                autoFocusSearch={false}
                theme="dark"
                preload={true}
                emojiData={emojiData}
                onEmojiDataFetch={handleEmojiData}
              />
            </div>
          )}
        </div>
        <motion.button
          type="submit"
          disabled={disabled}
          className={`
    p-2 rounded-lg transform hover:scale-105
    transition-all duration-200
    disabled:opacity-50 disabled:hover:scale-100
    focus:outline-none focus:ring-2 focus:ring-blue-500/50
    text-blue-400
  `}
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
