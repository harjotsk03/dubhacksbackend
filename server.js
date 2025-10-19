const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

// In your main server.js file, add after the pool require:
const pool = require("./db/index.js");

pool.query("SELECT NOW()")
  .then(res => console.log("✅ Database connected at:", res.rows[0].now))
  .catch(err => console.error("❌ Database connection failed:", err));

// Routes
const userRoutes = require("./api/v1/routes/users");
const lobbyRoutes = require("./api/v1/routes/lobbies");

// Sockets
const lobbySocket = require("./sockets/lobbySockets.js");

const app = express();
app.use(bodyParser.json());

// Mount routes
app.use("/user", userRoutes);
app.use("/lobby", lobbyRoutes);

// Basic test route
app.get("/", (req, res) => res.send("Server is running!"));

// HTTP server
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["polling", "websocket"],
});

// Delegate WebSocket logic to lobbySocket
lobbySocket(io);

server.listen(3004, () => console.log("✅ Server running on port 3004"));
