const pool = require("../index");

async function insertLobby() {
  try {
    const result = await pool.query(
      `INSERT INTO lobbies (created_at) VALUES (NOW()) RETURNING *`
    );
    return result.rows[0];
  } catch (error) {
    console.error("Database error in insertLobby:", error);
    throw error;
  }
}

async function getAllLobbies() {
  try {
    const result = await pool.query(`
      SELECT
        l.*,
        COUNT(lm.user_id) AS user_count,
        COALESCE(ARRAY_AGG(lm.user_id) FILTER (WHERE lm.user_id IS NOT NULL), '{}') AS user_ids
      FROM lobbies l
      LEFT JOIN lobby_members lm ON lm.lobby_id = l.id
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `);

    // Convert user_count from string to number
    return result.rows.map((row) => ({
      ...row,
      user_count: parseInt(row.user_count, 10),
      user_ids: row.user_ids || [], // array of user IDs
    }));
  } catch (error) {
    console.error("Database error in getAllLobbies:", error);
    throw error;
  }
}

module.exports = {
  insertLobby,
  getAllLobbies,
};
