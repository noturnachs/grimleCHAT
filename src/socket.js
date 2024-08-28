// src/socket.js
import { io } from "socket.io-client";

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

const socket = io(SERVER_ORIGIN, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5, // Randomize the delay for reconnection
  timeout: 20000, // 20 seconds
});

// Handle connection events
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // The disconnection was initiated by the server, reconnect manually
    socket.connect();
  }
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`Reconnecting... Attempt #${attempt}`);
});

socket.on("reconnect", (attempt) => {
  console.log(`Reconnected on attempt #${attempt}`);
  // Fetch messages or rejoin room after reconnecting
  if (socket.currentRoom) {
    socket.emit("getMessages", { room: socket.currentRoom });
    // Optionally, emit an event to rejoin the room
    socket.emit("joinRoom", { room: socket.currentRoom });
  }
});

socket.on("reconnect_failed", () => {
  console.error("Reconnection failed");
});

// Handle error events
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Function to set the current room context
export const setCurrentRoom = (room) => {
  socket.currentRoom = room;
};

export default socket;
