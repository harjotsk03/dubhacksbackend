const lobbyRepo = require("../../../db/repos/lobbyRepos.js");

// Helper function to generate lobby ID
function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createLobby() {
  const lobbyId = generateLobbyId();
  const lobby = await lobbyRepo.insertLobby(lobbyId); // Pass the ID
  return { lobby };
}

async function getLobbies() {
  const lobbies = await lobbyRepo.getAllLobbies();
  if (!lobbies) throw new Error("No lobbies!");
  return { lobbies };
}

module.exports = { createLobby, getLobbies };
