const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // <-- import cors

// Database
const pool = require("./db/index.js");

pool
  .query("SELECT NOW()")
  .then((res) => console.log("✅ Database connected at:", res.rows[0].now))
  .catch((err) => console.error("❌ Database connection failed:", err));

// Routes
const userRoutes = require("./api/v1/routes/users");
const lobbyRoutes = require("./api/v1/routes/lobbies");

const app = express();

// Enable CORS for all origins
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Mount routes
app.use("/user", userRoutes);
app.use("/lobby", lobbyRoutes);

// Basic test route
app.get("/", (req, res) => res.send("Server is running!"));

// Start server
app.listen(3004, () => console.log("✅ Server running on port 3004"));
