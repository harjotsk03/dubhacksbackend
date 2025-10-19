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

async function joinLobbyController(req, res) {
  try {
    const { lobbyId } = req.params;
    const { userId } = req.body; // frontend must send userId
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const result = await lobbyService.joinLobby(userId, lobbyId);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join lobby" });
  }
}

module.exports = {
  createLobbyController,
  getLobbyController,
  joinLobbyController,
};
