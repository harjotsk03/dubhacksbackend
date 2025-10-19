const express = require("express");
const router = express.Router();
const {
  createLobbyController,
  getLobbyController,
  joinLobbyController,
  leaveLobbyController,
} = require("../controllers/lobbiesController");

router.post("/create", createLobbyController);
router.get("/all", getLobbyController);
router.post("/:lobbyId/join", joinLobbyController);
router.post("/:lobbyId/leave", leaveLobbyController);


module.exports = router;
