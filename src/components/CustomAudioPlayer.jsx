import React from "react";
import { AudioPlayer } from "react-audio-play";

// Default custom audio player
export function CustomAudioPlayer({ src }) {
  return (
    <div className="custom-audio-player">
      <AudioPlayer
        src={src}
        autoplay={false}
        controls
        loop={false}
        volume={50}
        className="audio-player"
        style={{
          width: "100%",
          maxWidth: "400px",
          minWidth: "300px",
          background: "#1e293b",
          color: "#fff",
          borderRadius: "8px",
          padding: "20px",
        }}
      />
    </div>
  );
}

// Another version of the audio player with different properties
export function MinimalAudioPlayer({ src }) {
  return (
    <div className="custom-audio-player">
      <AudioPlayer
        src={src}
        autoplay={false}
        controls
        loop={false}
        volume={50}
        className="audio-player"
        style={{
          width: "100%",
          maxWidth: "300px", // Reduced max width
          minWidth: "250px", // Reduced min width
          background: "#1e293b",
          color: "#fff",
          borderRadius: "5px", // Reduced border radius
          padding: "10px", // Reduced padding
        }}
      />
    </div>
  );
}
