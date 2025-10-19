const express = require("express");
const router = express.Router();
const {
  createLobbyController,
  getLobbyController,
} = require("../controllers/lobbiesController");

router.post("/create", createLobbyController);
router.get("/all", getLobbyController);

module.exports = router;
