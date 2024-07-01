// src/socket.js
import { io } from "socket.io-client";

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

const socket = io(SERVER_ORIGIN, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000, // 20 seconds
});

export default socket;
