const lobbyService = require("../services/lobbyService.js");

async function createLobbyController(req, res) {
  try {
    const lobby = await lobbyService.createLobby();
    res.status(201).json(lobby);
  } catch (err) {
    res.status(500).json({ error: "Internal server error, failed to create lobby" });
  }
}

async function getLobbyController(req, res) {
  try {
    const lobby = await lobbyService.getLobbies();
    res.status(201).json(lobby);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error, failed to create lobby" });
  }
}

module.exports = {
  createLobbyController,
  getLobbyController,
};
