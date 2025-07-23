const jwt = require("jsonwebtoken");
const db = require("../config/db")

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

async function saveRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );
};

async function removeRefreshToken(token) {
  await db.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
};

async function findRefreshToken(token) {
  const result = await db.query("SELECT * FROM refresh_tokens WHERE token = ?", [token]);
  return result[0];
}

function generateEmailVerificationToken(userId) {
  return jwt.sign({ userId }, process.env.EMAIL_SECRET, { expiresIn: '1d' });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  removeRefreshToken,
  findRefreshToken,
  generateEmailVerificationToken,
};
