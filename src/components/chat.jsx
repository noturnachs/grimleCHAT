import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import userStyles from "./userStyles.json";
import { MinimalAudioPlayer } from "./CustomAudioPlayer";
import { motion } from "framer-motion";
import { FaReply } from "react-icons/fa";
import {
  FaSmile,
  FaHeart,
  FaThumbsUp,
  FaLaugh,
  FaAngry,
  FaSadTear,
  FaSadCry,
} from "react-icons/fa";

import { FaTrash } from "react-icons/fa";

function Chat({
  messages,
  setIsImageEnlarged,
  onReply,
  typingStatus,
  socket,
  room,
  setMessages,
}) {
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

  const [userEffects, setUserEffects] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({
    top: 0,
    left: 0,
  });

  const [verifiedUsers, setVerifiedUsers] = useState(new Set());
  useEffect(() => {
    const fetchVerifiedUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_ORIGIN}/api/verified-users`
        );
        const data = await response.json();
        if (data.verifiedUsers) {
          setVerifiedUsers(new Set(data.verifiedUsers));
        }
      } catch (error) {
        console.error("Error fetching verified users:", error);
      }
    };

    fetchVerifiedUsers();
  }, []);

  const REACTIONS = [
    { emoji: "👍", icon: FaThumbsUp, name: "thumbsup" },
    { emoji: "❤️", icon: FaHeart, name: "heart" },
    { emoji: "😄", icon: FaLaugh, name: "laugh" },
    { emoji: "😢", icon: FaSadTear, name: "sad" },
    { emoji: "😭", icon: FaSadCry, name: "sob" },
    { emoji: "😠", icon: FaAngry, name: "angry" },
  ];

  const handleReaction = (messageId, reaction) => {
    if (socket) {
      socket.emit("messageReaction", {
        room,
        messageId,
        reaction,
        username,
      });
    }
    setShowReactionPicker(null);
  };

  const renderReactions = (reactions) => {
    if (!reactions || Object.keys(reactions).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactions).map(([reaction, users]) => (
          <div
            key={reaction}
            className="bg-gray-700 hover:bg-gray-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title={`${users.join(", ")}`} // Shows users who reacted on hover
          >
            <span>{reaction}</span>
            <span className="text-gray-400">{users.length}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleUnsendMessage = (messageId) => {
    if (socket && room) {
      socket.emit("unsendMessage", { room, messageId });
      // console.log("Unsending message:", messageId); // For debugging
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("messageUnsent", ({ messageId }) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId && !msg.isAdmin && msg.username !== "System"
              ? {
                  ...msg,
                  unsent: true,
                  messageText: "Message unsent",
                  reactions: {},
                  replyTo: null,
                }
              : msg
          )
        );
      });

      return () => {
        socket.off("messageUnsent");
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchUserEffects = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_ORIGIN}/api/user-effects`
        );
        const data = await response.json();
        setUserEffects(data.styles.usernames);
      } catch (error) {
        console.error("Error fetching user effects:", error);
      }
    };

    fetchUserEffects();
  }, []);

  // Update the sparkleGlowAnimation with reduced glow intensity
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
    text-shadow: 0 0 2px #ffd700, 0 0 4px #ffd700;
  }
  50% { 
    text-shadow: 0 0 2px #ffd700, 0 0 6px #ffd700;
  }
}

@keyframes glowPurple {
  0%, 100% { 
    text-shadow: 0 0 2px #c27eff, 0 0 4px #c27eff;
  }
  50% { 
    text-shadow: 0 0 2px #c27eff, 0 0 6px #c27eff;
  }
}

@keyframes glowPink {
  0%, 100% { 
    text-shadow: 0 0 2px #ff69b4, 0 0 4px #ff69b4;
  }
  50% { 
    text-shadow: 0 0 2px #ff69b4, 0 0 6px #ff69b4;
  }
}

