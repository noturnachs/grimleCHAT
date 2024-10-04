import React, { useRef, useState, useEffect } from "react";
import YouTube from "react-youtube";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
} from "react-icons/fa";

const Song = ({ ytLink }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTitle, setVideoTitle] = useState(""); // State for storing video title
  const [progress, setProgress] = useState(0); // State for progress
  const [volume, setVolume] = useState(100); // State for volume
  const [videoId, setVideoId] = useState(""); // State for video ID

  // Default YouTube link
  const defaultLink = "https://www.youtube.com/watch?v=GemKqzILV4w";

  // Function to extract video ID from YouTube link
  const extractVideoId = (link) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const match = link.match(regex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const linkToUse = ytLink || defaultLink; // Use provided link or default link
    const id = extractVideoId(linkToUse);
    if (id) {
      setVideoId(id);
    }
  }, [ytLink]);

  // Construct the thumbnail URL using the video ID
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";

  const onReady = (event) => {
    playerRef.current = event.target;
    const videoData = event.target.getVideoData();
    setVideoTitle(videoData.title); // Set the video title
    playerRef.current.setVolume(volume); // Set initial volume
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  // Update progress every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        setProgress((currentTime / duration) * 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume); // Set the volume in the player
    }
  };

  // Determine volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />;
    if (volume < 50) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    const progressBar = e.target;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left; // Get the click position relative to the progress bar
    const newProgress = (offsetX / rect.width) * 100; // Calculate new progress percentage
    setProgress(newProgress);

    const duration = playerRef.current.getDuration();
    playerRef.current.seekTo((newProgress / 100) * duration); // Seek to the new time
  };

  return (
    <div className="flex justify-center items-center h-auto p-4 rounded-lg mb-10 bg-[#15202b]">
      <div className="bg-[#192734] p-4 rounded-lg shadow-md max-w-sm w-full">
        <h2 className="text-xs font-bold  text-center text-white mb-4 ">
          Song of the Day
        </h2>
        <div className="flex items-center mb-2">
          <div className="relative w-24 h-16 rounded-lg overflow-hidden shadow-lg">
            <img
              src={thumbnailUrl}
              alt="Song Thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-white">
              {videoTitle || "Loading..."}
            </h3>
          </div>
        </div>
        <div className="flex justify-center mb-2">
          <button
            onClick={togglePlayPause}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200 flex items-center"
          >
            {isPlaying ? <FaPause /> : <FaPlay />} {/* Play/Pause Icon */}
            <span className="ml-2">{isPlaying ? "Pause" : "Play"}</span>
          </button>
        </div>
        <div
          className="w-full h-2 bg-gray-300 rounded mb-2"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-red-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center mb-2">
          <div className="text-white mr-2">{getVolumeIcon()}</div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
          />
        </div>
        {videoId && (
          <YouTube
            videoId={videoId}
            opts={{
              playerVars: {
                autoplay: 0, // Do not auto-play
                controls: 0, // Hide controls
                modestbranding: 1, // Minimize YouTube branding
                showinfo: 0, // Hide video title and uploader
                rel: 0, // Do not show related videos
                enablejsapi: 1, // Enable JavaScript API
              },
            }}
            onReady={onReady}
            style={{ display: "none" }} // Hide the player
          />
        )}
      </div>
    </div>
  );
};

export default Song;
