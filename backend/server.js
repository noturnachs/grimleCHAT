require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
  pingInterval: 25000,
  pingTimeout: 60000,
  reconnect: true,
});

console.log("CLIENT_ORIGIN:", process.env.CLIENT_ORIGIN);
const waitingQueue = [];
let userCount = 0;

app.use(cors());
app.use(express.json());

// Admin password validation endpoint
app.post("/validate-admin", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
io.on("connection", (socket) => {
  console.log("A user connected with socket ID:", socket.id);
  userCount++;
  io.emit("userCountUpdate", userCount);

  socket.on("startMatch", (username) => {
    console.log(
      `User ${username} with socket ID ${socket.id} is looking for a match`
    );

    if (waitingQueue.some((user) => user.socket.id === socket.id)) {
      console.log(`User ${username} is already in the waiting queue`);
      return;
    }

    socket.username = username;
    waitingQueue.push({ socket, username });
    console.log(
      "Current waiting queue:",
      waitingQueue.map((user) => user.username)
    );

    if (waitingQueue.length >= 2) {
      const user1 = waitingQueue.shift();
      const user2 = waitingQueue.shift();
      const room = `room-${user1.username}-${user2.username}`;

      console.log(
        `Matching ${user1.username} and ${user2.username} in room ${room}`
      );

      user1.socket.join(room);
      user2.socket.join(room);

      user1.socket.emit("matchFound", { room, username: user2.username });
      user2.socket.emit("matchFound", { room, username: user1.username });

      console.log(
        `Users ${user1.username} and ${user2.username} have joined room ${room}`
      );
    }
  });

  socket.on("sendMessage", ({ room, message }) => {
    console.log(
      `Message from ${message.username} in room ${room}: ${message.messageText}`
    );
    io.to(room).emit("message", message);
  });

  socket.on("leaveRoom", () => {
    handleLeaveRoom(socket);
  });

  socket.on("leaveQueue", (username) => {
    handleLeaveQueue(socket, username);
  });

  socket.on("disconnect", () => {
    console.log(`User with socket ID ${socket.id} disconnected`);
    handleLeaveRoom(socket);
    userCount--;
    io.emit("userCountUpdate", userCount);
  });

  socket.on("typing", ({ room, username, typing }) => {
    io.to(room).emit("typing", { username, typing });
  });
});

function handleLeaveRoom(socket) {
  const username = socket.username; // Get the username from the socket object
  const rooms = Array.from(socket.rooms);
  const room = rooms.find((r) => r.startsWith("room-"));
  if (room) {
    socket.leave(room);
    io.to(room).emit("message", {
      username: "System",
      messageText: `${username} has left the chat.`,
    });

    const remainingUsers = Array.from(io.sockets.adapter.rooms.get(room) || []);
    if (remainingUsers.length === 1) {
      const remainingUserSocketId = remainingUsers[0];
      const remainingUserSocket = io.sockets.sockets.get(remainingUserSocketId);
      if (remainingUserSocket) {
        remainingUserSocket.emit("userLeft", {
          message: `${username} has left the chat. You are back in the queue.`,
          username: username, // Send the username of the user who left
        });
        remainingUserSocket.leave(room);
        console.log(
          `${username} left the chat. ${remainingUserSocket.username} is back in the queue.`
        );
      }
    }
  }

  for (let i = 0; i < waitingQueue.length; i++) {
    if (waitingQueue[i].socket.id === socket.id) {
      console.log(
        `Removing user ${waitingQueue[i].username} from the waiting queue`
      );
      waitingQueue.splice(i, 1);
      break;
    }
  }
  console.log(
    "Current waiting queue after disconnection:",
    waitingQueue.map((user) => user.username)
  );
}

function handleLeaveQueue(socket, username) {
  for (let i = 0; i < waitingQueue.length; i++) {
    if (waitingQueue[i].socket.id === socket.id) {
      console.log(
        `Removing user ${waitingQueue[i].username} from the waiting queue`
      );
      waitingQueue.splice(i, 1);
      break;
    }
  }
  console.log(
    "Current waiting queue after leaving:",
    waitingQueue.map((user) => user.username)
  );
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
