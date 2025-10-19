const pool = require("../index");

async function insertLobby(lobbyId) {
  try {
    const result = await pool.query(
      `INSERT INTO lobbies (id, created_at) VALUES ($1, NOW()) RETURNING *`,
      [lobbyId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Database error in insertLobby:", error);
    throw error;
  }
}

async function getAllLobbies() {
  const result = await pool.query(
    `SELECT * FROM lobbies ORDER BY created_at DESC`
  );
  return result.rows;
}

module.exports = {
  insertLobby,
  getAllLobbies,
};
