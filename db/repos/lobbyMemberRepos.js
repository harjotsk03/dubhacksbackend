const pool = require("../index");

// Insert a user into a lobby
async function addUserToLobby(userId, lobbyId) {
  try {
    const result = await pool.query(
      `INSERT INTO lobby_members (user_id, lobby_id, joined_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [userId, lobbyId]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Database error in addUserToLobby:", err);
    throw err;
  }
}

// Optional: get all users in a lobby
async function getLobbyMembers(lobbyId) {
  const result = await pool.query(
    `SELECT lm.*, u.name AS user_name
     FROM lobby_members lm
     JOIN users u ON lm.user_id = u.id
     WHERE lm.lobby_id = $1`,
    [lobbyId]
  );
  return result.rows;
}

module.exports = { addUserToLobby, getLobbyMembers };
