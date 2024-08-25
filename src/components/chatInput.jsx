import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { FaMicrophone, FaExclamationTriangle } from "react-icons/fa";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import autosize from "autosize";
import { squircle } from "ldrs";

squircle.register();

function ChatInput({
  sendMessage,
  onEndChat,
  disabled,
  socket,
  room,
  username,
  partnerVisitorId, // Assume you have this from your matching logic
}) {
  const [messageText, setMessageText] = useState("");
  const [confirmEndChat, setConfirmEndChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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
  const scaleTransform = useTransform(scaleSpring, (value) =>
    value > 0 ? 1 + value / 10 : 1
  );

  const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const handleCancel = () => {
    setIsModalOpen(false);
    setReportReason("");
    setScreenshot(null);
    setReportError(null);
    setReportSuccess(null);
  };

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
    if (isRecording && recordedAudio) {
      sendVoiceMessage();
    } else {
      sendMessage(messageText);
      setMessageText("");
    }

    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

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
        audio: {
          sampleRate: 44100, // Set sample rate (44100 Hz is CD quality)
          channelCount: 2, // Stereo recording
          echoCancellation: true, // Optional: Reduce background noise
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm", // You can use "audio/mp3" or others if supported
        audioBitsPerSecond: 128000, // Set bit rate (128 kbps)
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedAudio(event.data);
          setAudioURL(URL.createObjectURL(event.data));
        }
      };

      mediaRecorderRef.current.start();
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

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
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
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }

    // Reset the container height after recording ends
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

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [isTyping, socket, room, username]);

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
      const response = await fetch(`${SERVER_ORIGIN}/api/report-user`, {
        method: "POST",
        body: formData,
      });

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

  const handleScreenshotChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setScreenshot(file);
    }
  };

  return (
    <div
      className="relative p-4 bg-[#192734] w-full md:w-1/2 rounded-lg shadow-md"
      style={{ height: containerHeight }}
    >
      {isRecording || audioURL ? (
        <div className="absolute inset-0 bg-[#141b22] bg-opacity-100 flex flex-col items-center justify-center z-10 p-4 rounded-lg ">
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

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <motion.button
          type="button"
          onClick={handleEndChatClick}
          className="bg-red-500 text-white p-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 h-full"
        >
          {confirmEndChat ? "Confirm" : "End"}
        </motion.button>
        <motion.button
          type="button"
          onClick={startRecording}
          className="text-white p-2 rounded-full transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
        >
          <div
            className={`bg-green-500 w-10 h-10 rounded-full flex items-center justify-center`}
          >
            <FaMicrophone size={24} />
          </div>
        </motion.button>
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
          className="bg-blue-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ scale: scaleTransform }}
          whileTap={{ scale: 1.1 }}
        >
          Send
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 text-white p-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-600"
        >
          <FaExclamationTriangle size={24} />
        </motion.button>
      </form>
      {recordingError && <p className="text-red-500">{recordingError}</p>}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md m-2 w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">Report User</h2>
            {reportError && <p className="text-red-500 mb-4">{reportError}</p>}
            {reportSuccess && (
              <p className="text-green-500 mb-4">{reportSuccess}</p>
            )}
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter the reason for reporting"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg resize-none"
              rows={4}
              disabled={isSubmittingReport} // Disable when submitting
            />

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">
                Attach a screenshot
              </label>
              <div className="flex items-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Choose File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
                {screenshot && (
                  <span className="ml-4 text-gray-300">{screenshot.name}</span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                disabled={isSubmittingReport} // Disable when submitting
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center"
                disabled={isSubmittingReport} // Disable when submitting
              >
                {isSubmittingReport ? (
                  <l-squircle
                    size="20"
                    stroke="3"
                    speed="1.5"
                    color="white"
                    className="mr-2"
                  />
                ) : (
                  "Send Report"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInput;