@keyframes glowLightBlue {
  0%, 100% { 
    text-shadow: 0 0 2px #87CEEB, 0 0 4px #87CEEB;
  }
  50% { 
    text-shadow: 0 0 2px #87CEEB, 0 0 6px #87CEEB;
  }
}

@keyframes glowEmerald {
  0%, 100% { text-shadow: 0 0 2px #50C878, 0 0 4px #50C878; }
  50% { text-shadow: 0 0 2px #3CB371, 0 0 6px #3CB371; }
}

@keyframes glowSunset {
  0%, 100% { text-shadow: 0 0 2px #FF6B6B, 0 0 4px #FF6B6B; }
  50% { text-shadow: 0 0 2px #FFB88C, 0 0 6px #FFB88C; }
}

@keyframes glowOcean {
  0%, 100% { text-shadow: 0 0 2px #00B4DB, 0 0 4px #00B4DB; }
  50% { text-shadow: 0 0 2px #0083B0, 0 0 6px #0083B0; }
}

@keyframes glowNeon {
  0%, 100% { text-shadow: 0 0 2px #FF1493, 0 0 4px #FF1493; }
  50% { text-shadow: 0 0 2px #00FF00, 0 0 6px #00FF00; }
}

@keyframes glowGalaxy {
  0%, 100% { text-shadow: 0 0 2px #663399, 0 0 4px #663399; }
  50% { text-shadow: 0 0 2px #BC13FE, 0 0 6px #BC13FE; }
}

@keyframes glowFire {
  0%, 100% { text-shadow: 0 0 2px #FF4500, 0 0 4px #FF4500; }
  50% { text-shadow: 0 0 2px #FFA500, 0 0 6px #FFA500; }
}

@keyframes glowArctic {
  0%, 100% { text-shadow: 0 0 2px #A5F2F3, 0 0 4px #A5F2F3; }
  50% { text-shadow: 0 0 2px #D7FFFE, 0 0 6px #D7FFFE; }
}

@keyframes glowRainbow {
  0%, 100% { 
    text-shadow: 0 0 2px #ff0000, 0 0 4px #ff0000;
  }
  25% { 
    text-shadow: 0 0 2px #00ff00, 0 0 4px #00ff00;
  }
  50% { 
    text-shadow: 0 0 2px #0000ff, 0 0 4px #0000ff;
  }
  75% { 
    text-shadow: 0 0 2px #ff00ff, 0 0 4px #ff00ff;
  }
}
`;

  const getSpecialStyle = (style) => {
    // Define the styles object
    const styles = {
      gold: {
        gradient: "linear-gradient(90deg, #ffd700, #fff6a9, #ffd700)",
        sparkleColor: "#ffd700",
        glowAnimation:
          "shine 3s linear infinite, glowGold 2s ease-in-out infinite",
      },
      purple: {
        gradient: "linear-gradient(90deg, #c27eff, #e2bdff, #c27eff)",
        sparkleColor: "#ffd700", // Gold stars for purple style
        glowAnimation:
          "shine 3s linear infinite, glowPurple 2s ease-in-out infinite",
      },
      pink: {
        gradient: "linear-gradient(90deg, #ff69b4, #ffb6c1, #ff69b4)",
        sparkleColor: "#ffd700", // Yellow stars
        glowAnimation:
          "shine 3s linear infinite, glowPink 2s ease-in-out infinite",
      },
      lightblue: {
        gradient: "linear-gradient(90deg, #87CEEB, #B0E2FF, #87CEEB)",
        sparkleColor: "#ffd700", // Yellow stars
        glowAnimation:
          "shine 3s linear infinite, glowLightBlue 2s ease-in-out infinite",
      },
      rainbow: {
        gradient:
          "linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff)",
        sparkleColor: "#ffd700", // White stars for rainbow style
        glowAnimation:
          "rainbow 3s linear infinite, glowRainbow 4s ease-in-out infinite",
      },
      emerald: {
        gradient: "linear-gradient(90deg, #50C878, #3CB371, #50C878)",
        sparkleColor: "#98FF98",
        glowAnimation:
          "shine 3s linear infinite, glowEmerald 2s ease-in-out infinite",
      },
      sunset: {
        gradient: "linear-gradient(90deg, #FF6B6B, #FFB88C, #FF6B6B)",
        sparkleColor: "#FFD700",
        glowAnimation:
          "shine 3s linear infinite, glowSunset 2s ease-in-out infinite",
      },
      ocean: {
        gradient: "linear-gradient(90deg, #00B4DB, #0083B0, #00B4DB)",
        sparkleColor: "#87CEEB",
        glowAnimation:
          "shine 3s linear infinite, glowOcean 2s ease-in-out infinite",
      },
      neon: {
        gradient: "linear-gradient(90deg, #FF1493, #00FF00, #FF1493)",
        sparkleColor: "#FFFFFF",
        glowAnimation:
          "shine 3s linear infinite, glowNeon 2s ease-in-out infinite",
      },
      galaxy: {
        gradient: "linear-gradient(90deg, #663399, #BC13FE, #663399)",
        sparkleColor: "#E6E6FA",
        glowAnimation:
          "shine 3s linear infinite, glowGalaxy 2s ease-in-out infinite",
      },
      fire: {
        gradient: "linear-gradient(90deg, #FF4500, #FFA500, #FF4500)",
        sparkleColor: "#FFD700",
        glowAnimation:
          "shine 3s linear infinite, glowFire 2s ease-in-out infinite",
      },
      arctic: {
        gradient: "linear-gradient(90deg, #A5F2F3, #D7FFFE, #A5F2F3)",
        sparkleColor: "#FFFFFF",
        glowAnimation:
          "shine 3s linear infinite, glowArctic 2s ease-in-out infinite",
      },
    };

    // Return the style or a default style if not found
    return styles[style] || styles.gold;
  };

  const renderUsername = (messageUsername, isAdmin) => {
    const style = userEffects[messageUsername.toLowerCase()];

    if (style) {
      const styleConfig = getSpecialStyle(style);
      return (
        <>
          <style>{sparkleGlowAnimation}</style>
          <div className="flex items-center gap-1">
            <span className="relative inline-block">
              {/* Sparkle elements */}
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

            {/* Verified badge */}
            {verifiedUsers.has(messageUsername) && (
              <svg
                className="w-3.5 h-3.5 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
                title="Verified User"
              >
                <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
              </svg>
            )}
          </div>
        </>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <span>{messageUsername}</span>
        {verifiedUsers.has(messageUsername) && (
          <svg
            className="w-3.5 h-3.5 text-blue-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            title="Verified User"
          >
            <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
          </svg>
        )}
      </div>
    );
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
  // ... existing code ...

  const processMessageText = (text) => {
    if (text.includes("<strong>") || text.includes("</strong>")) {
      return text;
    }

    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Regex patterns for different platforms
    const patterns = {
      spotify: {
        playlist: /https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
        track: /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
        album: /https:\/\/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/,
      },
      facebook: {
        post: /https?:\/\/(?:www\.)?facebook\.com\/share\/(?:p|v)\/([a-zA-Z0-9_-]+)/,
        video:
          /https?:\/\/(?:www\.)?facebook\.com\/(?:watch\/\?v=|video\.php\?v=)(\d+)/,
      },
      youtube: {
        video:
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
        shorts:
          /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
      },
      twitter: /https?:\/\/twitter\.com\/\w+\/status\/(\d+)/,
      soundcloud: /https?:\/\/soundcloud\.com\/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)/,
      instagram:
        /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/,
      tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    };

    const facebookMatch =
      text.match(patterns.facebook.post) || text.match(patterns.facebook.video);
    if (facebookMatch) {
      const postId = facebookMatch[1];
      return generateFacebookEmbed(postId, text);
    }

    // Check for matches
    // Spotify Playlist
    const spotifyPlaylistMatch = text.match(patterns.spotify.playlist);
    if (spotifyPlaylistMatch) {
      const playlistId = spotifyPlaylistMatch[1];
      return generateSpotifyEmbed("playlist", playlistId, text);
    }

    // Spotify Track
    const spotifyTrackMatch = text.match(patterns.spotify.track);
    if (spotifyTrackMatch) {
      const trackId = spotifyTrackMatch[1];
      return generateSpotifyEmbed("track", trackId, text);
    }

    // Spotify Album
    const spotifyAlbumMatch = text.match(patterns.spotify.album);
    if (spotifyAlbumMatch) {
      const albumId = spotifyAlbumMatch[1];
      return generateSpotifyEmbed("album", albumId, text);
    }

    // YouTube
    const youtubeMatch =
      text.match(patterns.youtube.video) || text.match(patterns.youtube.shorts);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return generateYouTubeEmbed(videoId, text);
    }

    // Twitter/X
    const twitterMatch = text.match(patterns.twitter);
    if (twitterMatch) {
      const tweetId = twitterMatch[1];
      return generateTwitterEmbed(tweetId, text);
    }

    // SoundCloud
    const soundcloudMatch = text.match(patterns.soundcloud);
    if (soundcloudMatch) {
      const track = soundcloudMatch[1];
      return generateSoundCloudEmbed(track, text);
    }

    // Instagram
    const instagramMatch = text.match(patterns.instagram);
    if (instagramMatch) {
      const postId = instagramMatch[1];
      return generateInstagramEmbed(postId, text);
    }

    // TikTok
    const tiktokMatch = text.match(patterns.tiktok);
    if (tiktokMatch) {
      const videoId = tiktokMatch[1];
      return generateTikTokEmbed(videoId, text);
    }

    // Handle regular URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = escapedText.split(urlRegex);
    return parts
      .map((part) => {
        if (part.match(urlRegex)) {
          return generateDefaultLinkPreview(part);
        }
        return part;
      })
      .join("");
  };

  // Add the Facebook embed generator function
  const generateFacebookEmbed = (postId, originalUrl) => `
<div class="facebook-preview bg-[#282828] p-3 rounded-lg mt-2">
  <div class="flex items-center gap-2 mb-2">
    <svg class="w-6 h-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    <span class="text-white font-medium">Facebook Post</span>
  </div>
  <div class="facebook-embed rounded bg-white">
    <div class="fb-post" 
      data-href="https://www.facebook.com/share/p/${postId}"
      data-width="500"
      data-show-text="true">
    </div>
    <script async defer src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2"></script>
  </div>
</div>
${generateDefaultLinkPreview(originalUrl)}
`;

  const generateTwitterEmbed = (tweetId, originalUrl) => `
  <div class="twitter-preview bg-[#282828] p-3 rounded-lg mt-2">
    <div class="flex items-center gap-2 mb-2">
      <svg class="w-6 h-6 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
      <span class="text-white font-medium">Twitter Post</span>
    </div>
    <div class="twitter-embed rounded bg-black p-2">
      <blockquote class="twitter-tweet" data-conversation="none">
        <a href="https://twitter.com/i/status/${tweetId}"></a>
      </blockquote>
      <script async src="https://platform.twitter.com/widgets.js"></script>
    </div>
  </div>
  ${generateDefaultLinkPreview(originalUrl)}
`;

  const generateInstagramEmbed = (postId, originalUrl) => `
  <div class="instagram-preview bg-[#282828] p-3 rounded-lg mt-2">
    <div class="flex items-center gap-2 mb-2">
      <svg class="w-6 h-6 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
      </svg>
      <span class="text-white font-medium">Instagram Post</span>
    </div>
    <div class="instagram-embed rounded bg-white">
      <blockquote 
        class="instagram-media" 
        data-instgrm-permalink="https://www.instagram.com/p/${postId}/"
        data-instgrm-version="14"
        style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%;"
      >
      </blockquote>
      <script async src="//www.instagram.com/embed.js"></script>
    </div>
  </div>
  ${generateDefaultLinkPreview(originalUrl)}
`;

  const generateTikTokEmbed = (videoId, originalUrl) => `
  <div class="tiktok-preview bg-[#282828] p-3 rounded-lg mt-2">
    <div class="flex items-center gap-2 mb-2">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-5.394 10.692 6.33 6.33 0 1010.857-4.424V8.687a8.182 8.182 0 004.773 1.526V6.79a4.831 4.831 0 01-1.003-.104z"/>
      </svg>
      <span class="text-white font-medium">TikTok Video</span>
    </div>
    <div class="tiktok-embed rounded">
      <blockquote 
        class="tiktok-embed" 
        cite="https://www.tiktok.com/@username/video/${videoId}"
        data-video-id="${videoId}"
        style="max-width: 605px;min-width: 325px;"
      >
      </blockquote>
      <script async src="https://www.tiktok.com/embed.js"></script>
    </div>
  </div>
  ${generateDefaultLinkPreview(originalUrl)}
`;

  // Helper functions to generate embeds
  const generateSpotifyEmbed = (type, id, originalUrl) => `
    <div class="spotify-preview bg-[#282828] p-3 rounded-lg mt-2">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-6 h-6 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        <span class="text-white font-medium">Spotify ${
          type.charAt(0).toUpperCase() + type.slice(1)
        }</span>
      </div>
      <iframe 
        src="https://open.spotify.com/embed/${type}/${id}" 
        width="100%" 
        height="80" 
        frameborder="0" 
        allowtransparency="true" 
        allow="encrypted-media"
        class="rounded"
      ></iframe>
    </div>
    ${generateDefaultLinkPreview(originalUrl)}
  `;

  const generateYouTubeEmbed = (videoId, originalUrl) => `
    <div class="youtube-preview bg-[#282828] p-3 rounded-lg mt-2">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
        <span class="text-white font-medium">YouTube Video</span>
      </div>
      <div class="relative pb-[56.25%] h-0">
        <iframe 
          class="absolute top-0 left-0 w-full h-full rounded"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
    ${generateDefaultLinkPreview(originalUrl)}
  `;

  const generateSoundCloudEmbed = (track, originalUrl) => `
    <div class="soundcloud-preview bg-[#282828] p-3 rounded-lg mt-2">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-6 h-6 text-[#ff5500]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.102-.1m-.899-1.574c-.074 0-.118.068-.127.146l-.183 3.682.183 3.635c.009.08.053.146.127.146.075 0 .119-.066.128-.146l.201-3.635-.201-3.682c-.009-.08-.053-.146-.128-.146m8.24 4.007c-.057-.057-.132-.093-.215-.093-.082 0-.157.036-.214.093-.057.057-.093.132-.093.214v3.929c0 .132.034.259.093.372.055.112.142.203.243.267.1.064.21.098.326.098.057 0 .113-.007.168-.022.056-.014.107-.035.154-.061.046-.027.088-.059.126-.098.037-.038.068-.081.093-.126.024-.045.043-.093.054-.143.012-.049.018-.099.018-.15v-3.929c0-.082-.036-.157-.093-.214m-2.732.015c-.055-.059-.13-.094-.215-.094-.084 0-.16.035-.215.094-.059.054-.093.13-.093.214v3.929c0 .083.034.158.093.214.055.057.13.093.215.093.084 0 .16-.036.215-.093.059-.056.093-.131.093-.214v-3.929c0-.084-.034-.16-.093-.214"/>
        </svg>
        <span class="text-white font-medium">SoundCloud Track</span>
      </div>
      <iframe 
        width="100%" 
        height="166" 
        scrolling="no" 
        frameborder="no" 
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${track}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
        class="rounded"
      ></iframe>
    </div>
    ${generateDefaultLinkPreview(originalUrl)}
  `;

  const generateDefaultLinkPreview = (url) => `
    <a href="${url}" class="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 mt-1" onclick="return false;">
      ${url}
      <span class="inline-block">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/>
        </svg>
      </span>
    </a>
  `;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReactionPicker && !event.target.closest("button")) {
        setShowReactionPicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReactionPicker]);

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

  // Add this useEffect to handle reaction updates
  useEffect(() => {
    if (socket) {
      socket.on("messageReactionUpdate", ({ messageId, reactions }) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, reactions } : msg
          )
        );
      });

      return () => {
        socket.off("messageReactionUpdate");
      };
    }
  }, [socket]);

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
              } relative group`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => handleTouchStart(index)}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex-col relative">
                {!message.unsent && ( // Only show username if message is not unsent
                  <div className={`${isSender ? "text-right" : "text-left"}`}>
                    <span
                      className="font-normal"
                      style={{
                        ...getUsernameStyles(message.username),
                      }}
                    >
                      {renderUsername(message.username, isAdmin)}{" "}
                    </span>
                  </div>
                )}
                {message.replyTo && (
                  <div
                    className="bg-gray-900 p-2 rounded-lg mb-1 text-sm cursor-pointer"
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

                {message.unsent ? (
                  <div className="p-2 max-w-xs">
                    <p className="text-gray-500 italic text-sm">
                      Message unsent
                    </p>
                  </div>
                ) : message.images && message.images.length > 0 ? (
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
                    className={`flex ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* bg-[#D4A5A5] */}
                    <div
                      className={`p-2 inline-block max-w-xs  ${
                        isAdmin
                          ? "bg-[#8C9A76] text-white rounded-xl "
                          : isSender
                          ? "rounded-[20px] rounded-br-[4px] " // Sender message
                          : "rounded-[20px] rounded-bl-[4px]" // Receiver message
                      }`}
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
                            : getMessageStyles(message.username, isSender)
                                .color,
                        }}
                      />
                    </div>
                  </div>
                )}
                {message.reactions && renderReactions(message.reactions)}
              </div>
              {showReplyButton === index && !message.unsent && (
                <div
                  className={`flex items-center ${
                    isSender ? "ml-2" : "mr-2"
                  } gap-2`}
                >
                  {/* Reply button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleReply(message)}
                    className="text-gray-500 hover:text-blue-500 p-1 rounded-full"
                  >
                    <FaReply size={13} />
                  </motion.button>

                  {/* Unsend button */}
                  {isSender && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => handleUnsendMessage(message.id)}
                      className="text-gray-500 hover:text-red-500 p-1 rounded-full"
                    >
                      <FaTrash size={13} />
                    </motion.button>
                  )}

                  {/* Reaction button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setReactionPickerPosition({
                        top: rect.top - 40, // Position above the button
                        left: isSender ? rect.left - 150 : rect.left, // Adjust based on sender/receiver
                      });
                      setShowReactionPicker(message.id);
                    }}
                    className="text-gray-500 hover:text-yellow-500 p-1 rounded-full"
                  >
                    <FaSmile size={13} />
                  </motion.button>

                  {/* Reaction Picker */}
                  {showReactionPicker === message.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{
                        position: "absolute",
                        top: "-40px", // Position above the message
                        right: isSender ? "0" : "auto",
                        left: isSender ? "auto" : "0",
                        zIndex: 1000,
                      }}
                      className="bg-gray-800 rounded-full px-2 py-1 flex gap-1 shadow-lg border border-gray-700"
                    >
                      {REACTIONS.map((reaction) => (
                        <button
                          key={reaction.name}
                          onClick={() =>
                            handleReaction(message.id, reaction.emoji)
                          }
                          className="hover:bg-gray-700 p-1.5 rounded-full transition-colors"
                        >
                          {reaction.emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
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
          <button
            onClick={() => {
              setEnlargedImages([]);
              setIsImageEnlarged(false);
            }}
            className="absolute top-4 right-4 z-[1001] text-white bg-red-600 rounded-full p-2 hover:bg-red-700 transition-all"
            aria-label="Close image view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
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
