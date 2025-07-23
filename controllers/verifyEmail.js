const jwt = require('jsonwebtoken');
const db = require('../config/db'); // adjust path to your DB connection

const EMAIL_SECRET = process.env.EMAIL_SECRET;

const verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, EMAIL_SECRET);
    const userId = decoded.userId;

    // 2. Get user from DB
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];
    if (user.is_verified) {
      return res.status(200).json({ message: 'Email already verified' });
    }

    // 3. Update is_verified to true
    await db.query('UPDATE users SET is_verified = ? WHERE id = ?', [true, userId]);

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyEmail;
