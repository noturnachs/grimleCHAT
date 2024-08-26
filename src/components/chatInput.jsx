import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { FaMicrophone } from "react-icons/fa";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import autosize from "autosize";
import RecordRTC from "recordrtc";

function ChatInput({
  sendMessage,
  onEndChat,
  disabled,
  socket,
  room,
  username,
  // Assume you have this from your matching logic
}) {
  const [messageText, setMessageText] = useState("");
  const [confirmEndChat, setConfirmEndChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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
        tracks.forEach((track) => track.stop());
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

      <form onSubmit={handleSubmit} className="flex items-center space-x-1">
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
          className="text-white p-1 transition-transform transform hover:scale-105 focus:outline-none bg-transparent"
        >
          <div className={` w-8 h-10 flex items-center justify-center`}>
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
          className="bg-blue-500 text-white p-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ scale: scaleTransform }}
          whileTap={{ scale: 1.1 }}
        >
          Send
        </motion.button>
      </form>
      {recordingError && <p className="text-red-500">{recordingError}</p>}
    </div>
  );
}

export default ChatInput;
