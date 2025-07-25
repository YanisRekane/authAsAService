const jwt = require('jsonwebtoken');
const db = require('../config/db');

const ACCESS_SECRET = process.env.JWT_SECRET;

const verifyAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];


    if (!token) {
      return res.status(401).json({ message: 'Access token missing' });
    }

    const decoded = jwt.verify(token, ACCESS_SECRET);

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!rows.length) {
      console.log('User not found in DB');
      return res.status(401).json({ message: 'User not found' });
    }

    const user = rows[0];

    if (!user.is_verified) {
        return res.status(403).json({ message: 'Email not verified' });
    }

    req.user = {
      id: decoded.userId,
      email:user.email,
      role: user.role || 'user',
      is_verified: user.is_verified
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

module.exports = verifyAccessToken;
