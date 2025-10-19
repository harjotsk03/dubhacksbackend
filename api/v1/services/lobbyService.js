const lobbyRepo = require("../../../db/repos/lobbyRepos.js");
const lobbyMembersRepo = require("../../../db/repos/lobbyMemberRepos.js");
// Helper function to generate lobby ID
function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createLobby() {
  const lobbyId = generateLobbyId();
  const lobby = await lobbyRepo.insertLobby(lobbyId);
  return { lobby };
}

async function getLobbies() {
  const lobbies = await lobbyRepo.getAllLobbies();
  if (!lobbies) throw new Error("No lobbies!");
  return { lobbies };
}

async function joinLobby(userId, lobbyId) {
  const membership = await lobbyMembersRepo.addUserToLobby(userId, lobbyId);
  // Optionally return all users in this lobby
  const users = await lobbyMembersRepo.getLobbyMembers(lobbyId);
  return { lobbyId, users };
}


async function leaveLobby(userId, lobbyId) {
  const removed = await lobbyMembersRepo.removeUserFromLobby(userId, lobbyId);
  const users = await lobbyMembersRepo.getLobbyMembers(lobbyId);
  return { lobbyId, users, removed };
}

module.exports = { createLobby, getLobbies, joinLobby, leaveLobby };