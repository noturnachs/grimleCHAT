const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Or your React app's origin
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected"); // Add this to confirm connections
  socket.on("sendMessage", (message) => {
    io.emit("message", message);
  });
});

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
