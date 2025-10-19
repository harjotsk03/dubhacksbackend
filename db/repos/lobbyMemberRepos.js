const pool = require("../index");

// Insert a user into a lobby
async function addUserToLobby(userId, lobbyId) {
  try {
    const result = await pool.query(
      `INSERT INTO lobby_members (user_id, lobby_id)
   VALUES ($1, $2)
   RETURNING *`,
      [userId, lobbyId]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database error in addUserToLobby:", err);
    throw err;
  }
}

async function removeUserFromLobby(userId, lobbyId) {
  try {
    const result = await pool.query(
      `DELETE FROM lobby_members
       WHERE user_id = $1 AND lobby_id = $2
       RETURNING *`,
      [userId, lobbyId]
    );
    return result.rows[0]; // Returns deleted row info (optional)
  } catch (err) {
    console.error("Database error in removeUserFromLobby:", err);
    throw err;
  }
}

// Optional: get all users in a lobby
async function getLobbyMembers(lobbyId) {
  const result = await pool.query(
    `SELECT *
     FROM lobby_members
     WHERE lobby_id = $1`,
    [lobbyId]
  );
  return result.rows;
}

module.exports = { addUserToLobby, getLobbyMembers, removeUserFromLobby };
