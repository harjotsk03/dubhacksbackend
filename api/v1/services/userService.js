const bcrypt = require("bcrypt");
const userRepo = require("../../../db/repos/userRepos");
const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  const payload = { id: user.id, email: user.email, full_name: user.full_name };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(user) {
  const payload = { id: user.id };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}
async function createUser({ full_name, email, password_raw, account_type }) {
  console.log("1. Starting createUser");

  const existing = await userRepo.getUserBy("email", email);
  console.log("2. Checked existing user:", existing);

  if (existing) throw { code: "23505" };

  console.log("3. Hashing password");
  const password = await bcrypt.hash(password_raw, 12);
  console.log("4. Password hashed");

  console.log("5. Inserting user into DB");
  const user = await userRepo.insertUser({
    full_name,
    email,
    password,
    account_type,
  });
  console.log("6. User inserted:", user);

  console.log("7. Generating access token");
  const accessToken = generateAccessToken(user);
  console.log("8. Access token generated");

  console.log("9. Generating refresh token");
  const refreshToken = generateRefreshToken(user);
  console.log("10. Refresh token generated");

  return { user, accessToken, refreshToken };
}

async function loginUser({ email, password_raw }) {
  const user = await userRepo.getUserBySecure("email", email);
  if (!user) throw new Error("Invalid email or password");

  const isValid = await bcrypt.compare(password_raw, user.password);
  if (!isValid) throw new Error("Invalid email or password");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { password, ...userClean } = user;

  return { user: userClean, accessToken, refreshToken };
}

async function getAllUsers() {
  const users = await userRepo.getAllUsers();
  if (!users) throw new Error("No users!");

  return { users };
}

module.exports = { createUser, loginUser, getAllUsers };
