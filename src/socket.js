// src/socket.js
import { io } from "socket.io-client";

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

let currentRoom = null;
let username = null;
let visitorId = null;

const socket = io(SERVER_ORIGIN, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000, // 20 seconds
});

// Handle connection events
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  if (currentRoom && username && visitorId) {
    socket.emit("userReconnected", { username, visitorId, room: currentRoom });
  }
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // The disconnection was initiated by the server, reconnect manually
    socket.connect();
  }
});

// Handle reconnection attempts
socket.on("reconnect_attempt", (attempt) => {
  console.log(`Reconnecting... Attempt #${attempt}`);
});

socket.on("reconnect", (attempt) => {
  console.log(`Reconnected on attempt #${attempt}`);
  if (currentRoom && username && visitorId) {
    socket.emit("userReconnected", { username, visitorId, room: currentRoom });
  }
});

socket.on("reconnect_failed", () => {
  console.error("Reconnection failed");
});

// New event listener for reconnection messages
socket.on("reconnectionMessages", (messages) => {
  // Emit an event that your React components can listen to
  window.dispatchEvent(
    new CustomEvent("reconnectionMessages", { detail: messages })
  );
});

// Function to set current user and room info
const setUserInfo = (room, user, id) => {
  currentRoom = room;
  username = user;
  visitorId = id;
};

// Function to clear user info on logout or room exit
const clearUserInfo = () => {
  currentRoom = null;
  username = null;
  visitorId = null;
};

export { socket, setUserInfo, clearUserInfo };
