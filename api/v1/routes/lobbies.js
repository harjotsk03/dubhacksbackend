const express = require("express");
const router = express.Router();
const {
  createLobbyController,
  getLobbyController,
  joinLobbyController,
} = require("../controllers/lobbiesController");

router.post("/create", createLobbyController);
router.get("/all", getLobbyController);
router.post("/:lobbyId/join", joinLobbyController);


module.exports = router;
