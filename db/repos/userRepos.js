const pool = require("../index");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected at:", res.rows[0].now);
  }
});

async function insertUser({ full_name, email, password, account_type }) {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password, account_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [full_name, email, password, account_type]
  );
  return result.rows[0];
}

async function getUserBy(type, value) {
  const result = await pool.query(
    `SELECT id, full_name, email, created_at, account_type FROM users WHERE ${type} = $1`,
    [value]
  );
  return result.rows[0];
}


async function getAllUsers() {
  const result = await pool.query(
    `SELECT id, full_name, email, created_at, account_type FROM users`
  );
  return result.rows;
}

module.exports = {
  insertUser,
  getUserBy,
  getAllUsers,
};