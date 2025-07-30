const db = require('../config/db')
const crypto = require('crypto')
const bcrypt = require('bcrypt');

async function resetPassword(req, res) {
  const { token, email, newPassword } = req.body;
   const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (results.length ===0 ) return res.status(400).json({ message: 'Invalid email' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const [resetRecord] = await db.query(
    `SELECT * FROM password_resets WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()`,
    [results[0].id, tokenHash]
  );

  if (!resetRecord.length)
    return res.status(400).json({ message: 'Invalid or expired token' });

  const hashedPassword = await bcrypt.hash(newPassword, 10); // bcrypt or argon2
  await db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, results[0].id]);

  // Cleanup: delete used token
  await db.query(`DELETE FROM password_resets WHERE user_id = ?`, [results[0].id]);

  res.status(200).json({ message: 'Password has been reset' });
}

module.exports = resetPassword;